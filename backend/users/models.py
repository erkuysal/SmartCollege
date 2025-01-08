from django.db import models
from datetime import datetime


class Student(models.Model):
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    email = models.EmailField(unique=True, blank=True, null=True)

    student_number = models.CharField(max_length=9, unique=True)
    # rfid_tag = models.CharField(max_length=50, unique=True)

    def save(self, *args, **kwargs):
        """
        Generate a custom student number of the format:
            S{YYYY}{0000}
        (e.g., S20240001)

        Logic:
        1. Determine the current year.
        2. Count existing students registered in the current year.
        3. Assign the next available number for the year.
        """
        creating_new_record = self.pk is None

        if creating_new_record and not self.student_number:
            year = datetime.now().year
            # Count students registered in the current year
            current_year_count = Student.objects.filter(student_number__startswith=f"S{year}").count()
            next_number = current_year_count + 1
            self.student_number = f"S{year}{str(next_number).zfill(4)}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"



