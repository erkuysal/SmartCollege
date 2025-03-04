from django.db import models
from college.faculties.models import Faculty


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True, help_text="Department name")
    faculty = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True, blank=True, related_name='departments', help_text="Faculty to which this department belongs")
    head_of_department = models.CharField(max_length=100, help_text="Name of the department head", null=True, blank=True)
    office_location = models.CharField(max_length=255, help_text="Office location of the department", null=True, blank=True)
    is_active = models.BooleanField(default=True, help_text="Is this department currently active?")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
