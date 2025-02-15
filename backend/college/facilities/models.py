from django.db import models


class Facility(models.Model):
    FACILITY_TYPES = [
        ('Lab', 'Laboratory'),
        ('Lecture Hall', 'Lecture Hall'),
        ('Library', 'Library'),
        ('Cafeteria', 'Cafeteria'),
        ('Amphitheater', 'Amphitheater'),
        ('Hostel', 'Hostel'),
        ('Sports Center', 'Sports Center'),
        ('Other', 'Other'),
    ]

    name = models.CharField(max_length=100, unique=True, help_text="Facility name")
    type = models.CharField(max_length=50, choices=FACILITY_TYPES, help_text="Type of facility")
    location = models.CharField(max_length=255, help_text="Location of the facility", null=True, blank=True)
    capacity = models.PositiveIntegerField(help_text="Maximum capacity of the facility", null=True, blank=True)
    is_active = models.BooleanField(default=True, help_text="Is the facility currently in use?")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.type})"

    class Meta:
        ordering = ['name']