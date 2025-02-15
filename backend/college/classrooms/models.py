from django.db import models
from django.utils import timezone

from college.facilities.models import Facility
from college.departments.models import Department
from college.schedules.models import Schedule  # Import Schedule model


class Classroom(models.Model):
    name = models.CharField(max_length=100, unique=True, help_text="Unique name of the classroom")
    capacity = models.PositiveIntegerField(help_text="Maximum number of students the classroom can hold")
    building = models.CharField(max_length=100, help_text="Building where the classroom is located", null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, help_text="Department that owns the classroom")
    facility = models.ForeignKey(Facility, on_delete=models.SET_NULL, null=True, blank=True, help_text="Facility where the classroom is located")
    has_projector = models.BooleanField(default=False, help_text="Does the classroom have a projector?")
    has_whiteboard = models.BooleanField(default=True, help_text="Does the classroom have a whiteboard?")
    is_active = models.BooleanField(default=True, help_text="Is this classroom currently in use?")
    created_at = models.DateTimeField(auto_now_add=True, help_text="When the classroom was added")
    updated_at = models.DateTimeField(auto_now=True, help_text="When the classroom was last updated")

    def is_in_use(self):
        """Check if the classroom is currently in use based on the schedule."""
        now = timezone.now()
        return Schedule.objects.filter(
            classroom=self,
            start_time__lte=now,
            end_time__gte=now,
            status='Scheduled'
        ).exists()

    def __str__(self):
        return f"{self.name} ({self.capacity} seats)"

    class Meta:
        ordering = ['name']