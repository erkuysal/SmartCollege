from django.contrib import admin

from django.contrib.auth.admin import UserAdmin
from users.base.models import User
from users.students.models import Student
from users.lecturers.models import Lecturer
from users.staff.models import Staff


class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'email')
    actions = ['deactivate_users']

    def deactivate_users(self, request, queryset):
        queryset.update(is_active=False)
    deactivate_users.short_description = "Deactivate selected users"


class StudentAdmin(admin.ModelAdmin):
    list_display = [
        'user',
        'department',
        'student_status',  # Changed from 'status'
        'semester',
        'rfid_tag',
        'balance_points',
        'enrolled_at'
    ]
    list_filter = [
        'student_status',  # Changed from 'status'
        'department',
        'semester'
    ]
    search_fields = ('user__email', 'rfid_tag')
    actions = ['activate_students']

    def activate_students(self, request, queryset):
        queryset.update(status="Active")

    activate_students.short_description = "Activate selected students"


class LecturerAdmin(admin.ModelAdmin):
    list_display = ('user', 'department')
    list_filter = ('department',)
    search_fields = ('user__email',)


class StaffAdmin(admin.ModelAdmin):
    list_display = ('user', 'position')
    search_fields = ('user__email', 'position')


models_to_register = [
    (User, CustomUserAdmin),
    (Student, StudentAdmin),
    (Lecturer, LecturerAdmin),
    (Staff, StaffAdmin),
]
