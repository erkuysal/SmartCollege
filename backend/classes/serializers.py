from rest_framework import serializers
from .models import Classroom, Courses, Schedule, Attendance


class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    # Optionally, you could display the teacher username if you prefer:
    # teacher_username = serializers.ReadOnlyField(source='teacher.username')

    class Meta:
        model = Courses
        fields = '__all__'


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['attendance_date']

