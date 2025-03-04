from django.db.models.signals import post_save
from django.dispatch import receiver

from academics.attendance.models import AttendanceSession
from academics.enrollment.models import Enrollment
from academics.services import AcademicService


@receiver(post_save, sender=AttendanceSession)
def handle_session_closure(sender, instance, **kwargs):
    if not instance.is_active:
        # Process attendance records
        AcademicService.process_attendance(instance.id)


@receiver(post_save, sender=Enrollment)
def handle_enrollment(sender, instance, created, **kwargs):
    if created:
        # Update course capacity
        instance.course.update_capacity()
