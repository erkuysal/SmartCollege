from rest_framework import serializers
from .models import Classroom, Courses, Schedule, Attendance, Enrollment


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


class EnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Enrollment model.
    Handles creation and listing of enrollments.
    """
    student_name = serializers.CharField(source='student.name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course', 'enrollment_date', 'is_active', 'student_name', 'course_title']
        read_only_fields = ['enrollment_date']

    def validate(self, data):
        # Check for duplicate enrollments
        student = data.get('student')
        course = data.get('course')

        if Enrollment.objects.filter(student=student, course=course).exists():
            raise serializers.ValidationError("This student is already enrolled in the course.")
        return data


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['attendance_date']

