from rest_framework import serializers

from .models import Schedule


class ScheduleSerializer(serializers.ModelSerializer):
    classroom_name = serializers.ReadOnlyField(source='classroom.name')
    facility_name = serializers.ReadOnlyField(source='facility.name')
    course_name = serializers.ReadOnlyField(source='course.course_name')

    class Meta:
        model = Schedule
        fields = '__all__'
