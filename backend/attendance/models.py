from django.db import models
from django.utils import timezone
from users.models import BaseUser
from django.utils.translation import gettext_lazy as _
from datetime import timedelta


class CourseStreak(models.Model):
    """
    Tracks weekly attendance streaks for each student in each course
    """
    student = models.ForeignKey(
        BaseUser,
        on_delete=models.CASCADE,
        related_name='course_streaks',
        limit_choices_to={'user_type': 'student'}
    )
    course = models.ForeignKey(
        'Course',
        on_delete=models.CASCADE,
        related_name='student_streaks'
    )
    current_streak = models.PositiveIntegerField(default=0, help_text="Current consecutive weekly attendance streak")
    longest_streak = models.PositiveIntegerField(default=0, help_text="Longest weekly attendance streak achieved")
    last_attendance_week = models.DateField(null=True, blank=True, help_text="Start date of the last week with attendance")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-current_streak']

    def __str__(self):
        return f"{self.student} - {self.course} (Streak: {self.current_streak})"

    def update_streak(self, attendance_date):
        """
        Update the streak based on weekly attendance
        """
        # Get the current course offering
        current_offering = self.course.get_current_offering()
        if not current_offering:
            return  # No active offering, can't update streak

        # Get the start of the week (Monday) for the attendance date
        current_week_start = attendance_date - timedelta(days=attendance_date.weekday())
        
        # Get all class schedules for this course offering
        schedules = current_offering.schedules.filter(is_active=True)
        
        # Check if student attended any scheduled session this week
        attended_this_week = False
        for schedule in schedules:
            if schedule.get_weekly_attendance_status(self.student, current_week_start):
                attended_this_week = True
                break
        
        if not attended_this_week:
            return  # Don't update streak if no attendance this week
        
        if self.last_attendance_week:
            # Check if this is the next week after the last attendance
            expected_next_week = self.last_attendance_week + timedelta(days=7)
            
            if current_week_start == expected_next_week:
                # Consecutive week
                self.current_streak += 1
            elif current_week_start > expected_next_week:
                # Week(s) missed, reset streak
                self.current_streak = 1
            # If current_week_start < expected_next_week, it's the same week, do nothing
        else:
            # First attendance
            self.current_streak = 1

        # Update longest streak if current streak is longer
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak

        self.last_attendance_week = current_week_start
        self.save()

    def get_multiplier(self):
        """
        Get the current streak multiplier
        """
        if self.current_streak >= 20:
            return 2.5
        elif self.current_streak >= 10:
            return 2.0
        elif self.current_streak >= 5:
            return 1.5
        return 1.0

    def get_weekly_attendance_summary(self, week_start_date):
        """
        Get a summary of attendance for a specific week
        """
        week_end_date = week_start_date + timedelta(days=6)
        
        # Get the current course offering
        current_offering = self.course.get_current_offering()
        if not current_offering:
            return None
        
        # Get all schedules for this course offering
        schedules = current_offering.schedules.filter(is_active=True)
        
        summary = {
            'week_start': week_start_date,
            'week_end': week_end_date,
            'scheduled_sessions': 0,
            'attended_sessions': 0,
            'sessions': []
        }
        
        for schedule in schedules:
            # Get all sessions for this schedule in the given week
            sessions = AttendanceSession.objects.filter(
                course=self.course,
                start_time__date__range=[week_start_date, week_end_date]
            )
            
            for session in sessions:
                summary['scheduled_sessions'] += 1
                attended = session.attendance_records.filter(student=self.student).exists()
                if attended:
                    summary['attended_sessions'] += 1
                
                summary['sessions'].append({
                    'date': session.start_time.date(),
                    'time': session.start_time.time(),
                    'attended': attended
                })
        
        return summary


class Course(models.Model):
    """
    Represents a course that users can attend.
    - code: Course code (e.g., "CS101")
    - name: Full course name (e.g., "Introduction to Computer Science")
    - description: Optional course description
    - instructor: Foreign key to Lecturer user
    - is_active: Whether the course is currently active
    """
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    instructor = models.ForeignKey(
        BaseUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='teaching_courses',
        limit_choices_to={'user_type': 'lecturer'}
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"

    def get_or_create_streak(self, student):
        """
        Get or create a CourseStreak for a student
        """
        streak, created = CourseStreak.objects.get_or_create(
            student=student,
            course=self
        )
        return streak

    def get_current_offering(self):
        """
        Get the current active course offering for this course
        """
        from academic.models import CourseOffering
        return CourseOffering.objects.filter(
            course=self,
            is_active=True,
            semester__is_active=True
        ).first()

    def get_registered_students(self):
        """
        Get all students currently registered for this course
        """
        from academic.models import CourseRegistration
        return BaseUser.objects.filter(
            id__in=CourseRegistration.objects.approved_for_course(self).values_list('student_id', flat=True)
        )

    def can_student_attend(self, student):
        """
        Check if a student can attend this course
        """
        from academic.models import CourseRegistration
        return CourseRegistration.objects.filter(
            student=student,
            course_offering__course=self,
            course_offering__is_active=True,
            status='approved'
        ).exists()


class AttendanceSession(models.Model):
    """
    A window of time during which users can tap their cards to be marked present.
    - name: optional label (e.g. "Calculus 101 – 2025-06-10 09:00")
    - course: the course this attendance session belongs to
    - class_schedule: the class schedule this session is based on
    - start_time: when scanning begins
    - end_time: when scanning ends; if null, the session is still open.
    """
    name = models.CharField(max_length=200, blank=True)
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='attendance_sessions'
    )
    class_schedule = models.ForeignKey(
        'academic.ClassSchedule',
        on_delete=models.SET_NULL,
        null=True,
        related_name='attendance_sessions'
    )
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        if self.end_time:
            return f"{self.name} ({self.start_time:%Y-%m-%d %H:%M} – {self.end_time:%Y-%m-%d %H:%M})"
        return f"{self.name} (open since {self.start_time:%Y-%m-%d %H:%M})"

    @property
    def is_active(self):
        return self.end_time is None or self.end_time > timezone.now()

    class Meta:
        ordering = ["-start_time"]

    def get_course_offering(self):
        """
        Get the course offering this session belongs to
        """
        if self.class_schedule:
            return self.class_schedule.course_offering
        return self.course.get_current_offering()

    def get_semester(self):
        """
        Get the semester this session belongs to
        """
        course_offering = self.get_course_offering()
        if course_offering:
            return course_offering.semester
        return None

    def can_student_attend(self, student):
        """
        Check if a student can attend this session
        """
        return self.course.can_student_attend(student)

    def create_attendance_record(self, student):
        """
        Create an attendance record for a student
        """
        if not self.can_student_attend(student):
            raise ValueError("Student is not registered for this course")

        if not self.is_active:
            raise ValueError("Attendance session is not active")

        # Check if student already has an attendance record
        if self.attendance_records.filter(student=student).exists():
            raise ValueError("Student already marked present for this session")

        # Create the attendance record
        record = AttendanceRecord.objects.create(
            student=student,
            session=self
        )

        # Update the student's streak
        streak = self.course.get_or_create_streak(student)
        streak.update_streak(record.timestamp.date())

        return record


