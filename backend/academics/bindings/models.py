from django.db import models
from django.core.exceptions import ValidationError

from users.lecturers.models import Lecturer
from college.courses.models import Course


class LecturerCourse(models.Model):
    lecturer = models.ForeignKey(Lecturer, on_delete=models.CASCADE, related_name="courses")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="lecturers")
    semester = models.CharField(max_length=50, help_text="Semester when the lecturer teaches this course")
    academic_year = models.CharField(max_length=20, help_text="Academic year (e.g., 2024-2025)")

    class Meta:
        unique_together = ('lecturer', 'course', 'semester', 'academic_year')  # Prevent duplicate assignments
        ordering = ['academic_year', 'semester']

    def __str__(self):
        return f"{self.lecturer.user.username} teaches {self.course.name} ({self.semester}, {self.academic_year})"

    def clean(self):
        # Check lecturer qualification
        if not self.lecturer.is_qualified_for_course(self.course):
            raise ValidationError("Lecturer not qualified for this course")

        # Check workload
        current_courses = LecturerCourse.objects.filter(
            lecturer=self.lecturer,
            semester=self.semester,
            academic_year=self.academic_year
        ).count()
        if current_courses >= self.lecturer.max_courses:
            raise ValidationError("Lecturer workload exceeded")


