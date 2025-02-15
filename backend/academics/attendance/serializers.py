from rest_framework import serializers

from .models import AttendanceSession, Attendance


class AttendanceSessionSerializer(serializers.ModelSerializer):
    lecturer_email = serializers.ReadOnlyField(source="lecturer.user.email")
    classroom_name = serializers.ReadOnlyField(source="classroom.name")
    course_name = serializers.ReadOnlyField(source="course.course_name")

    class Meta:
        model = AttendanceSession
        fields = '__all__'


class AttendanceSerializer(serializers.ModelSerializer):
    student_email = serializers.ReadOnlyField(source="student.user.email")
    course_name = serializers.ReadOnlyField(source="session.course.course_name")

    class Meta:
        model = Attendance
        fields = '__all__'


class UpdateAttendanceStatusSerializer(serializers.ModelSerializer):
    """Serializer for updating attendance status"""

    class Meta:
        model = Attendance
        fields = ['status']

    def validate_status(self, value):
        """Ensure only 'Absent' can be changed to 'Excused'"""
        instance = self.instance
        if instance and instance.status != "Absent":
            raise serializers.ValidationError("Only 'Absent' status can be changed to 'Excused'.")
        if value != "Excused":
            raise serializers.ValidationError("You can only change status to 'Excused'.")
        return value

