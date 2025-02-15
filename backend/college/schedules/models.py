from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.apps import apps  # ✅ Import apps to resolve models dynamically
from college.facilities.models import Facility  # Direct import (No circular dependency)
from college.courses.models import Course  # Direct import (No circular dependency)


class Schedule(models.Model):
    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    classroom = models.ForeignKey(
        "classrooms.Classroom",  # ✅ Use string reference instead of direct import
        on_delete=models.SET_NULL,
        null=True, blank=True,
        help_text="Classroom where the session will take place"
    )

    facility = models.ForeignKey(
        Facility, on_delete=models.SET_NULL, null=True, blank=True, help_text="Facility used for the session"
    )

    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, null=True, blank=True, help_text="Course associated with this schedule"
    )

    event_name = models.CharField(max_length=255, null=True, blank=True, help_text="Event name (for non-course events)")
    instructor = models.CharField(max_length=100, null=True, blank=True,
                                  help_text="Instructor or speaker for the session")
    start_time = models.DateTimeField(help_text="Start time of the session")
    end_time = models.DateTimeField(help_text="End time of the session")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled',
                              help_text="Status of the session")

    def clean(self):
        """Ensure there are no schedule conflicts."""
        Classroom = apps.get_model("classrooms", "Classroom")  # ✅ Resolve Classroom dynamically

        if self.classroom:
            conflicts = Schedule.objects.filter(
                classroom=self.classroom,
                start_time__lt=self.end_time,
                end_time__gt=self.start_time
            ).exclude(id=self.id)

            if conflicts.exists():
                raise ValidationError(f"Classroom {self.classroom.name} is already booked for this time slot.")

        if self.facility:
            conflicts = Schedule.objects.filter(
                facility=self.facility,
                start_time__lt=self.end_time,
                end_time__gt=self.start_time
            ).exclude(id=self.id)

            if conflicts.exists():
                raise ValidationError(f"Facility {self.facility.name} is already booked for this time slot.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        if self.course:
            return f"{self.course.course_name} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"
        elif self.event_name:
            return f"Event: {self.event_name} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"
        else:
            return f"Schedule - {self.start_time.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['start_time']
        unique_together = ('classroom', 'start_time', 'end_time')  # Prevent double-booking