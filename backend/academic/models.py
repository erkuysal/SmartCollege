from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from attendance.models import Course, Classroom
from users.models import BaseUser
from datetime import timedelta
from dateutil.rrule import rrulestr
from datetime import datetime


class AcademicYear(models.Model):
    """
    Represents an academic year (e.g., 2023-2024)
    """
    YEAR_CHOICES = [
        (f"{year}-{year+1}", f"{year}-{year+1}")
        for year in range(2020, 2031)  # 10 years range
    ]

    year = models.CharField(
        max_length=9,
        choices=YEAR_CHOICES,
        unique=True,
        help_text="Academic year in format YYYY-YYYY"
    )
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-year']

    def __str__(self):
        return self.year

    def save(self, *args, **kwargs):
        # Ensure only one academic year is active
        if self.is_active:
            AcademicYear.objects.exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)


class Semester(models.Model):
    """
    Represents a semester within an academic year
    """
    SEMESTER_TYPES = [
        ('fall', 'Fall'),
        ('spring', 'Spring'),
        ('summer', 'Summer'),
    ]

    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='semesters'
    )
    semester_type = models.CharField(max_length=10, choices=SEMESTER_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    registration_start = models.DateField(help_text="Start date for course registration")
    registration_end = models.DateField(help_text="End date for course registration")
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('academic_year', 'semester_type')
        ordering = ['-start_date']
        verbose_name = "Semester"
        verbose_name_plural = "Semesters"

    def __str__(self):
        return f"{self.get_semester_type_display()} {self.academic_year.year}"

    def save(self, *args, **kwargs):
        # Ensure only one semester is active
        if self.is_active:
            Semester.objects.exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)

    @property
    def is_registration_open(self):
        now = timezone.now().date()
        return self.registration_start <= now <= self.registration_end

    @property
    def full_name(self):
        """Returns the full semester name in format: Fall 2023-2024"""
        return f"{self.get_semester_type_display()} {self.academic_year.year}"


class CourseOffering(models.Model):
    """
    Represents a course offering in a specific semester
    """
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='offerings'
    )
    semester = models.ForeignKey(
        Semester,
        on_delete=models.CASCADE,
        related_name='course_offerings'
    )
    instructor = models.ForeignKey(
        BaseUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='teaching_offerings',
        limit_choices_to={'user_type': 'lecturer'}
    )
    capacity = models.PositiveIntegerField(default=30)
    enrolled_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('course', 'semester')
        ordering = ['course__code']

    def __str__(self):
        return f"{self.course.code} - {self.semester}"

    @property
    def is_full(self):
        return self.enrolled_count >= self.capacity

    def get_available_slots(self):
        return self.capacity - self.enrolled_count

    def get_enrollment_status(self):
        if self.is_full:
            return "Full"
        percentage = (self.enrolled_count / self.capacity) * 100
        if percentage >= 80:
            return "Almost Full"
        return "Available"

    def enroll_student(self, student):
        """
        Enroll a student in this course offering
        """
        if not self.is_full and self.is_active:
            self.course.students.add(student)
            self.enrolled_count += 1
            self.save()
            return True
        return False

    def unenroll_student(self, student):
        """
        Unenroll a student from this course offering
        """
        if student in self.course.students.all():
            self.course.students.remove(student)
            self.enrolled_count -= 1
            self.save()
            return True
        return False


class CourseRegistrationManager(models.Manager):
    def approved_for_course(self, course):
        return self.filter(
            course_offering__course=course,
            course_offering__is_active=True,
            status='approved'
        ).select_related('student').only('student')


