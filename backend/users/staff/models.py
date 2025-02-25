from django.db import models

from users.base.models import User


class Staff(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    position = models.CharField(max_length=100, help_text="Staff position (e.g., Admin, Maintenance)")
    office_location = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.user.username} - {self.position}"


