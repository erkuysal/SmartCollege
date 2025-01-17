from django.db import models
from django.utils.timezone import now

from users.models import Student, Teacher

DAY_OF_WEEK_CHOICES = [
    (0, 'Monday'),
    (1, 'Tuesday'),
    (2, 'Wednesday'),
    (3, 'Thursday'),
    (4, 'Friday'),
    (5, 'Saturday'),
    (6, 'Sunday'),
]


class Classroom(models.Model):
    """
    Represents a physical classroom.
    """
    name = models.CharField(max_length=50, unique=True)
    capacity = models.PositiveIntegerField()
    building = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.name} (Cap: {self.capacity})"


class Courses(models.Model):
    """
    Represents a course or course that is taught in a classroom.
    """
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='lectures_taught'
    )

    # For a more elaborate system, you may create a separate Teacher model
    # and reference that instead of a User.

    def __str__(self):
        return self.title


class Schedule(models.Model):
    """
    Represents a scheduled time-slot for a course in a specific classroom.
    """
    course = models.ForeignKey(
        Courses,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    classroom = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE,
        related_name='schedules'
    )

    day_of_week = models.PositiveSmallIntegerField(
        choices=DAY_OF_WEEK_CHOICES,
        help_text="Which day of the week this class occurs (e.g., Monday)."
    )

    start_time = models.TimeField()
    end_time = models.TimeField()

    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.course.title} in {self.classroom.name} from {self.start_time} to {self.end_time}"


class Attendance(models.Model):
    schedule = models.ForeignKey(
        Schedule,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='attendances'
    )

    attendance_date = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20,
        choices=[
            ('present', 'Present'),
            ('absent', 'Absent'),
            ('late', 'Late'),
            ('excused', 'Excused'),
        ],
        default='absent'  # Optional: You can set a default choice
    )

    def __str__(self):
        return f"{self.student.name} - {self.schedule.course.title} on {self.date}: {self.status}"