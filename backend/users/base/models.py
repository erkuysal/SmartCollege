from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.auth import get_user_model  # ✅ Avoid circular import


class UserManager(BaseUserManager):
    """
    Custom manager for User model with restricted role assignment.
    """

    def create_user(self, username, email, password=None, role="Student", rfid_tag=None, **extra_fields):
        """
        Creates and returns a regular user with a fixed role.
        """
        if not email:
            raise ValueError("Users must have an email address")
        if not username:
            raise ValueError("Users must have a username")

        role = "Student"  # Default role is Student

        email = self.normalize_email(email)
        User = get_user_model()  # ✅ Fetch dynamically to prevent circular import
        user = User(username=username, email=email, role=role, rfid_tag=rfid_tag, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        """
        Creates and returns a superuser with admin privileges.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(username, email, password, role="Admin", **extra_fields)

    def create_student(self, username, email, password, department, enrollment_year, rfid_tag=None):
        """Creates a Student user with restricted role."""
        User = get_user_model()  # ✅ Dynamically fetch user model
        user = self.create_user(username, email, password, role="Student", rfid_tag=rfid_tag)

        from users.students.models import Student  # ✅ Lazy import to avoid circular dependency
        Student.objects.create(user=user, department=department, enrolled_at=enrollment_year)

        return user

    def create_lecturer(self, username, email, password, faculty, office_number="", rfid_tag=None):
        """Creates a Lecturer user with restricted role."""
        User = get_user_model()
        user = self.create_user(username, email, password, role="Lecturer", rfid_tag=rfid_tag)

        from users.lecturers.models import Lecturer  # ✅ Lazy import to avoid circular dependency
        Lecturer.objects.create(user=user, faculty=faculty, office_number=office_number)

        return user

    def create_staff(self, username, email, password, position, office_location, rfid_tag=None):
        """Creates a Staff user with restricted role."""
        User = get_user_model()
        user = self.create_user(username, email, password, role="Staff", rfid_tag=rfid_tag)

        from users.staff.models import Staff  # ✅ Lazy import to avoid circular dependency
        Staff.objects.create(user=user, position=position, office_location=office_location)

        return user


class User(AbstractUser):
    ROLES = [
        ('Student', 'Student'),
        ('Lecturer', 'Lecturer'),
        ('Staff', 'Staff'),
        ('Admin', 'Admin'),
    ]

    role = models.CharField(max_length=20, choices=ROLES, default='Student', help_text="User role in the system")
    rfid_tag = models.CharField(max_length=50, unique=True, null=True, blank=True,
                              help_text="RFID Tag assigned to user")

    objects = UserManager()

    def save(self, *args, **kwargs):
        """Prevent role modification after user creation."""
        if self.pk:
            orig = User.objects.get(pk=self.pk)
            if orig.role != self.role:
                raise ValueError("Role modification is not allowed!")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"