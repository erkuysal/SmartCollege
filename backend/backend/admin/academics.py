from django.contrib import admin

from academics.attendance.models import Attendance, AttendanceSession
from academics.enrollment.models import Enrollment
# from academics.grades.models import Grade

from college.courses.models import Course


class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'session', 'status', 'timestamp')
    list_filter = ('status', 'session')


class AttendanceInline(admin.TabularInline):  # ✅ Inline Attendance Records inside Courses
    model = Attendance
    extra = 1  # Number of empty rows for adding attendance records


# class CourseAdmin(admin.ModelAdmin):
#     list_display = ('course_code', 'course_name', 'department', 'credit_hours')
#     inlines = [AttendanceInline]


class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ('lecturer', 'course', 'classroom', 'start_time', 'is_active')
    list_filter = ('is_active', 'course')


class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'semester', 'academic_year', 'date_enrolled')


# class GradeAdmin(admin.ModelAdmin):
#     list_display = ('student', 'course', 'grade', 'date_recorded')


models_to_register = [
    (Attendance, AttendanceAdmin),
    (AttendanceSession, AttendanceSessionAdmin),
    (Enrollment, EnrollmentAdmin),
    # (Grade, GradeAdmin),

    # Inline Connections
    # (Course, CourseAdmin),
]
