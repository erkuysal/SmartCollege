from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.auth import get_user_model  # ✅ Avoid circular import
from drf_spectacular.utils import extend_schema_field  # Add this import
from rest_framework import serializers  # Add this import


class UserManager(BaseUserManager):
    """
    Custom manager for User model with restricted role assignment.
    """

    def create_user(self, username, email, password=None, role="Student", rfid_tag=None, **extra_fields):
        """
        Creates and returns a regular user with the specified role.
        """
        if not email:
            raise ValueError("Users must have an email address")
        if not username:
            raise ValueError("Users must have a username")

        # Validate role
        User = get_user_model()  # ✅ Fetch dynamically to prevent circular import
        valid_roles = [choice[0] for choice in User.ROLES]
        if role not in valid_roles:
            raise ValueError(f"Invalid role. Must be one of: {', '.join(valid_roles)}")

        email = self.normalize_email(email)
        user = User(username=username, email=email, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        
        # If RFID tag is provided, create an RFID card for the user
        if rfid_tag:
            try:
                from utilities.rfid_util.models import RFIDCard
                RFIDCard.objects.create(user=user, tag_id=rfid_tag, is_active=True)
            except ImportError:
                pass  # RFID module not available

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
    # Remove direct RFID field from User model to avoid duplication
    # Instead, we'll use a OneToOneField from the RFID model in utilities.rfid_util

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
        
    @property
    @extend_schema_field(serializers.CharField(allow_null=True))
    def rfid_tag(self):
        """
        Get the RFID tag associated with this user.
        This maintains backward compatibility with code that uses user.rfid_tag
        """
        try:
            from utilities.rfid_util.models import RFIDCard
            card = RFIDCard.objects.filter(user=self, is_active=True).first()
            return card.tag_id if card else None
        except ImportError:
            return None