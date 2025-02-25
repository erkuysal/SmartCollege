from django.db import models
from django.contrib.auth import get_user_model  # ✅ Avoid direct import

from college.departments.models import Department
from college.courses.models import CoursePackage

class Student(models.Model):
    STUDENT_STATUS_CHOICES = [
        ('INACTIVE', 'Inactive'),
        ('ACTIVE', 'Active'),
        ('GRADUATED', 'Graduated'),
    ]

    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE, related_name='student_profile')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    student_status = models.CharField(max_length=10, choices=STUDENT_STATUS_CHOICES, default="INACTIVE", help_text="Current student status")
    semester = models.IntegerField(default=1)

    rfid_tag = models.CharField(max_length=50, unique=True, help_text="Student's RFID card number")
    balance_points = models.PositiveIntegerField(default=0, help_text="Points for purchasing in college facilities")

    enrolled_at = models.DateField(auto_now_add=True, help_text="Date of Registration")

    def __str__(self):
        return f"{self.user.username} - {self.department.name if self.department else 'No Department'} - {self.student_status} - Semester {self.semester}"

    def assign_courses_for_semester(self):
        """
        Assign courses to the student based on their department and current semester.
        """
        course_package = CoursePackage.objects.filter(department=self.department, semester=self.semester).first()
        if course_package:
            self.enrolled_courses.set(course_package.courses.all())