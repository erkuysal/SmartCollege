from django.db import models
from django.utils import timezone

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

    def __str__(self):
        return f"{self.course.course_name} in {self.classroom.name} by {self.lecturer.user.email} at {self.start_time}"

    def get_attendance_status(self):
        """Determine attendance status based on elapsed time"""
        elapsed_time = (timezone.now() - self.start_time).total_seconds()

        if elapsed_time <= 600:
            return "Present"
        elif elapsed_time <= 1200:
            return "Late"
        else:
            return "Closed"

    def close_session(self):
        """Closes attendance session after 20 minutes"""
        self.is_active = False
        self.save()


class Attendance(models.Model):
    ATTENDANCE_STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late'),
        ('EXCUSED', 'Excused'),
    ]

    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name="attendances")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="attendances")
    attendance_status = models.CharField(
        max_length=10, 
        choices=ATTENDANCE_STATUS_CHOICES, 
        default='ABSENT',
        help_text="Student's attendance status"
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('session', 'student')

    def __str__(self):
        return f"{self.student.user.email} - {self.session.course.course_name} - {self.attendance_status}"

    def can_be_excused(self):
        """Check if the attendance can be changed to excused"""
        return self.attendance_status == "ABSENT"

