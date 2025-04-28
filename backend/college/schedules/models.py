from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.apps import apps
from college.facilities.models import Facility
from college.courses.models import Course, CourseSection
from academics.enrollment.models import AcademicTerm


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
        constraints = [
            models.UniqueConstraint(
                fields=['day_of_week', 'start_time', 'end_time'],
                name='unique_timeslot'
            )
        ]
        indexes = [
            models.Index(fields=['day_of_week']),
        ]
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        return f"{self.get_day_of_week_display()} {self.start_time}-{self.end_time}"
        
    def clean(self):
        # Validate that end time is after start time
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError("End time must be after start time")
        super().clean()
        
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Schedule(models.Model):
    """Represents a course section schedule in a classroom"""
    classroom = models.ForeignKey(
        'classrooms.Classroom',
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    section = models.ForeignKey(
        CourseSection,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    time_slot = models.ForeignKey(
        TimeSlot,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True, help_text="Additional scheduling notes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['classroom', 'time_slot', 'section'],
                condition=models.Q(is_active=True),
                name='unique_active_classroom_timeslot_section'
            ),
            models.UniqueConstraint(
                fields=['section', 'time_slot'],
                condition=models.Q(is_active=True),
                name='unique_active_section_timeslot'
            )
        ]
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['classroom', 'time_slot']),
            models.Index(fields=['section']),
        ]

    def clean(self):
        if not self.id:  # Only run these validations on creation
            self._validate_lecturer_availability()
            self._validate_classroom_availability()
            self._validate_student_conflicts()
        super().clean()

    def _validate_lecturer_availability(self):
        """Check if lecturer is available"""
        # Get lecturers for this section
        LecturerCourse = apps.get_model('bindings', 'LecturerCourse')
        
        section_lecturers = LecturerCourse.objects.filter(
            section=self.section
        ).values_list('lecturer', flat=True)
        
        # Check if any lecturer has a conflict
        lecturer_conflicts = Schedule.objects.filter(
            section__lecturer_assignments__lecturer__in=section_lecturers,
            time_slot=self.time_slot,
            is_active=True
        ).exclude(id=self.id if self.id else 0)
        
        if lecturer_conflicts.exists():
            raise ValidationError("One or more lecturers have a scheduling conflict")

    def _validate_classroom_availability(self):
        """Check if classroom is available at this time slot"""
        conflicts = Schedule.objects.filter(
            classroom=self.classroom,
            time_slot=self.time_slot,
            is_active=True
        ).exclude(id=self.id if self.id else 0)
        
        if conflicts.exists():
            raise ValidationError('Classroom is already booked for this time slot')
            
    def _validate_student_conflicts(self):
        """Check for student scheduling conflicts"""
        # Get all enrolled students for this section
        Enrollment = apps.get_model('enrollment', 'Enrollment')
        
        enrolled_students = Enrollment.objects.filter(
            section=self.section,
            status='registered'
        ).values_list('student', flat=True)
        
        # Check if any students have conflicts
        student_conflicts = Schedule.objects.filter(
            section__enrollments__student__in=enrolled_students,
            section__enrollments__status='registered',
            time_slot=self.time_slot,
            is_active=True
        ).exclude(id=self.id if self.id else 0)
        
        if student_conflicts.exists():
            raise ValidationError('One or more students have a scheduling conflict')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.section} - {self.classroom} - {self.time_slot}"


class ScheduleConstraint(models.Model):
    """
    Represents a scheduling constraint for a particular entity
    (such as a lecturer, student, room, etc.)
    """
    CONSTRAINT_TYPES = [
        ('LECTURER', 'Lecturer Constraint'),
        ('ROOM', 'Room Constraint'),
        ('STUDENT', 'Student Constraint'),
        ('DEPARTMENT', 'Department Constraint'),
    ]
    
    constraint_type = models.CharField(max_length=20, choices=CONSTRAINT_TYPES)
    reference_id = models.IntegerField(help_text="ID of the entity this constraint applies to")
    
    # Constraint can be specific to a timeslot
    time_slot = models.ForeignKey(
        TimeSlot,
        on_delete=models.CASCADE,
        related_name='constraints',
        null=True,
        blank=True
    )
    
    # Or it can be a day/time range
    day_of_week = models.IntegerField(choices=TimeSlot.DAYS_OF_WEEK, null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    
    # Constraint can be an unavailability or a preference
    is_unavailable = models.BooleanField(default=True, 
                                        help_text="If True, entity cannot be scheduled during this time")
    preference_weight = models.IntegerField(default=0, 
                                          help_text="For preferred times: higher means stronger preference")
    
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['constraint_type', 'reference_id']),
            models.Index(fields=['day_of_week']),
        ]
    
    def clean(self):
        # Validate that if using day/time range, start_time is before end_time
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError("End time must be after start time")
            
        # Either time_slot OR day/start/end must be specified
        if self.time_slot is None and (self.day_of_week is None or self.start_time is None or self.end_time is None):
            raise ValidationError("Either specify a time_slot or a day/start_time/end_time combination")
            
        # Cannot specify both
        if self.time_slot is not None and (self.day_of_week is not None or self.start_time is not None or self.end_time is not None):
            raise ValidationError("Cannot specify both time_slot and day/time range")
        
        super().clean()
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
        
    def __str__(self):
        entity_type = self.get_constraint_type_display().split()[0]
        if self.time_slot:
            return f"{entity_type} constraint ({self.reference_id}): {self.time_slot}"
        else:
            day = dict(TimeSlot.DAYS_OF_WEEK).get(self.day_of_week, "Unknown")
            return f"{entity_type} constraint ({self.reference_id}): {day} {self.start_time}-{self.end_time}"