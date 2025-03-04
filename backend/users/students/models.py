from django.db import models
from django.contrib.auth import get_user_model  # ✅ Avoid direct import
from datetime import datetime
from django.conf import settings

from college.faculties.models import Faculty
from college.courses.models import CoursePackage


class Student(models.Model):
    STUDENT_STATUS_CHOICES = [
        ('INACTIVE', 'Inactive'),
        ('ACTIVE', 'Active'),
        ('GRADUATED', 'Graduated'),
    ]

    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE, related_name='student_profile')
    faculty = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True, blank=True)
    student_status = models.CharField(max_length=10, choices=STUDENT_STATUS_CHOICES, default="INACTIVE", help_text="Current student status")
    semester = models.IntegerField(default=1)
    
    student_number = models.CharField(max_length=10, unique=True, blank=True, null=True, help_text="Unique student identifier in format S{YYYY}{0000}")
    rfid_tag = models.CharField(max_length=50, unique=True, blank=True, null=True, help_text="Student's RFID card number")
    balance_points = models.PositiveIntegerField(default=0, help_text="Points for purchasing in college facilities")

    enrolled_at = models.DateField(auto_now_add=True, help_text="Date of Registration")

    def save(self, *args, **kwargs):
        """
        Generate a custom student number of the format:
            S{YYYY}{0000}
        (e.g., S20240001)

        Logic:
        1. Determine the current year.
        2. Count existing students registered in the current year.
        3. Assign the next available number for the year.
        4. Generate institutional email if user email is not set.
        """
        creating_new_record = self.pk is None

        if creating_new_record and not self.student_number:
            year = datetime.now().year
            # Count students registered in the current year
            current_year_count = Student.objects.filter(student_number__startswith=f"S{year}").count()
            next_number = current_year_count + 1
            self.student_number = f"S{year}{str(next_number).zfill(4)}"
            
            # Generate institutional email if not already set
            if hasattr(self, 'user') and self.user and not self.user.email:
                domain = getattr(settings, 'INSTITUTION_EMAIL_DOMAIN', 'std.institution.edu')
                self.user.email = f"{self.student_number.lower()}@{domain}"
                self.user.save(update_fields=['email'])
                
            # Set year of study based on faculty if not already set
            if self.faculty and not self.semester:
                self.semester = self.get_default_year_of_study()

        super().save(*args, **kwargs)

    def get_default_year_of_study(self):
        """
        Determine the default year of study based on the faculty.
        Different faculties might have different program lengths.
        """
        if not self.faculty:
            return 1
            
        # Default mapping of faculties to program years
        faculty_years = {
            'Engineering': 4,
            'Medicine': 6,
            'Law': 3,
            'Business': 4,
            'Arts': 3,
            'Science': 4,
            # Add more faculty-year mappings as needed
        }
        
        # Get the faculty name and determine the year
        faculty_name = self.faculty.name
        if faculty_name in faculty_years:
            return 1  # Default to first year for new students
        
        return 1  # Default to first year if faculty not found

    def __str__(self):
        return f"{self.user.username} - {self.faculty.name if self.faculty else 'No Faculty'} - {self.student_status} - Semester {self.semester}"

    def assign_courses_for_semester(self):
        """
        Assign courses to the student based on their faculty and current semester.
        """
        course_package = CoursePackage.objects.filter(faculty=self.faculty, semester=self.semester).first()
        if course_package:
            self.enrolled_courses.set(course_package.courses.all())

    