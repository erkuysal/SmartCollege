from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.auth import get_user_model  # ✅ Avoid circular import
from drf_spectacular.utils import extend_schema_field  # Add this import
from rest_framework import serializers  # Add this import
from django.contrib.auth.models import Group


class UserManager(BaseUserManager):
    """
    Custom manager for User model with no default role assignment.
    """

    def create_user(self, username, email, password=None, **extra_fields):
        """
        Creates and returns a regular user without assigning a role.
        Roles will be assigned via signals when profiles are created.
        """
        if not email:
            raise ValueError("Users must have an email address")
        if not username:
            raise ValueError("Users must have a username")

        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        """
        Creates and returns a superuser with admin privileges.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        
        user = self.create_user(username, email, password, **extra_fields)
        user.role = 'Admin'
        user.save(update_fields=['role'])
        
        # Add to Admin group
        admin_group, _ = Group.objects.get_or_create(name='Admins')
        user.groups.add(admin_group)
        
        return user

    def create_student(self, username, email, password, department, enrollment_year, rfid_tag=None):
        """Creates a Student user with restricted role."""
        User = get_user_model()  # ✅ Dynamically fetch user model
        user = self.create_user(username, email, password, rfid_tag=rfid_tag)

        from users.students.models import Student  # ✅ Lazy import to avoid circular dependency
        Student.objects.create(user=user, department=department, enrolled_at=enrollment_year)

        return user

    def create_lecturer(self, username, email, password, faculty, office_number="", rfid_tag=None):
        """Creates a Lecturer user with restricted role."""
        User = get_user_model()
        user = self.create_user(username, email, password, rfid_tag=rfid_tag)

        from users.lecturers.models import Lecturer  # ✅ Lazy import to avoid circular dependency
        Lecturer.objects.create(user=user, faculty=faculty, office_number=office_number)

        return user

    def create_staff(self, username, email, password, position, office_location, rfid_tag=None):
        """Creates a Staff user with restricted role."""
        User = get_user_model()
        user = self.create_user(username, email, password, rfid_tag=rfid_tag)

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

    role = models.CharField(max_length=20, choices=ROLES, null=True, blank=True, 
                           help_text="User role in the system - assigned automatically based on profile type")
    # Remove direct RFID field from User model to avoid duplication
    # Instead, we'll use a OneToOneField from the RFID model in utilities.rfid_util

    objects = UserManager()

    def save(self, *args, **kwargs):
        """
        Allow role modification only during:
        1. Initial user creation (self.pk is None)
        2. When explicitly updating via update_fields
        3. For superusers
        """
        update_fields = kwargs.get('update_fields')
        
        # Allow role changes during creation or when explicitly updating role
        if self.pk and not self.is_superuser and (update_fields is None or 'role' not in update_fields):
            orig = User.objects.get(pk=self.pk)
            if orig.role != self.role:
                raise ValueError("Role modification is not allowed!")
                
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.get_role_display() if self.role else 'No Role'})"
        
    @property
    @extend_schema_field(serializers.CharField(allow_null=True))
    def rfid_tag(self):
        """
        Get the RFID tag associated with this user, if any.
        """
        try:
            from utilities.rfid_util.models import RFIDCard
            card = RFIDCard.objects.filter(user=self, is_active=True).first()
            return card.tag_id if card else None
        except ImportError:
            return None