class CourseRegistration(models.Model):
    """
    Handles student course registrations for a semester
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('dropped', 'Dropped'),
        ('completed', 'Completed')
    ]

    student = models.ForeignKey(
        BaseUser,
        on_delete=models.CASCADE,
        related_name='course_registrations',
        limit_choices_to={'user_type': 'student'}
    )
    course_offering = models.ForeignKey(
        CourseOffering,
        on_delete=models.CASCADE,
        related_name='registrations'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    registration_date = models.DateTimeField(auto_now_add=True)
    approval_date = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        BaseUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_registrations',
        limit_choices_to={'user_type': 'lecturer'}
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CourseRegistrationManager()

    class Meta:
        unique_together = ('student', 'course_offering')
        indexes = [
            models.Index(fields=['course_offering', 'status']),
            models.Index(fields=['student', 'course_offering', 'status']),
        ]
        ordering = ['-registration_date']

    def __str__(self):
        return f"{self.student} - {self.course_offering} ({self.get_status_display()})"

    def approve(self, approver):
        """
        Approve the registration
        """
        if self.status != 'pending':
            raise ValueError("Only pending registrations can be approved")

        if not self.course_offering.is_full:
            self.status = 'approved'
            self.approval_date = timezone.now()
            self.approved_by = approver
            self.save()

            # Add student to course
            self.course_offering.course.students.add(self.student)
            self.course_offering.enrolled_count += 1
            self.course_offering.save()
        else:
            raise ValueError("Course is full")

    def reject(self, approver, reason=''):
        """
        Reject the registration
        """
        if self.status != 'pending':
            raise ValueError("Only pending registrations can be rejected")

        self.status = 'rejected'
        self.approval_date = timezone.now()
        self.approved_by = approver
        self.notes = reason
        self.save()

    def drop(self):
        """
        Drop the course
        """
        if self.status not in ['approved', 'pending']:
            raise ValueError("Only approved or pending registrations can be dropped")

        self.status = 'dropped'
        self.save()

        # Remove student from course if they were enrolled
        if self.status == 'approved':
            self.course_offering.course.students.remove(self.student)
            self.course_offering.enrolled_count -= 1
            self.course_offering.save()

    def complete(self):
        """
        Mark the course as completed
        """
        if self.status != 'approved':
            raise ValueError("Only approved registrations can be completed")

        self.status = 'completed'
        self.save()

    @property
    def can_register(self):
        """
        Check if the student can register for this course
        """
        # Check if registration is open
        if not self.course_offering.semester.is_registration_open:
            return False

        # Check if course is full
        if self.course_offering.is_full:
            return False

        # Check if student is already registered
        if CourseRegistration.objects.filter(
            student=self.student,
            course_offering__semester=self.course_offering.semester,
            status__in=['pending', 'approved']
        ).exists():
            return False

        return True


class ClassSchedule(models.Model):
    """
    Represents a class schedule for a course offering
    """
    class DayOfWeek(models.TextChoices):
        MON = 'Monday', _('Monday')
        TUE = 'Tuesday', _('Tuesday')
        WED = 'Wednesday', _('Wednesday')
        THU = 'Thursday', _('Thursday')
        FRI = 'Friday', _('Friday')

    TIME_SLOTS = [
        (1,  '08:00 - 08:30'),
        (2,  '08:30 - 09:00'),
        (3,  '09:00 - 09:30'),
        (4,  '09:30 - 10:00'),
        (5,  '10:00 - 10:30'),
        (6,  '10:30 - 11:00'),
        (7,  '11:00 - 11:30'),
        (8,  '11:30 - 12:00'),
        (9,  '12:00 - 12:30'),
        (10, '12:30 - 13:00'),
        (11, '13:00 - 13:30'),
        (12, '13:30 - 14:00'),
        (13, '14:00 - 14:30'),
        (14, '14:30 - 15:00'),
        (15, '15:00 - 15:30'),
        (16, '15:30 - 16:00'),
        (17, '16:00 - 16:30'),
        (18, '16:30 - 17:00'),
        (19, '17:00 - 17:30'),
        (20, '17:30 - 18:00'),
    ]

    course_offering = models.ForeignKey(
        CourseOffering,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    classroom = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE,
        related_name='academic_schedules'
    )
    day = models.CharField(max_length=9, choices=DayOfWeek.choices)
    time_slot = models.PositiveSmallIntegerField(choices=TIME_SLOTS)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    recurrence_rule = models.CharField(max_length=128, blank=True, help_text="Recurrence rule, e.g. 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE'")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('course_offering', 'day', 'time_slot')
        ordering = ['day', 'time_slot']

    def __str__(self):
        slot = dict(self.TIME_SLOTS)[self.time_slot]
        return f"{self.course_offering} — {self.day} {slot}"

    def check_conflicts(self):
        """
        Check if this schedule conflicts with any existing schedules
        """
        # Check classroom conflicts
        classroom_conflicts = ClassSchedule.objects.filter(
            day=self.day,
            time_slot=self.time_slot,
            classroom=self.classroom,
            is_active=True
        ).exclude(pk=self.pk)

        # Check course offering conflicts (same instructor)
        instructor_conflicts = ClassSchedule.objects.filter(
            day=self.day,
            time_slot=self.time_slot,
            course_offering__instructor=self.course_offering.instructor,
            is_active=True
        ).exclude(pk=self.pk)

        return classroom_conflicts.exists() or instructor_conflicts.exists()

    def get_time_slot_times(self):
        """
        Get the start and end times for this time slot
        """
        slot_start = dict(self.TIME_SLOTS)[self.time_slot].split(' - ')[0]
        slot_end = dict(self.TIME_SLOTS)[self.time_slot].split(' - ')[1]
        return slot_start, slot_end

    def create_attendance_session(self, date):
        """
        Create an attendance session for this schedule on the given date
        """
        from datetime import datetime, time
        from attendance.models import AttendanceSession

        # Check if the date is within semester period
        semester = self.course_offering.semester
        if not (semester.start_date <= date <= semester.end_date):
            return None

        # Check if the date matches the schedule's day of week
        if date.strftime('%A') != self.day:
            return None

        # Get the time slot times
        slot_start, slot_end = self.get_time_slot_times()
        
        # Create start and end times
        start_time = datetime.combine(date, time.fromisoformat(slot_start))
        end_time = datetime.combine(date, time.fromisoformat(slot_end))

        # Create the attendance session
        session = AttendanceSession.objects.create(
            name=f"{self.course_offering.course.code} - {date.strftime('%Y-%m-%d')}",
            course=self.course_offering.course,
            start_time=start_time,
            end_time=end_time
        )

        return session

    def create_semester_sessions(self):
        """
        Create attendance sessions for all weeks in the semester
        """
        from datetime import timedelta

        semester = self.course_offering.semester
        start_date = semester.start_date
        end_date = semester.end_date

        # Get the day of week as integer (0 = Monday, 4 = Friday)
        day_index = list(dict(self.DayOfWeek.choices).keys()).index(self.day)

        # Create sessions for each week
        current_date = start_date
        while current_date <= end_date:
            # Adjust to the correct day of week
            while current_date.weekday() != day_index:
                current_date += timedelta(days=1)
                if current_date > end_date:
                    break

            if current_date <= end_date:
                self.create_attendance_session(current_date)
                current_date += timedelta(days=7)  # Move to next week

    def save(self, *args, **kwargs):
        """
        Override save to handle schedule updates
        """
        is_new = self.pk is None
        super().save(*args, **kwargs)

        # If this is a new schedule, create initial attendance sessions
        if is_new:
            self.create_semester_sessions()

    def generate_future_sessions(self, start_date=None, end_date=None):
        """
        Generate AttendanceSession instances based on recurrence_rule.
        """
        if not self.recurrence_rule:
            return []
        # Use the schedule's start_date and end_date if not provided
        if start_date is None:
            start_date = self.start_date
        if end_date is None:
            end_date = self.end_date
        # Parse the recurrence rule
        rule = rrulestr(self.recurrence_rule, dtstart=datetime.combine(start_date, self.start_time))
        sessions = []
        for dt in rule.between(datetime.combine(start_date, self.start_time), datetime.combine(end_date, self.end_time), inc=True):
            # Create AttendanceSession if not already exists
            session, created = AttendanceSession.objects.get_or_create(
                class_schedule=self,
                start_time=dt,
                defaults={
                    'course': self.course_offering.course,
                    'name': f"{self.course_offering.course.code} - {dt.strftime('%Y-%m-%d %H:%M')}",
                    'end_time': dt + timedelta(minutes=self.duration_minutes)
                }
            )
            sessions.append(session)
        return sessions
