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

    def __str__(self):
        return f"{self.user.username} - {self.department.name if self.department else 'No Department'} - {self.faculty.name if self.faculty else 'No Faculty'}"

