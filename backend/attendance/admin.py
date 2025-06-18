# attendance/admin.py

from django.contrib import admin
from .models import AttendanceRecord, AttendanceSession, CourseStreak

admin.site.register(AttendanceRecord)
admin.site.register(AttendanceSession)

@admin.register(CourseStreak)
class CourseStreakAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'current_streak', 'longest_streak', 'last_attendance_week')
    list_filter = ('course', 'last_attendance_week')
    search_fields = ('student__user_number', 'student__first_name', 'student__last_name', 'course__code')
    readonly_fields = ('created_at', 'updated_at')