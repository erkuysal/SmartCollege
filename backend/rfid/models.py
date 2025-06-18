# rfid/models.py

from django.db import models
from django.utils import timezone
from users.models import BaseUser


class RFIDTag(models.Model):
    """
    Maps a physical card's UID (tag_id) to exactly one User.
    When Arduino tells us "UID = ABC123", we look it up here to find the User.
    """
    tag_id = models.CharField(
        max_length=64,
        unique=True,
        help_text="Unique code read from the RFID card (e.g. UID)."
    )
    user = models.OneToOneField(
        BaseUser,
        on_delete=models.CASCADE,
        related_name="rfid_tag"
    )
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.tag_id} → {self.user.user_number}"

    class Meta:
        ordering = ['-created_at']


