from django.contrib import admin
from django.apps import apps

from college.classrooms.models import Classroom
from college.courses.models import Course, CoursePackage
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
    list_display = ['code', 'name', 'department', 'credits', 'semester', 'is_active']
    list_filter = ['department', 'semester', 'is_active']
    search_fields = ['code', 'name', 'description']
    filter_horizontal = ['prerequisites']
    ordering = ['code']


class CoursePackageAdmin(admin.ModelAdmin):
    list_display = ['department', 'semester']
    list_filter = ['department', 'semester']
    filter_horizontal = ['courses']
    ordering = ['department__name', 'semester']


class ScheduleAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'classroom',
        'get_course',
        'get_time_slot',
        'get_term',
        'get_academic_year',
        'is_active'
    ]
    list_filter = [
        'is_active',
        'section__academic_term__term',
        'section__academic_term__academic_year',
        'classroom',
    ]
    search_fields = [
        'section__course__name',
        'classroom__name',
    ]
    ordering = ['section__academic_term__term', 'section__academic_term__academic_year']

    def get_time_slot(self, obj):
        return str(obj.time_slot)
    get_time_slot.short_description = 'Time Slot'
    
    def get_course(self, obj):
        return obj.section.course
    get_course.short_description = 'Course'
    
    def get_term(self, obj):
        return obj.section.academic_term.term
    get_term.short_description = 'Term'
    
    def get_academic_year(self, obj):
        return obj.section.academic_term.academic_year
    get_academic_year.short_description = 'Academic Year'


class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['day_of_week', 'get_day_display', 'start_time', 'end_time']
    list_filter = ['day_of_week']
    ordering = ['day_of_week', 'start_time']
    
    def get_day_display(self, obj):
        return obj.get_day_of_week_display()
    get_day_display.short_description = 'Day'


class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'faculty', 'head_of_department', 'is_active']
    list_filter = ['faculty', 'is_active']
    search_fields = ['name', 'head_of_department']


class FacultyAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'dean']
    search_fields = ['name', 'code', 'dean']


# Define the models to register with the admin site
models_to_register = [
    (Classroom, ClassroomAdmin),
    (Course, CourseAdmin),
    (CoursePackage, CoursePackageAdmin),
    (Schedule, ScheduleAdmin),
    (TimeSlot, TimeSlotAdmin),
    (Department, DepartmentAdmin),
    (Faculty, FacultyAdmin),
]

# Try to register CourseSection and SectionAssignment if they exist
try:
    CourseSection = apps.get_model('courses', 'CourseSection')
    SectionAssignment = apps.get_model('courses', 'SectionAssignment')
    
    class CourseSectionAdmin(admin.ModelAdmin):
        list_display = ['course', 'section_number', 'get_term', 'get_academic_year', 'capacity', 'is_active']
        list_filter = ['academic_term__term', 'academic_term__academic_year', 'is_active']
        search_fields = ['course__code', 'course__name', 'section_number']
        ordering = ['course__code', 'section_number']
        
        def get_term(self, obj):
            return obj.academic_term.term
        get_term.short_description = 'Term'
        
        def get_academic_year(self, obj):
            return obj.academic_term.academic_year
        get_academic_year.short_description = 'Academic Year'

    class SectionAssignmentAdmin(admin.ModelAdmin):
        list_display = ['section', 'room', 'timeslot', 'created_at']
        list_filter = ['section__academic_term__term', 'section__academic_term__academic_year', 'room__building']
        search_fields = ['section__course__code', 'section__course__name', 'room__name']
        raw_id_fields = ['section', 'room', 'timeslot']
        ordering = ['-created_at']
    
    # Add to models_to_register if they exist
    models_to_register.extend([
        (CourseSection, CourseSectionAdmin),
        (SectionAssignment, SectionAssignmentAdmin),
    ])
except LookupError:
    # Models don't exist yet - they'll be registered after migrations
    pass