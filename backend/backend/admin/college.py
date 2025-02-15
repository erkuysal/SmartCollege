from django.contrib import admin

from college.classrooms.models import Classroom
from college.courses.models import Course
from college.schedules.models import Schedule
from college.facilities.models import Facility
from college.departments.models import Department


class ClassroomAdmin(admin.ModelAdmin):
    list_display = ('name', 'capacity', 'building', 'department', 'facility', 'has_projector', 'has_whiteboard', 'is_active', 'is_in_use_now', 'created_at')
    list_filter = ('building', 'department', 'facility', 'has_projector', 'has_whiteboard', 'is_active')
    search_fields = ('name', 'building', 'department__name', 'facility__name')
    ordering = ['-created_at']  # ✅ Default ordering by latest

    def is_in_use_now(self, obj):
        """Check if the classroom is currently in use"""
        return obj.is_in_use() if hasattr(obj, 'is_in_use') else False  # ✅ Prevent AttributeError
    is_in_use_now.boolean = True
    is_in_use_now.short_description = "In Use Now?"

    actions = ['mark_as_active', 'mark_as_inactive']

    def mark_as_active(self, request, queryset):
        queryset.update(is_active=True)
    mark_as_active.short_description = "Mark selected classrooms as Active"

    def mark_as_inactive(self, request, queryset):
        queryset.update(is_active=False)
    mark_as_inactive.short_description = "Mark selected classrooms as Inactive"


class CourseAdmin(admin.ModelAdmin):
    list_display = ('course_code', 'course_name', 'department', 'credit_hours', 'semester_offered', 'is_active', 'created_at')
    list_filter = ('department', 'is_active', 'semester_offered')
    search_fields = ('course_code', 'course_name', 'department__name')
    ordering = ['course_code']  # ✅ Sort courses alphabetically


class CourseInline(admin.TabularInline):  # ✅ Adds inline editing for Courses inside Departments
    model = Course
    extra = 0  # ✅ Set to 0 for a cleaner interface


class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'faculty')
    inlines = [CourseInline]
    ordering = ['name']  # ✅ Sort departments alphabetically


class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('classroom', 'facility', 'course', 'event_name', 'get_instructor', 'start_time', 'end_time', 'status')
    list_filter = ('status', 'classroom', 'facility', 'course')
    search_fields = ('event_name', 'course__course_name', 'classroom__name', 'facility__name', 'instructor')
    ordering = ['-start_time']  # ✅ Show upcoming schedules first

    def get_instructor(self, obj):
        """Retrieve instructor's name if available"""
        return obj.instructor.user.email if hasattr(obj, 'instructor') and obj.instructor else "N/A"  # ✅ Prevent errors
    get_instructor.short_description = "Instructor"


class FacilityAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'location', 'capacity', 'is_active', 'created_at')
    list_filter = ('type', 'is_active')
    search_fields = ('name', 'location')
    ordering = ['name']


models_to_register = [
    (Classroom, ClassroomAdmin),
    (Course, CourseAdmin),
    (Department, DepartmentAdmin),
    (Schedule, ScheduleAdmin),
    (Facility, FacilityAdmin),
]