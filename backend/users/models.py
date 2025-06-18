# users/models.py
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    def create_user(self, user_number, password=None, **extra_fields):
        if not user_number:
            raise ValueError(_('The User Number field must be set'))
        email = f"{user_number}@institution.edu"
        email = self.normalize_email(email)
        user = self.model(user_number=user_number, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, user_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_admin', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(user_number, password, **extra_fields)


class BaseUser(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model that serves as the base for both students and lecturers.
    Uses user_number as the unique identifier for authentication.
    """
    USER_TYPE_CHOICES = (
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
    )

    user_number = models.CharField(
        _('user number'),
        max_length=20,
        unique=True,
        help_text=_('Auto-generated ID in format S/L{year}{increment:04d}')
    )
    email = models.EmailField(
        _('email address'),
        unique=True,
        help_text=_('Auto-generated email based on user number')
    )
    first_name = models.CharField(_('first name'), max_length=50)
    last_name = models.CharField(_('last name'), max_length=50)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    card_uid = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="RFID card UID for user identification"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'user_number'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'user_type']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return f"{self.user_number} – {self.first_name} {self.last_name}"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_short_name(self):
        return self.first_name

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    def validate_card(self, uid):
        """
        Validate if the provided card UID matches the user's registered card.
        If no card is registered, this will return True to allow first-time registration.
        """
        if not self.card_uid:
            return True
        return self.card_uid == uid

    def save(self, *args, **kwargs):
        if not self.user_number:
            current_year = timezone.localdate().year
            prefix = "S" if self.user_type == 'student' else "L"
            year_prefix = f"{prefix}{current_year}"
            
            qs = BaseUser.objects.filter(user_number__startswith=year_prefix)
            if qs.exists():
                last_numbers = [
                    int(s.user_number[-4:])
                    for s in qs
                    if s.user_number[-4:].isdigit()
                ]
                next_increment = (max(last_numbers) + 1) if last_numbers else 1
            else:
                next_increment = 1

            increment_str = f"{next_increment:04d}"
            self.user_number = f"{year_prefix}{increment_str}"
        
        # Auto-generate email if not set
        if not self.email:
            self.email = f"{self.user_number}@institution.edu"

        super().save(*args, **kwargs)


class Student(BaseUser):
    """
    Student model that inherits from BaseUser.
    Only requires first_name and last_name to create.
    """
    student_number = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        help_text="Auto-generated ID in format S{year}{increment:04d}, e.g. S20250001"
    )

    def __str__(self):
        return f"{self.student_number} – {self.first_name} {self.last_name}"

    def get_wallet(self):
        """
        Get or create the student's wallet
        """
        from wallet.models import Wallet
        wallet, created = Wallet.objects.get_or_create(student=self)
        return wallet

    def save(self, *args, **kwargs):
        """
        Auto-generate student_number and set user_type to 'student'
        """
        self.user_type = 'student'
        if not self.student_number:
            current_year = timezone.localdate().year
            year_prefix = f"S{current_year}"

            qs = Student.objects.filter(student_number__startswith=year_prefix)
            if qs.exists():
                last_numbers = [
                    int(s.student_number[-4:])
                    for s in qs
                    if s.student_number[-4:].isdigit()
                ]
                next_increment = (max(last_numbers) + 1) if last_numbers else 1
            else:
                next_increment = 1

            increment_str = f"{next_increment:04d}"
            self.student_number = f"{year_prefix}{increment_str}"
            self.user_number = self.student_number  # Set user_number for authentication
            self.email = f"{self.student_number}@institution.edu"  # Set email

        super().save(*args, **kwargs)


class Lecturer(BaseUser):
    """
    Lecturer model that inherits from BaseUser.
    Only requires first_name and last_name to create.
    """
    lecturer_number = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        help_text="Auto‐generated ID in format L{year}{increment:04d}"
    )
    title = models.CharField(max_length=50, blank=True)  # e.g. "Dr.", "Prof."

    def __str__(self):
        return f"{self.lecturer_number} – {self.first_name} {self.last_name}"

    def save(self, *args, **kwargs):
        """
        Auto-generate lecturer_number and set user_type to 'lecturer'
        """
        self.user_type = 'lecturer'
        if not self.lecturer_number:
            current_year = timezone.localdate().year
            year_prefix = f"L{current_year}"

            qs = Lecturer.objects.filter(lecturer_number__startswith=year_prefix)
            if qs.exists():
                last_numbers = [
                    int(l.lecturer_number[-4:])
                    for l in qs
                    if l.lecturer_number[-4:].isdigit()
                ]
                next_increment = (max(last_numbers) + 1) if last_numbers else 1
            else:
                next_increment = 1

            increment_str = f"{next_increment:04d}"
            self.lecturer_number = f"{year_prefix}{increment_str}"
            self.user_number = self.lecturer_number  # Set user_number for authentication
            self.email = f"{self.lecturer_number}@institution.edu"  # Set email

        super().save(*args, **kwargs)