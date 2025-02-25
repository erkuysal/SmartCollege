from django.db import models
from django.utils import timezone

from users.base.models import User


class RFIDTag(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="rfid_profile")
    tag_id = models.CharField(max_length=50, unique=True, help_text="Unique RFID Tag ID")
    issued_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['tag_id']),  # For faster RFID lookups
        ]

    def __str__(self):
        return f"{self.user.email} - {self.tag_id}"

    def record_usage(self):
        self.last_used_at = timezone.now()
        self.save(update_fields=['last_used_at'])

