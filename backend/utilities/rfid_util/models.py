from django.db import models

from users.base.models import User


class RFIDTag(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="rfid_tag")
    tag_id = models.CharField(max_length=50, unique=True, help_text="Unique RFID Tag ID")
    issued_at = models.DateTimeField(auto_now_add=True, help_text="Time when the RFID was issued")
    last_written_at = models.DateTimeField(null=True, blank=True, help_text="Time when data was last written to the RFID tag")

    def __str__(self):
        return f"{self.user.email} - RFID: {self.tag_id}"

