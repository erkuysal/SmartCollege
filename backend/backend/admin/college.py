from django.contrib import admin

from college.classrooms.models import Classroom
from college.courses.models import Course
from college.schedules.models import Schedule, TimeSlot
from college.facilities.models import Facility
from college.departments.models import Department
from college.faculties.models import Faculty


class ClassroomAdmin(admin.ModelAdmin):
    list_display = ('name', 'capacity', 'building', 'department', 'facility', 'has_projector', 'has_whiteboard', 'is_active', 'is_in_use_now', 'created_at')
    list_filter = ('building', 'department', 'facility', 'has_projector', 'has_whiteboard', 'is_active')
    search_fields = ('name', 'building', 'department__name', 'facility__name')
    ordering = ['-created_at']  # Default ordering by latest

    def is_in_use_now(self, obj):
        """Check if the classroom is currently in use"""
        return obj.is_in_use() if hasattr(obj, 'is_in_use') else False  # Prevent AttributeError
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
    list_display = ('code', 'name', 'department', 'credits', 'semester', 'is_active', 'created_at')
    list_filter = ('department', 'is_active', 'semester')
    search_fields = ('code', 'name', 'department__name')
    ordering = ['code']


class CoursePackageAdmin(admin.ModelAdmin):
    list_display = ('department', 'semester')
    list_filter = ('department', 'semester')
    search_fields = ('department__name',)
    filter_horizontal = ('courses',)


class CourseInline(admin.TabularInline):  # Adds inline editing for Courses inside Departments
    model = Course
    extra = 0


class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'faculty')
    inlines = [CourseInline]
    ordering = ['name']


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['day_of_week', 'start_time', 'end_time']
    list_filter = ['day_of_week']
    ordering = ['day_of_week', 'start_time']


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'classroom',
        'course',
        'get_time_slot',
        'semester',
        'academic_year',
        'is_active'
    ]
    list_filter = [
        'is_active',
        'semester',
        'academic_year',
        'classroom',
    ]
    search_fields = [
        'course__name',
        'classroom__name',
    ]
    ordering = ['semester', 'academic_year']

    def get_time_slot(self, obj):
        return str(obj.time_slot)
    get_time_slot.short_description = 'Time Slot'


class FacilityAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'location', 'capacity', 'is_active', 'created_at')
    list_filter = ('type', 'is_active')
    search_fields = ('name', 'location')
    ordering = ['name']


class FacultyAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'dean', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'code', 'dean')
    ordering = ('name',)
    
    actions = ['mark_as_active', 'mark_as_inactive']
    
    def mark_as_active(self, request, queryset):
        queryset.update(is_active=True)
    mark_as_active.short_description = "Mark selected faculties as Active"
    
    def mark_as_inactive(self, request, queryset):
        queryset.update(is_active=False)
    mark_as_inactive.short_description = "Mark selected faculties as Inactive"


models_to_register = [
    (Classroom, ClassroomAdmin),
    (Course, CourseAdmin),
    (Department, DepartmentAdmin),
    (Schedule, ScheduleAdmin),
    (Facility, FacilityAdmin),
    (Faculty, FacultyAdmin),
]