from django.db import models

from college.departments.models import Department
from college.faculties.models import Faculty

from users.base.models import User


class Lecturer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lecturer_profile')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    faculty = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True, blank=True)
    office_number = models.CharField(max_length=50, blank=True, null=True)
    courses_taught = models.TextField(blank=True)
    qualification = models.CharField(max_length=50, default="PhD", help_text="Highest academic qualification")
    max_courses = models.PositiveIntegerField(default=3, help_text="Maximum number of courses the lecturer can teach per term")

    def __str__(self):
        return f"{self.user.username} - {self.department.name if self.department else 'No Department'} - {self.faculty.name if self.faculty else 'No Faculty'}"
    
    def is_qualified_for_course(self, course):
        """
        Check if the lecturer is qualified to teach a specific course.
        
        Args:
            course: The Course object to check qualification for
            
        Returns:
            bool: True if qualified, False otherwise
        """
        # Basic qualification logic - can be expanded as needed
        # For now, assume the lecturer can teach courses in their department
        if not self.department:
            return False
            
        return self.department.id == course.department.id

