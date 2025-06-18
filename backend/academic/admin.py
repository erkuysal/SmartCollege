from django.contrib import admin
from django.utils.html import format_html
from .models import AcademicYear, Semester, CourseOffering, ClassSchedule, CourseRegistration


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ('year', 'start_date', 'end_date', 'is_active', 'get_duration')
    list_filter = ('is_active',)
    search_fields = ('year',)
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('year', 'start_date', 'end_date', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_duration(self, obj):
        """Display the duration of the academic year"""
        return f"{obj.start_date.strftime('%b %Y')} - {obj.end_date.strftime('%b %Y')}"
    get_duration.short_description = 'Duration'


@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'get_duration', 'is_active', 'is_registration_open', 'get_registration_period')
    list_filter = ('semester_type', 'is_active', 'academic_year')
    search_fields = ('academic_year__year',)
    readonly_fields = ('created_at', 'updated_at', 'full_name')
    fieldsets = (
        (None, {
            'fields': ('academic_year', 'semester_type', 'start_date', 'end_date', 'is_active')
        }),
        ('Registration Period', {
            'fields': ('registration_start', 'registration_end')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_duration(self, obj):
        """Display the duration of the semester"""
        return f"{obj.start_date.strftime('%b %d')} - {obj.end_date.strftime('%b %d, %Y')}"
    get_duration.short_description = 'Duration'

    def get_registration_period(self, obj):
        """Display the registration period"""
        return f"{obj.registration_start.strftime('%b %d')} - {obj.registration_end.strftime('%b %d, %Y')}"
    get_registration_period.short_description = 'Registration Period'

    def full_name(self, obj):
        """Display the full semester name with styling"""
        return format_html(
            '<span style="font-weight: bold;">{}</span>',
            obj.full_name
        )
    full_name.short_description = 'Semester'


@admin.register(CourseOffering)
class CourseOfferingAdmin(admin.ModelAdmin):
    list_display = ('course', 'semester_full_name', 'instructor', 'capacity', 'enrolled_count', 'is_active', 'get_enrollment_status')
    list_filter = ('is_active', 'semester__semester_type', 'semester__academic_year')
    search_fields = ('course__code', 'course__name', 'instructor__username')
    readonly_fields = ('created_at', 'updated_at', 'enrolled_count')
    fieldsets = (
        (None, {
            'fields': ('course', 'semester', 'instructor', 'capacity', 'enrolled_count', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def semester_full_name(self, obj):
        """Display the full semester name"""
        return obj.semester.full_name
    semester_full_name.short_description = 'Semester'

    def get_enrollment_status(self, obj):
        """Display enrollment status with color coding"""
        if obj.is_full:
            return format_html(
                '<span style="color: red;">Full</span>'
            )
        percentage = (obj.enrolled_count / obj.capacity) * 100
        if percentage >= 80:
            color = 'orange'
        else:
            color = 'green'
        return format_html(
            '<span style="color: {};">{}%</span>',
            color,
            int(percentage)
        )
    get_enrollment_status.short_description = 'Enrollment Status'


@admin.register(ClassSchedule)
class ClassScheduleAdmin(admin.ModelAdmin):
    list_display = ('course_offering', 'day', 'get_time_slot_display', 'classroom', 'is_active', 'get_schedule_details')
    list_filter = ('day', 'is_active', 'course_offering__semester__semester_type', 'course_offering__semester__academic_year')
    search_fields = ('course_offering__course__code', 'course_offering__course__name', 'classroom__name')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('course_offering', 'classroom', 'day', 'time_slot', 'is_active')
        }),
        ('Additional Information', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_time_slot_display(self, obj):
        return dict(ClassSchedule.TIME_SLOTS)[obj.time_slot]
    get_time_slot_display.short_description = 'Time Slot'

    def get_schedule_details(self, obj):
        """Display schedule details in a formatted way"""
        return format_html(
            '<span style="font-weight: bold;">{} - {}</span><br>'
            '<span style="color: #666;">{}</span>',
            obj.course_offering.course.code,
            obj.course_offering.course.name,
            obj.classroom.name
        )
    get_schedule_details.short_description = 'Schedule Details'


@admin.register(CourseRegistration)
class CourseRegistrationAdmin(admin.ModelAdmin):
    list_display = ('student', 'course_offering', 'status', 'registration_date', 'approval_date', 'get_approver')
    list_filter = ('status', 'course_offering__semester', 'course_offering__course')
    search_fields = ('student__username', 'student__email', 'course_offering__course__code')
    readonly_fields = ('created_at', 'updated_at', 'registration_date', 'approval_date')
    fieldsets = (
        (None, {
            'fields': ('student', 'course_offering', 'status')
        }),
        ('Approval Information', {
            'fields': ('approved_by', 'approval_date', 'notes')
        }),
        ('Timestamps', {
            'fields': ('registration_date', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_approver(self, obj):
        if obj.approved_by:
            return obj.approved_by.get_full_name()
        return '-'
    get_approver.short_description = 'Approved By'

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.user_type == 'lecturer':
            # Lecturers can only see registrations for their courses
            return qs.filter(course_offering__instructor=request.user)
        return qs

    def has_change_permission(self, request, obj=None):
        if obj and request.user.user_type == 'lecturer':
            # Lecturers can only modify registrations for their courses
            return obj.course_offering.instructor == request.user
        return super().has_change_permission(request, obj)
