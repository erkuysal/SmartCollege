# users/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.apps import apps
from rfid.models import RFIDTag

from .models import BaseUser


def generate_tag_id(prefix: str) -> str:
    """
    Generate a unique RFID tag ID based on the prefix and current year.
    Format: {prefix}{year}{increment:04d}
    """
    year = timezone.localdate().year
    base = f"{prefix}{year}"
    existing = RFIDTag.objects.filter(tag_id__startswith=base)
    if existing.exists():
        seqs = [
            int(r.tag_id[-4:]) for r in existing
            if r.tag_id[-4:].isdigit()
        ]
        next_seq = max(seqs) + 1
    else:
        next_seq = 1
    return f"{base}{next_seq:04d}"


def _make_rfid_handler(sender):
    @receiver(post_save, sender=sender)
    def _create_tag(sender, instance, created, **kwargs):
        """
        Create an RFID tag for new users.
        Only creates a tag if:
        1. This is a new user (created=True)
        2. The user doesn't already have an RFID tag
        3. The model has a TAG_PREFIX defined
        """
        if not created or hasattr(instance, "rfid_tag"):
            return

        # Use the first letter of user_type as prefix (S for student, L for lecturer)
        prefix = instance.user_type[0].upper()
        tag_id = generate_tag_id(prefix)
        RFIDTag.objects.create(user=instance, tag_id=tag_id)

    return _create_tag


# Register signal handlers for all non-abstract BaseUser subclasses
for model in apps.get_models():
    if (issubclass(model, BaseUser) and
            not getattr(model._meta, "abstract", False)):
        _make_rfid_handler(model)
