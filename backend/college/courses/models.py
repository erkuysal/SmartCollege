from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError

from college.departments.models import Department  # Import Department for ForeignKey relation
from academics.enrollment.models import AcademicTerm  # Updated import for AcademicTerm model


class Course(models.Model):
    code = models.CharField(max_length=20, unique=True, help_text="Unique course code (e.g., CS101)")
    name = models.CharField(max_length=255, help_text="Course name (e.g., Introduction to Programming)")
    department = models.ForeignKey(Department, on_delete=models.CASCADE, help_text="Department offering this course")
    credits = models.PositiveIntegerField(default=3, help_text="Number of credit hours for the course")
    semester = models.CharField(max_length=50, null=True, blank=True, help_text="Semester when the course is offered (e.g., Fall, Spring)")
    description = models.TextField(null=True, blank=True, help_text="Brief description of the course")
    is_active = models.BooleanField(default=True, help_text="Is this course currently offered?")
    created_at = models.DateTimeField(auto_now_add=True, help_text="Course creation timestamp")
    updated_at = models.DateTimeField(auto_now=True, help_text="Course last updated timestamp")
    prerequisites = models.ManyToManyField('self', symmetrical=False, blank=True, help_text="Prerequisite courses")

    def __str__(self):
        return f"{self.code} - {self.name}"

    def clean(self):
        # Validate prerequisites don't include the course itself
        if self.pk and self.prerequisites.filter(pk=self.pk).exists():
            raise ValidationError("A course cannot be its own prerequisite.")
        super().clean()

    class Meta:
        ordering = ['code']
        indexes = [
            models.Index(fields=['department', 'is_active']),
            models.Index(fields=['code']),
        ]


class CoursePackage(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="course_packages")
    semester = models.IntegerField(help_text="Semester this package applies to")
    courses = models.ManyToManyField(Course, related_name="included_in_packages")

    class Meta:
        unique_together = ('department', 'semester')  # Ensure one package per semester per department
        ordering = ['semester']
        indexes = [
            models.Index(fields=['department', 'semester']),
        ]

    def __str__(self):
        return f"{self.department.name} - Semester {self.semester}"


class CourseSection(models.Model):
    """
    Represents a specific section of a course in a given academic term.
    Multiple sections can exist for a single course.
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="sections")
    section_number = models.CharField(max_length=10, help_text="Section identifier (e.g., A, B, 001)")
    academic_term = models.ForeignKey(AcademicTerm, on_delete=models.CASCADE, related_name="course_sections",
                                      help_text="The academic term this section is offered in")
    capacity = models.PositiveIntegerField(help_text="Maximum number of students")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['course', 'section_number', 'academic_term'],
                name='unique_course_section_in_term'
            )
        ]
        ordering = ['course__code', 'section_number']
        indexes = [
            models.Index(fields=['academic_term', 'is_active']),
            models.Index(fields=['course', 'academic_term']),
        ]

    def __str__(self):
        return f"{self.course.code} - Section {self.section_number} ({self.academic_term})"

    def clean(self):
        # Validate capacity
        if self.capacity <= 0:
            raise ValidationError("Section capacity must be greater than zero.")
        super().clean()


class SectionAssignment(models.Model):
    """
    Represents the assignment of a course section to a specific room and time slot.
    This is the result of the timetabling algorithm.
    """
    section = models.ForeignKey(CourseSection, on_delete=models.CASCADE, related_name="assignments")
    room = models.ForeignKey('classrooms.Classroom', on_delete=models.CASCADE, related_name="section_assignments")
    timeslot = models.ForeignKey('schedules.TimeSlot', on_delete=models.CASCADE, related_name="section_assignments")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['section', 'timeslot'],
                name='unique_section_timeslot'
            ),
            models.UniqueConstraint(
                fields=['room', 'timeslot'],
                name='unique_room_timeslot'
            )
        ]
        ordering = ['section__course__code', 'section__section_number']
        indexes = [
            models.Index(fields=['section']),
            models.Index(fields=['room', 'timeslot']),
        ]

    def __str__(self):
        return f"{self.section} - {self.room} - {self.timeslot}"


