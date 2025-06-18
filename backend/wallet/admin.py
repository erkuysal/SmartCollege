from django.contrib import admin
from .models import ActivityType, MultiplierRule, Transaction, Wallet


@admin.register(ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'base_points', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')


@admin.register(MultiplierRule)
class MultiplierRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'multiplier', 'condition_type', 'is_active', 'start_date', 'end_date')
    list_filter = ('condition_type', 'is_active')
    search_fields = ('name', 'description')


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('student', 'transaction_type', 'activity_type', 'points', 'multiplier_applied', 'timestamp')
    list_filter = ('transaction_type', 'activity_type', 'timestamp')
    search_fields = ('student__user_number', 'student__first_name', 'student__last_name', 'reference_id')
    date_hierarchy = 'timestamp'


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('student', 'balance', 'total_earned', 'total_spent', 'last_updated')
    search_fields = ('student__user_number', 'student__first_name', 'student__last_name')
    readonly_fields = ('total_earned', 'total_spent', 'last_updated')
