from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group

from users.students.models import Student


@receiver(post_save, sender=Student)
def assign_student_role(sender, instance, created, **kwargs):
    """Assign Student role when a Student profile is created"""
    if created and instance.user:
        user = instance.user
        user.role = 'Student'
        user.save(update_fields=['role'])
        
        # Add to Student group
        student_group, _ = Group.objects.get_or_create(name='Students')
        user.groups.add(student_group) 