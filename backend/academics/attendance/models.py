from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError

from users.lecturers.models import Lecturer
from users.students.models import Student

from college.courses.models import Course
from college.classrooms.models import Classroom


class AttendanceSession(models.Model):
    lecturer = models.ForeignKey(Lecturer, on_delete=models.CASCADE, related_name="attendance_sessions")
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name="attendance_sessions")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="attendance_sessions")
    start_time = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True, help_text="Is attendance still open?")
    semester = models.CharField(max_length=20, help_text="Semester (e.g., Fall 2023)")
    academic_year = models.CharField(max_length=10, help_text="Academic year (e.g., 2023-2024)")

    def __str__(self):
        return f"{self.course.name} in {self.classroom.name} by {self.lecturer.user.email} at {self.start_time}"

    def get_attendance_status(self):
        """Determine attendance status based on elapsed time"""
        elapsed_time = (timezone.now() - self.start_time).total_seconds()

        if elapsed_time <= 600:
            return "present"
        elif elapsed_time <= 1200:
            return "late"
        else:
            return "closed"

    def clean(self):
        if self.is_active:
            overlapping = AttendanceSession.objects.filter(
                lecturer=self.lecturer,
                is_active=True
            ).exclude(id=self.id)
            if overlapping.exists():
                raise ValidationError("Lecturer already has an active session")
            
            classroom_in_use = AttendanceSession.objects.filter(
                classroom=self.classroom,
                is_active=True
            ).exclude(id=self.id)
            if classroom_in_use.exists():
                raise ValidationError("Classroom is already in use for another session")

    def close_session(self):
        """Close session and mark absent students"""
        from academics.enrollment.models import Enrollment
        
        # Get all enrolled students
        enrolled_students = Enrollment.objects.filter(
            course=self.course,
            semester=self.semester,
            academic_year=self.academic_year
        ).values_list('student', flat=True)
        
        # Mark absent for students who didn't attend
        for student_id in enrolled_students:
            Attendance.objects.get_or_create(
                session=self,
                student_id=student_id,
                defaults={'attendance_status': 'absent'}
            )
        
        self.is_active = False
        self.save()


class Attendance(models.Model):
    ATTENDANCE_STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('excused', 'Excused'),
    ]

    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name="attendances")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="attendances")
    attendance_status = models.CharField(
        max_length=10, 
        choices=ATTENDANCE_STATUS_CHOICES, 
        default='absent',
        help_text="Student's attendance status"
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('session', 'student')

    def __str__(self):
        return f"{self.student.user.email} - {self.session.course.name} - {self.attendance_status}"

    def can_be_excused(self):
        """Check if the attendance can be changed to excused"""
        return self.attendance_status == "absent"

