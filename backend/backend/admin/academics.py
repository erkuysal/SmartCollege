from django.contrib import admin

from academics.attendance.models import Attendance, AttendanceSession
from academics.enrollment.models import Enrollment
# from academics.grades.models import Grade

from college.courses.models import Course


class AttendanceAdmin(admin.ModelAdmin):
    list_display = [
        'student',
        'session',
        'attendance_status',  # Changed from 'status'
        'timestamp'
    ]
    list_filter = [
        'attendance_status',  # Changed from 'status'
        'session',
        'timestamp'
    ]
    search_fields = ['student__user__email', 'session__course__course_name']


class AttendanceInline(admin.TabularInline):  # ✅ Inline Attendance Records inside Courses
    model = Attendance
    extra = 1  # Number of empty rows for adding attendance records


# class CourseAdmin(admin.ModelAdmin):
#     list_display = ('course_code', 'course_name', 'department', 'credit_hours')
#     inlines = [AttendanceInline]


class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ['course', 'lecturer', 'classroom', 'start_time', 'is_active']
    list_filter = ['is_active', 'course', 'lecturer']
    search_fields = ['course__course_name', 'lecturer__user__email']


class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'get_course', 'get_term', 'get_academic_year', 'date_enrolled')
    list_filter = ['section__academic_term__term', 'section__academic_term__academic_year', 'status']
    search_fields = ['student__user__username', 'section__course__code', 'section__course__name']
    
    def get_course(self, obj):
        return obj.section.course
    get_course.short_description = 'Course'
    
    def get_term(self, obj):
        return obj.section.academic_term.term
    get_term.short_description = 'Term'
    
    def get_academic_year(self, obj):
        return obj.section.academic_term.academic_year
    get_academic_year.short_description = 'Academic Year'


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
