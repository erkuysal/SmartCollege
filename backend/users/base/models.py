from django.db import models

from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLES = [
        ('Student', 'Student'),
        ('Lecturer', 'Lecturer'),
        ('Staff', 'Staff'),
        ('Admin', 'Admin'),
    ]

    role = models.CharField(max_length=20, choices=ROLES, default='Student', help_text="User role in the system")

    def __str__(self):
        return f"{self.username} ({self.role})"


