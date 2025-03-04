from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError

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
        constraints = [
            models.CheckConstraint(
                check=models.Q(date_enrolled__lte=timezone.now()),
                name='enrollment_date_not_future'
            )
        ]

    def __str__(self):
        return f"{self.student.user.username} enrolled in {self.course.name} [{self.semester}, {self.academic_year}]"

    def clean(self):
        # Check if course is full
        max_students = self.course.max_students
        if max_students:
            current_count = Enrollment.objects.filter(
                course=self.course,
                semester=self.semester,
                academic_year=self.academic_year
            ).count()
            if current_count >= max_students:
                raise ValidationError("Course is full")

        # Check prerequisites
        if not self.student.has_completed_prerequisites(self.course):
            raise ValidationError("Prerequisites not met")

