from typing import List
from django.db import transaction, models
from django.core.exceptions import ValidationError
from .models import Schedule, TimeSlot
from college.courses.models import Course
from college.classrooms.models import Classroom

class ScheduleService:
    @staticmethod
    def get_available_slots(course: Course, semester: str, academic_year: str) -> List[dict]:
        """Find available time slots for a course"""
        from academics.enrollment.models import Enrollment
        from academics.bindings.models import LecturerCourse

        # Get all users involved in the course
        enrolled_students = Enrollment.objects.filter(
            course=course,
            semester=semester,
            academic_year=academic_year
        ).values_list('student', flat=True)

        assigned_lecturers = LecturerCourse.objects.filter(
            course=course,
            semester=semester,
            academic_year=academic_year
        ).values_list('lecturer', flat=True)

        # Get all time slots where these users are already scheduled
        busy_slots = Schedule.objects.filter(
            models.Q(course__enrollments__student__in=enrolled_students) |
            models.Q(course__lecturers__lecturer__in=assigned_lecturers),
            semester=semester,
            academic_year=academic_year,
            is_active=True
        ).values_list('time_slot', flat=True)

        # Return available time slots
        return TimeSlot.objects.exclude(id__in=busy_slots)

    @staticmethod
    def assign_classroom(course: Course, semester: str, academic_year: str) -> Schedule:
        """Automatically assign a classroom and time slot to a course"""
        available_slots = ScheduleService.get_available_slots(course, semester, academic_year)
        
        for slot in available_slots:
            # Find available classrooms for this slot
            available_classrooms = Classroom.objects.exclude(
                schedules__time_slot=slot,
                schedules__semester=semester,
                schedules__academic_year=academic_year,
                schedules__is_active=True
            )

            for classroom in available_classrooms:
                try:
                    with transaction.atomic():
                        schedule = Schedule.objects.create(
                            classroom=classroom,
                            course=course,
                            time_slot=slot,
                            semester=semester,
                            academic_year=academic_year
                        )
                        return schedule
                except ValidationError:
                    continue

        raise ValidationError("No available slots or classrooms found for this course") 