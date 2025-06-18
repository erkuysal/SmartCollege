# attendance/serializers.py
from datetime import timezone
from django.utils import timezone
from django.db import models
from typing import Dict, Any, Optional

from rest_framework import serializers
from users.models import BaseUser
from users.serializers import BaseUserSerializer
from .models import AttendanceRecord, AttendanceSession, Course, Classroom, Schedule


class AttendanceRecordSerializer(serializers.ModelSerializer):
    # We accept user_number (write-only) to look up the User
    user_number = serializers.CharField(write_only=True)

    # We accept session_id (write-only) to identify which AttendanceSession
    session_id = serializers.PrimaryKeyRelatedField(
        queryset=AttendanceSession.objects.all(),
        source='session',
        write_only=True
    )

    # For read-only output, show nested User and nested Session (or at least their IDs)
    student = BaseUserSerializer(read_only=True)
    session = serializers.PrimaryKeyRelatedField(read_only=True)
    timestamp = serializers.DateTimeField(read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id',
            'student',        # nested User
            'user_number',    # write-only
            'session',        # read-only FK
            'session_id',     # write-only FK
            'timestamp'
        ]
        read_only_fields = ['id', 'student', 'session', 'timestamp']

    def validate(self, attrs):
        """
        Ensure that both user_number and session are provided (via session_id)
        """
        user_number = attrs.get('user_number')
        session = attrs.get('session')
        if user_number is None:
            raise serializers.ValidationError({
                'user_number': 'This field is required.'
            })
        if session is None:
            raise serializers.ValidationError({
                'session_id': 'This field is required.'
            })
        return attrs

    def create(self, validated_data):
        """
        On attendance creation, look up User by user_number and use session.
        """
        user_number = validated_data.pop('user_number')
        session = validated_data.pop('session')  # this came from session_id

        try:
            user = BaseUser.objects.get(user_number=user_number)
        except BaseUser.DoesNotExist:
            raise serializers.ValidationError({
                'user_number': f"No user with number {user_number}."
            })

        # This will raise IntegrityError if a record already exists (unique_together).
        attendance = AttendanceRecord.objects.create(
            student=user,
            session=session,
            timestamp=timezone.now()
            # points_earned=calculated_points
        )
        return attendance


class AttendanceSessionSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = AttendanceSession
        fields = ['id', 'name', 'course', 'start_time', 'end_time', 'is_active']
        read_only_fields = ['id', 'start_time', 'is_active']


class StartSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceSession
        fields = ['name', 'course', 'end_time']
        read_only_fields = ['start_time']

    def create(self, validated_data):
        return AttendanceSession.objects.create(**validated_data)


class EndSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceSession
        fields = ['end_time']
        read_only_fields = ['id', 'name', 'start_time', 'is_active']

    def update(self, instance, validated_data):
        instance.end_time = validated_data.get('end_time', timezone.now())
        instance.save()
        return instance


class MarkAttendanceResponseSerializer(serializers.Serializer):
    """
    Serializer for attendance marking response.
    Ensures consistent response format for both single scan and continuous scanning modes.
    """
    status = serializers.CharField()
    user_number = serializers.CharField()
    uid = serializers.CharField()
    session_id = serializers.IntegerField()
    timestamp = serializers.DateTimeField()
    message = serializers.CharField()


class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for Course model.
    Includes nested serialization for instructor and students.
    """
    instructor_name = serializers.SerializerMethodField()
    enrolled_students_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id',
            'code',
            'name',
            'description',
            'instructor',
            'instructor_name',
            'is_active',
            'enrolled_students_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_instructor_name(self, obj: Course) -> str:
        if hasattr(obj.instructor, 'lecturer'):
            return f"{obj.instructor.lecturer.title} {obj.instructor.first_name} {obj.instructor.last_name}"
        return f"{obj.instructor.first_name} {obj.instructor.last_name}"

    def get_enrolled_students_count(self, obj: Course) -> int:
        return len(obj.get_registered_students())


class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = ['id', 'name']
        read_only_fields = ['id']


class ScheduleSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    time_slot_display = serializers.SerializerMethodField(read_only=True)
    day_name = serializers.CharField(source='get_day_display', read_only=True)

    class Meta:
        model = Schedule
        fields = [
            'id',
            'course',
            'course_name',
            'course_code',
            'classroom',
            'classroom_name',
            'time_slot',
            'time_slot_display',
            'day',
            'day_name',
            'is_active',
            'notes',
            'start_date',
            'end_date',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_time_slot_display(self, obj: Schedule) -> str:
        return dict(Schedule.TIME_SLOTS).get(obj.time_slot, str(obj.time_slot))

    def validate(self, attrs):
        """
        Check for schedule conflicts and validate required fields
        """
        # Validate required fields
        if not attrs.get('course'):
            raise serializers.ValidationError({
                'course': 'Course is required.'
            })
        if not attrs.get('classroom'):
            raise serializers.ValidationError({
                'classroom': 'Classroom is required.'
            })
        if not attrs.get('time_slot'):
            raise serializers.ValidationError({
                'time_slot': 'Time slot is required.'
            })
        if attrs.get('day') is None:
            raise serializers.ValidationError({
                'day': 'Day is required.'
            })

        # Create a temporary instance to check conflicts
        instance = Schedule(**attrs)
        conflicts = Schedule.objects.filter(
            day=instance.day,
            time_slot=instance.time_slot
        ).filter(
            models.Q(classroom=instance.classroom) |  # Same classroom
            models.Q(course=instance.course)          # Same course
        ).exclude(id=instance.id)

        if conflicts.exists():
            conflict = conflicts.first()
            if conflict.course == instance.course:
                raise serializers.ValidationError({
                    'course': 'This course already has a schedule at this time.'
                })
            if conflict.classroom == instance.classroom:
                raise serializers.ValidationError({
                    'classroom': 'This classroom is already booked at this time.'
                })

        return attrs