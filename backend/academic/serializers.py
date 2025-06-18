from rest_framework import serializers
from .models import AcademicYear, Semester, CourseOffering, ClassSchedule, CourseRegistration
from attendance.models import Course, Classroom
from users.models import BaseUser
from typing import Dict, Any, Optional
from datetime import date


class AcademicYearSerializer(serializers.ModelSerializer):
    duration = serializers.SerializerMethodField()
    is_current = serializers.SerializerMethodField()

    class Meta:
        model = AcademicYear
        fields = ['id', 'year', 'start_date', 'end_date', 'is_active', 'duration', 'is_current', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_duration(self, obj: AcademicYear) -> str:
        return f"{obj.start_date.strftime('%b %Y')} - {obj.end_date.strftime('%b %Y')}"

    def get_is_current(self, obj: AcademicYear) -> bool:
        from django.utils import timezone
        today = timezone.now().date()
        return obj.start_date <= today <= obj.end_date

    def validate(self, data):
        # Ensure end_date is after start_date
        if data['end_date'] <= data['start_date']:
            raise serializers.ValidationError("End date must be after start date")
        
        # Ensure year format matches the pattern YYYY-YYYY
        year = data['year']
        try:
            start_year, end_year = map(int, year.split('-'))
            if end_year != start_year + 1:
                raise serializers.ValidationError("Academic year must be in format YYYY-YYYY where second year is first year + 1")
        except ValueError:
            raise serializers.ValidationError("Academic year must be in format YYYY-YYYY")

        return data


class SemesterSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    registration_period = serializers.SerializerMethodField()
    is_registration_open = serializers.SerializerMethodField()

    class Meta:
        model = Semester
        fields = [
            'id', 'academic_year', 'semester_type', 'start_date', 'end_date',
            'registration_start', 'registration_end', 'is_active', 'full_name',
            'registration_period', 'is_registration_open', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_full_name(self, obj: Semester) -> str:
        return obj.full_name

    def get_registration_period(self, obj: Semester) -> str:
        return f"{obj.registration_start.strftime('%b %d')} - {obj.registration_end.strftime('%b %d, %Y')}"

    def get_is_registration_open(self, obj: Semester) -> bool:
        return obj.is_registration_open

    def validate(self, data):
        # Ensure dates are within academic year
        academic_year = data['academic_year']
        if data['start_date'] < academic_year.start_date or data['end_date'] > academic_year.end_date:
            raise serializers.ValidationError("Semester dates must be within academic year dates")

        # Ensure registration period is before semester start
        if data['registration_end'] >= data['start_date']:
            raise serializers.ValidationError("Registration period must end before semester start date")

        # Ensure end_date is after start_date
        if data['end_date'] <= data['start_date']:
            raise serializers.ValidationError("End date must be after start date")

        return data


class CourseRegistrationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    course_code = serializers.CharField(source='course_offering.course.code', read_only=True)
    semester = serializers.CharField(source='course_offering.semester.full_name', read_only=True)
    instructor = serializers.CharField(source='course_offering.instructor.get_full_name', read_only=True)
    can_register = serializers.BooleanField(read_only=True)
    approval_date = serializers.DateTimeField(read_only=True)
    approved_by = serializers.CharField(source='approved_by.get_full_name', read_only=True)

    class Meta:
        model = CourseRegistration
        fields = [
            'id', 'student', 'student_name', 'course_offering', 'course_code', 'semester', 'instructor',
            'status', 'registration_date', 'approval_date', 'approved_by', 'notes', 'can_register',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'registration_date', 'approval_date', 'approved_by', 'created_at', 'updated_at', 'can_register']


class CourseOfferingSerializer(serializers.ModelSerializer):
    semester_name = serializers.SerializerMethodField()
    enrollment_status = serializers.SerializerMethodField()
    available_slots = serializers.SerializerMethodField()

    class Meta:
        model = CourseOffering
        fields = [
            'id', 'course', 'semester', 'semester_name', 'instructor', 'capacity', 
            'enrolled_count', 'enrollment_status', 'available_slots',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'enrolled_count']

    def get_semester_name(self, obj: CourseOffering) -> str:
        return obj.semester.full_name

    def get_enrollment_status(self, obj: CourseOffering) -> str:
        if obj.is_full:
            return "Full"
        percentage = (obj.enrolled_count / obj.capacity) * 100
        if percentage >= 80:
            return "Almost Full"
        return "Available"

    def get_available_slots(self, obj: CourseOffering) -> int:
        return obj.capacity - obj.enrolled_count

    def validate(self, data):
        # Ensure instructor is a lecturer
        instructor = data['instructor']
        if instructor.user_type != 'lecturer':
            raise serializers.ValidationError("Instructor must be a lecturer")

        # Ensure capacity is positive
        if data['capacity'] <= 0:
            raise serializers.ValidationError("Capacity must be positive")

        return data


class ClassScheduleSerializer(serializers.ModelSerializer):
    course_details = serializers.SerializerMethodField()
    time_slot_display = serializers.SerializerMethodField()
    next_session = serializers.SerializerMethodField()
    recurrence_rule = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = ClassSchedule
        fields = [
            'id', 'course_offering', 'classroom', 'day', 'time_slot',
            'is_active', 'notes', 'recurrence_rule', 'course_details', 'time_slot_display',
            'next_session', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_course_details(self, obj: ClassSchedule) -> Dict[str, str]:
        return {
            'code': obj.course_offering.course.code,
            'name': obj.course_offering.course.name,
            'instructor': obj.course_offering.instructor.get_full_name()
        }

    def get_time_slot_display(self, obj: ClassSchedule) -> str:
        return dict(ClassSchedule.TIME_SLOTS)[obj.time_slot]

    def get_next_session(self, obj: ClassSchedule) -> str:
        from django.utils import timezone
        from datetime import timedelta

        today = timezone.now().date()
        day_index = list(dict(ClassSchedule.DayOfWeek.choices).keys()).index(obj.day)
        
        # Find next occurrence of this day
        days_ahead = day_index - today.weekday()
        if days_ahead <= 0:
            days_ahead += 7
        
        next_date = today + timedelta(days=days_ahead)
        return next_date.strftime('%Y-%m-%d')

    def validate(self, data):
        # Check for schedule conflicts
        if data['course_offering'].schedules.filter(
            day=data['day'],
            time_slot=data['time_slot'],
            classroom=data['classroom'],
            is_active=True
        ).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Classroom is already booked for this time slot")

        # Check instructor conflicts
        if data['course_offering'].schedules.filter(
            day=data['day'],
            time_slot=data['time_slot'],
            course_offering__instructor=data['course_offering'].instructor,
            is_active=True
        ).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Instructor has another class at this time")

        return data 