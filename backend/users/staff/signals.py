from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group

from users.staff.models import Staff


@receiver(post_save, sender=Staff)
def assign_staff_role(sender, instance, created, **kwargs):
    """Assign Staff role when a Staff profile is created"""
    if created and instance.user:
        user = instance.user
        user.role = 'Staff'
        user.save(update_fields=['role'])
        
        # Add to Staff group
        staff_group, _ = Group.objects.get_or_create(name='Staff')
        user.groups.add(staff_group) 