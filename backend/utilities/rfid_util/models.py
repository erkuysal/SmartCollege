from django.db import models
from django.utils import timezone
import uuid

from users.base.models import User
from users.staff.models import Staff


class RFIDCard(models.Model):
    # Card status choices
    STATUS_PENDING = 'PENDING'
    STATUS_ASSIGNED = 'ASSIGNED'
    STATUS_WRITTEN = 'WRITTEN'
    STATUS_ISSUED = 'ISSUED'
    STATUS_LOST = 'LOST'
    STATUS_INACTIVE = 'INACTIVE'
    
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_ASSIGNED, 'Assigned to Personnel'),
        (STATUS_WRITTEN, 'Written to Card'),
        (STATUS_ISSUED, 'Issued to User'),
        (STATUS_LOST, 'Lost/Stolen'),
        (STATUS_INACTIVE, 'Inactive'),
    ]
    
    # User relationship
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="rfid_card")
    
    # RFID identifiers
    tag_id = models.CharField(max_length=50, unique=True, help_text="Unique RFID Tag ID")
    unique_identifier = models.UUIDField(default=uuid.uuid4, editable=False, unique=True,
                                        help_text="System-generated unique identifier for this card")

    # Status tracking
    card_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING,
                                  help_text="Current status of the physical RFID card")
    
    # Assignment tracking
    assigned_to_personnel = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True, 
                                             related_name="assigned_rfid_cards",
                                             help_text="Staff member responsible for writing this card")
    
    # Timestamps
    issued_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(auto_now=True)
    written_at = models.DateTimeField(null=True, blank=True, 
                                     help_text="When the card was physically written")
    
    # Additional fields
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, help_text="Additional notes about this card")

    class Meta:
        indexes = [
            models.Index(fields=['tag_id']),  # For faster RFID lookups
            models.Index(fields=['unique_identifier']),  # For system lookups
            models.Index(fields=['card_status']),  # For filtering by status
        ]
        verbose_name = "RFID Card"
        verbose_name_plural = "RFID Cards"

    def __str__(self):
        return f"{self.user.email} - {self.tag_id} ({self.get_card_status_display()})"

    def record_usage(self):
        self.last_used_at = timezone.now()
        self.save(update_fields=['last_used_at'])
    
    def mark_as_written(self, tag_id, staff_member=None):
        """Mark the card as written with the actual tag ID"""
        self.tag_id = tag_id
        self.card_status = self.STATUS_WRITTEN
        self.written_at = timezone.now()
        if staff_member:
            self.assigned_to_personnel = staff_member
        self.save()
    
    def mark_as_issued(self):
        """Mark the card as issued to the user"""
        self.card_status = self.STATUS_ISSUED
        self.save()
    
    def mark_as_lost(self):
        """Mark the card as lost/stolen"""
        self.card_status = self.STATUS_LOST
        self.is_active = False
        self.save()
    
    def reactivate(self):
        """Reactivate an inactive card"""
        if self.card_status == self.STATUS_INACTIVE:
            self.card_status = self.STATUS_ISSUED
            self.is_active = True
            self.save()

