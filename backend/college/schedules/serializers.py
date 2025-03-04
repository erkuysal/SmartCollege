from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from .models import Schedule, TimeSlot

class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['id', 'day_of_week', 'start_time', 'end_time']


class ScheduleSerializer(serializers.ModelSerializer):
    time_slot_display = serializers.SerializerMethodField()
    classroom_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = [
            'id',
            'classroom',
            'classroom_name',
            'course',
            'course_name',
            'time_slot',
            'time_slot_display',
            'semester',
            'academic_year',
            'is_active'
        ]

    @extend_schema_field(OpenApiTypes.STR)
    def get_time_slot_display(self, obj):
        return str(obj.time_slot) if obj.time_slot else ''

    @extend_schema_field(OpenApiTypes.STR)
    def get_classroom_name(self, obj):
        return obj.classroom.name if obj.classroom else ''

    @extend_schema_field(OpenApiTypes.STR)
    def get_course_name(self, obj):
        return obj.course.name if obj.course else ''