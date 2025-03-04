from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
# from django.apps import apps  # ✅ Import apps to resolve models dynamically
from college.facilities.models import Facility  # Direct import (No circular dependency)
from college.courses.models import Course  # Direct import (No circular dependency)


class TimeSlot(models.Model):
    """Represents a time slot in the weekly schedule"""
    DAYS_OF_WEEK = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ['day_of_week', 'start_time', 'end_time']

    def __str__(self):
        return f"{self.get_day_of_week_display()} {self.start_time}-{self.end_time}"


class Schedule(models.Model):
    """Represents a course schedule in a classroom"""
    classroom = models.ForeignKey(
        'classrooms.Classroom',  # Updated from 'college.Classroom'
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    course = models.ForeignKey(
        'courses.Course',  # Updated from 'college.Course'
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    time_slot = models.ForeignKey(
        TimeSlot,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    semester = models.CharField(max_length=50)
    academic_year = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['classroom', 'time_slot', 'semester', 'academic_year']

    def validate_lecturer_availability(self):
        """Check if lecturer is available"""
        conflicts = Schedule.objects.filter(
            course__lecturers__lecturer__in=self.course.lecturers.all(),
            time_slot=self.time_slot,
            semester=self.semester,
            academic_year=self.academic_year,
            is_active=True
        ).exclude(id=self.id)
        
        if conflicts.exists():
            raise ValidationError("Lecturer has a scheduling conflict")

    def clean(self):
        super().clean()
        self.validate_lecturer_availability()
        self._validate_classroom_availability()
        self._validate_user_conflicts()

    def _validate_classroom_availability(self):
        """Check if classroom is available at this time slot"""
        conflicts = Schedule.objects.filter(
            classroom=self.classroom,
            time_slot=self.time_slot,
            semester=self.semester,
            academic_year=self.academic_year,
            is_active=True
        )
        if conflicts.exists():
            raise ValidationError('Classroom is already booked for this time slot')

    def _validate_user_conflicts(self):
        """Check for conflicts with users' existing schedules"""
        # Get all users (students and lecturers) involved in this course
        from academics.enrollment.models import Enrollment
        from academics.bindings.models import LecturerCourse

        enrolled_students = Enrollment.objects.filter(
            course=self.course,
            semester=self.semester,
            academic_year=self.academic_year
        ).values_list('student', flat=True)

        assigned_lecturers = LecturerCourse.objects.filter(
            course=self.course,
            semester=self.semester,
            academic_year=self.academic_year
        ).values_list('lecturer', flat=True)

        # Check for student conflicts
        student_conflicts = Schedule.objects.filter(
            course__enrollments__student__in=enrolled_students,
            time_slot=self.time_slot,
            semester=self.semester,
            academic_year=self.academic_year,
            is_active=True
        )
        if student_conflicts.exists():
            raise ValidationError('One or more students have a scheduling conflict')

        # Check for lecturer conflicts
        lecturer_conflicts = Schedule.objects.filter(
            course__lecturers__lecturer__in=assigned_lecturers,
            time_slot=self.time_slot,
            semester=self.semester,
            academic_year=self.academic_year,
            is_active=True
        )
        if lecturer_conflicts.exists():
            raise ValidationError('One or more lecturers have a scheduling conflict')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.course} - {self.classroom} - {self.time_slot}"