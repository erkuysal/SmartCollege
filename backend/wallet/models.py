from django.db import models
from django.utils import timezone
from users.models import Student
from django.utils.translation import gettext_lazy as _


class ActivityType(models.Model):
    """
    Defines different types of activities that can earn points
    Example: Attendance, Library Usage, Campus Events, etc.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    base_points = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class MultiplierRule(models.Model):
    """
    Defines rules for point multipliers based on various conditions
    Example: Streak multipliers, special event multipliers, etc.
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=1.00)
    condition_type = models.CharField(
        max_length=50,
        choices=[
            ('streak', 'Attendance Streak'),
            ('special_event', 'Special Event'),
            ('time_of_day', 'Time of Day'),
            ('location', 'Location Based'),
            ('custom', 'Custom Rule')
        ]
    )
    condition_value = models.JSONField(
        help_text="JSON field to store condition-specific values"
    )
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (x{self.multiplier})"

    class Meta:
        ordering = ['-created_at']


class Transaction(models.Model):
    """
    Records all point transactions in the system
    """
    TRANSACTION_TYPES = [
        ('earn', 'Points Earned'),
        ('spend', 'Points Spent'),
        ('adjust', 'Points Adjustment'),
        ('expire', 'Points Expired')
    ]

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='wallet_transactions'
    )
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    activity_type = models.ForeignKey(
        ActivityType,
        on_delete=models.SET_NULL,
        null=True,
        related_name='transactions'
    )
    points = models.IntegerField(help_text="Can be positive (earned) or negative (spent)")
    multiplier_applied = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=1.00
    )
    multiplier_rule = models.ForeignKey(
        MultiplierRule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions'
    )
    reference_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="Reference to the source of the transaction (e.g., attendance record ID)"
    )
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.get_transaction_type_display()} ({self.points} points)"

    class Meta:
        ordering = ['-timestamp']


class Wallet(models.Model):
    """
    Represents a student's wallet with their current point balance
    """
    student = models.OneToOneField(
        Student,
        on_delete=models.CASCADE,
        related_name='wallet'
    )
    balance = models.PositiveIntegerField(default=0)
    total_earned = models.PositiveIntegerField(default=0)
    total_spent = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student}'s Wallet - Balance: {self.balance}"

    def add_points(self, points, activity_type, multiplier_rule=None, reference_id='', description=''):
        """
        Add points to the wallet and create a transaction record
        """
        multiplier = multiplier_rule.multiplier if multiplier_rule else 1.00
        adjusted_points = int(points * multiplier)

        # Create transaction record
        Transaction.objects.create(
            student=self.student,
            transaction_type='earn',
            activity_type=activity_type,
            points=adjusted_points,
            multiplier_applied=multiplier,
            multiplier_rule=multiplier_rule,
            reference_id=reference_id,
            description=description
        )

        # Update wallet
        self.balance += adjusted_points
        self.total_earned += adjusted_points
        self.save()

    def spend_points(self, points, activity_type, reference_id='', description=''):
        """
        Spend points from the wallet and create a transaction record
        """
        if points > self.balance:
            raise ValueError("Insufficient points balance")

        # Create transaction record
        Transaction.objects.create(
            student=self.student,
            transaction_type='spend',
            activity_type=activity_type,
            points=-points,
            reference_id=reference_id,
            description=description
        )

        # Update wallet
        self.balance -= points
        self.total_spent += points
        self.save()

    def get_transaction_history(self, limit=10):
        """
        Get recent transaction history
        """
        return self.student.wallet_transactions.all()[:limit]
