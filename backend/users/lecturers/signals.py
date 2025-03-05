from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group

from users.lecturers.models import Lecturer


@receiver(post_save, sender=Lecturer)
def assign_lecturer_role(sender, instance, created, **kwargs):
    """Assign Lecturer role when a Lecturer profile is created"""
    if created and instance.user:
        user = instance.user
        user.role = 'Lecturer'
        user.save(update_fields=['role'])
        
        # Add to Lecturer group
        lecturer_group, _ = Group.objects.get_or_create(name='Lecturers')
        user.groups.add(lecturer_group) 