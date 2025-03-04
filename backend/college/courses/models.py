from django.db import models

from college.departments.models import Department  # Import Department for ForeignKey relation


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

    class Meta:
        ordering = ['code']


class CoursePackage(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="course_packages")
    semester = models.IntegerField(help_text="Semester this package applies to")
    courses = models.ManyToManyField(Course, related_name="included_in_packages")

    class Meta:
        unique_together = ('department', 'semester')  # Ensure one package per semester per department
        ordering = ['semester']

    def __str__(self):
        return f"{self.department.name} - Semester {self.semester}"


