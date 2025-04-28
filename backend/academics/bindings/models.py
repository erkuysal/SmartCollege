from django.db import models
from django.core.exceptions import ValidationError

from users.lecturers.models import Lecturer
from college.courses.models import Course, CourseSection
from academics.enrollment.models import AcademicTerm


class LecturerCourse(models.Model):
    """
    Represents the assignment of a lecturer to teach a specific course section.
    Allows tracking lecturer workload and qualifications.
    """
    lecturer = models.ForeignKey(Lecturer, on_delete=models.CASCADE, related_name="course_assignments")
    section = models.ForeignKey(CourseSection, on_delete=models.CASCADE, related_name="lecturer_assignments")
    is_primary = models.BooleanField(default=True, help_text="Whether this lecturer is the primary instructor")
    role = models.CharField(max_length=50, blank=True, null=True, 
                           help_text="Specific role (e.g., 'Instructor', 'Lab Assistant', 'TA')")
    hours_per_week = models.PositiveIntegerField(default=0, 
                                               help_text="Estimated teaching hours per week")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['lecturer', 'section', 'is_primary'],
                name='unique_lecturer_section_primary'
            )
        ]
        ordering = ['-section__academic_term__start_date', 'section__course__code']
        indexes = [
            models.Index(fields=['lecturer']),
            models.Index(fields=['section']),
        ]

    def __str__(self):
        return f"{self.lecturer.user.username} teaches {self.section.course.name} {self.section.section_number} ({self.section.academic_term})"

    def clean(self):
        # Check lecturer qualification
        if not self.lecturer.is_qualified_for_course(self.section.course):
            raise ValidationError("Lecturer not qualified for this course")

        # Check workload
        current_courses = LecturerCourse.objects.filter(
            lecturer=self.lecturer,
            section__academic_term=self.section.academic_term,
            is_primary=True
        ).exclude(id=self.id if self.id else 0).count()
        
        if current_courses >= self.lecturer.max_courses:
            raise ValidationError("Lecturer workload exceeded")
            
        # Check for conflicting schedule
        # TODO: Add time conflict checking with Schedule/SectionAssignment records
        
        super().clean()
        
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


