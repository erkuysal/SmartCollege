from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.apps import apps

from users.students.models import Student


class AcademicTerm(models.Model):
    """
    Represents an academic term (e.g., Fall 2025, Spring 2026).
    Centralizes semester information to ensure consistency.
    """
    TERM_CHOICES = [
        ('Fall', 'Fall'),
        ('Spring', 'Spring'),
        ('Summer', 'Summer'),
    ]
    
    name = models.CharField(max_length=50, help_text="Term name (e.g., 'Fall 2025')")
    term = models.CharField(max_length=20, choices=TERM_CHOICES, help_text="Term (Fall, Spring, Summer)")
    academic_year = models.CharField(max_length=20, help_text="Academic year (e.g., '2024-2025')")
    start_date = models.DateField(help_text="Term start date")
    end_date = models.DateField(help_text="Term end date")
    registration_start = models.DateField(help_text="Registration start date")
    registration_end = models.DateField(help_text="Registration end date")
    is_active = models.BooleanField(default=False, help_text="Whether this term is currently active")
    
    class Meta:
        unique_together = ('term', 'academic_year')
        ordering = ['-academic_year', 'term']
        indexes = [
            models.Index(fields=['term', 'academic_year']),
            models.Index(fields=['is_active']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_date__gt=models.F('start_date')),
                name='end_date_after_start_date'
            ),
            models.CheckConstraint(
                check=models.Q(registration_end__gt=models.F('registration_start')),
                name='registration_end_after_start'
            ),
        ]
    
    def __str__(self):
        return self.name
    
    def clean(self):
        # Validate that term dates make sense
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValidationError("End date must be after start date")
        
        if self.registration_start and self.registration_end and self.registration_start >= self.registration_end:
            raise ValidationError("Registration end date must be after registration start date")
        
        # Validate that registration period is before or overlaps with term
        if self.registration_end and self.start_date and self.registration_end > self.start_date:
            raise ValidationError("Registration should end before or at term start date")
        
        # Check for overlapping active terms
        if self.is_active:
            overlapping_active = AcademicTerm.objects.filter(
                is_active=True
            ).exclude(id=self.id)
            
            if overlapping_active.exists():
                raise ValidationError("Only one term can be active at a time")
        
        super().clean()
    
    def save(self, *args, **kwargs):
        # Auto-generate name if it doesn't exist
        if not self.name:
            self.name = f"{self.term} {self.academic_year}"
        
        self.full_clean()
        super().save(*args, **kwargs)


class Enrollment(models.Model):
    """
    Represents a student's enrollment in a specific course section.
    Tracks enrollment status and registration information.
    """
    STATUS_CHOICES = [
        ('registered', 'Registered'),
        ('dropped', 'Dropped'),
        ('passed', 'Passed'),
        ('failed', 'Failed'),
        ('incomplete', 'Incomplete'),
        ('waitlisted', 'Waitlisted'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="enrollments")
    section = models.ForeignKey('courses.CourseSection', on_delete=models.CASCADE, related_name="enrollments")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='registered')
    date_enrolled = models.DateTimeField(default=timezone.now, help_text="Date of enrollment")
    date_status_changed = models.DateTimeField(auto_now=True, help_text="Date of last status change")
    grade = models.CharField(max_length=5, blank=True, null=True, help_text="Final grade if completed")
    notes = models.TextField(blank=True, null=True, help_text="Additional notes about enrollment")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'section'],
                name='unique_student_section_enrollment'
            ),
            models.CheckConstraint(
                check=models.Q(date_enrolled__lte=timezone.now()),
                name='enrollment_date_not_future'
            )
        ]
        ordering = ['-date_enrolled']
        indexes = [
            models.Index(fields=['section', 'status']),
            models.Index(fields=['student', 'status']),
        ]

    def __str__(self):
        return f"{self.student.user.username} enrolled in {self.section} [{self.status}]"

    def clean(self):
        # Check if section is full
        if self.status == 'registered':
            current_count = Enrollment.objects.filter(
                section=self.section,
                status='registered'
            ).exclude(id=self.id if self.id else 0).count()
            
            # Get CourseSection through apps to avoid circular import
            CourseSection = apps.get_model('courses', 'CourseSection')
            section = CourseSection.objects.get(id=self.section.id)
            
            if current_count >= section.capacity:
                raise ValidationError("Course section is full")

        # Check prerequisites - modify to use apps.get_model
        Course = apps.get_model('courses', 'Course')
        section_course = Course.objects.get(id=self.section.course.id)
        
        if not self.student.has_completed_prerequisites(section_course):
            raise ValidationError("Prerequisites not met")
            
        # Validate grade format if provided
        if self.grade and self.status in ['passed', 'failed']:
            # Check if grade format is valid (e.g., A, B+, C-, F, etc.)
            valid_grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'I', 'W']
            if self.grade not in valid_grades:
                raise ValidationError(f"Invalid grade format. Must be one of: {', '.join(valid_grades)}")
                
        super().clean()
        
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

