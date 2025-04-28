from django.db.models.signals import post_save
from django.dispatch import receiver
import logging

from users.base.models import User
from .models import RFIDCard

logger = logging.getLogger(__name__)

@receiver(post_save, sender=User)
def create_rfid_tag(sender, instance, created, **kwargs):
    """
    Signal to automatically create an RFID tag record when a new user is registered.
    """
    if created:  # Only when a new user is created
        try:
            # Create a temporary tag ID based on the user's ID
            temp_tag_id = f"PENDING-{instance.id}"
            
            # Create the RFID tag record with PENDING status
            rfid_card = RFIDCard.objects.create(
                user=instance,
                tag_id=temp_tag_id,
                card_status=RFIDCard.STATUS_PENDING,
            )
            
            logger.info(f"Created RFID card record for user {instance.email} with ID {instance.id}")
            
        except Exception as e:
            logger.error(f"Error creating RFID card for user {instance.email}: {str(e)}") 