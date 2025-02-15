from django.db import models

from users.students.models import Student
from college.courses.models import Course


class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    semester = models.CharField(max_length=50, help_text="Semester in which the student is enrolled (e.g., Fall, Spring)")
    academic_year = models.CharField(max_length=20, help_text="Academic year (e.g., 2024-2025)")
    date_enrolled = models.DateTimeField(auto_now_add=True, help_text="Date of enrollment")

    class Meta:
        unique_together = ('student', 'course', 'semester', 'academic_year')  # Prevent duplicate enrollments
        ordering = ['academic_year', 'semester']

    def __str__(self):
        return f"{self.student.user.username} enrolled in {self.course.course_name} [{self.semester}, {self.academic_year}]"