class AttendanceRecord(models.Model):
    """
    Each time a user taps their card during a session, we record it here.
    - student: which Student user
    - session: which AttendanceSession
    - timestamp: when the tap actually happened
    - points_earned: points earned for this attendance record
    """
    student = models.ForeignKey(
        BaseUser,
        on_delete=models.CASCADE,
        related_name='attendance_records',
        limit_choices_to={'user_type': 'student'}
    )
    session = models.ForeignKey(
        AttendanceSession,
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )
    timestamp = models.DateTimeField(default=timezone.now)
    points_earned = models.PositiveIntegerField(default=0, help_text="Points earned for this attendance")

    class Meta:
        unique_together = ("student", "session")
        constraints = [
            models.UniqueConstraint(fields=["student", "session"], name="unique_student_session_attendance"),
        ]
        ordering = ["timestamp"]

    def __str__(self):
        return f"{self.student.user_number} @ {self.timestamp:%Y-%m-%d %H:%M:%S} (Session {self.session_id})"

    def save(self, *args, **kwargs):
        """
        Calculate and add points when attendance is recorded
        """
        if not self.pk:  # Only on creation
            from wallet.models import ActivityType, MultiplierRule
            
            # Get or create the attendance activity type
            attendance_activity, _ = ActivityType.objects.get_or_create(
                name='Attendance',
                defaults={
                    'description': 'Points earned for attending class',
                    'base_points': 10
                }
            )
            
            # Get the student instance
            student = self.student.student
            
            # Update course streak
            course_streak = self.session.course.get_or_create_streak(student)
            course_streak.update_streak(self.timestamp.date())
            
            # Get or create streak multiplier rule
            streak_multiplier, _ = MultiplierRule.objects.get_or_create(
                name='Weekly Attendance Streak',
                condition_type='streak',
                defaults={
                    'description': 'Multiplier based on weekly attendance streak',
                    'multiplier': course_streak.get_multiplier(),
                    'condition_value': {
                        'streak_thresholds': {
                            5: 1.5,   # 1.5x for 5-week streak
                            10: 2.0,  # 2.0x for 10-week streak
                            20: 2.5   # 2.5x for 20-week streak
                        }
                    }
                }
            )
            
            # Update multiplier based on current streak
            streak_multiplier.multiplier = course_streak.get_multiplier()
            streak_multiplier.save()
            
            # Add points to wallet
            wallet = student.get_wallet()
            points = wallet.add_points(
                points=attendance_activity.base_points,
                activity_type=attendance_activity,
                multiplier_rule=streak_multiplier,
                reference_id=str(self.session.id),
                description=f"Attendance for {self.session.course.code} (Week {course_streak.current_streak})"
            )
            self.points_earned = points if points is not None else 0
        else:
            # Defensive: ensure points_earned is never None
            if self.points_earned is None:
                self.points_earned = 0
        super().save(*args, **kwargs)


class Classroom(models.Model):
    """
    Represents a physical classroom
    """
    name = models.CharField(max_length=64, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Schedule(models.Model):
    """
    DEPRECATED: Use academic.ClassSchedule instead.
    This model is kept for backward compatibility and will be removed in a future version.
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

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='legacy_schedules')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='legacy_schedules')
    day = models.CharField(max_length=9, choices=DayOfWeek.choices)
    time_slot = models.PositiveSmallIntegerField(choices=TIME_SLOTS)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    start_date = models.DateField(help_text="Start date of the schedule")
    end_date = models.DateField(help_text="End date of the schedule")
    session_duration = models.PositiveSmallIntegerField(
        default=30,
        help_text="Duration of each session in minutes"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('day', 'time_slot', 'classroom')
        ordering = ['day', 'time_slot', 'classroom']
        verbose_name = "Legacy Schedule"
        verbose_name_plural = "Legacy Schedules"

    def __str__(self):
        return f"{self.course} - {self.day} {self.get_time_slot_display()}"

    def save(self, *args, **kwargs):
        """
        Override save to warn about deprecation
        """
        import warnings
        warnings.warn(
            "The Schedule model is deprecated. Please use academic.ClassSchedule instead.",
            DeprecationWarning,
            stacklevel=2
        )
        super().save(*args, **kwargs)