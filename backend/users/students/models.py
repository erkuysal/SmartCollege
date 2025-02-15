from django.db import models

from college.departments.models import Department

from users.base.models import User


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    rfid_tag = models.CharField(max_length=50, unique=True, help_text="Student's RFID card number")
    balance_points = models.PositiveIntegerField(default=0, help_text="Points for purchasing in college facilities")
    enrolled_at = models.DateField(auto_now_add=True, help_text="Date of enrollment")

    def __str__(self):
        return f"{self.user.username} - {self.department.name if self.department else 'No Department'}"


