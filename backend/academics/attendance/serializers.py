from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field  # ✅ Fixes OpenAPI schema issues
from .models import AttendanceSession, Attendance


class AttendanceSessionSerializer(serializers.ModelSerializer):
    """Serializer for Attendance Sessions"""

    lecturer_email = serializers.ReadOnlyField(source="lecturer.user.email")
    classroom_name = serializers.ReadOnlyField(source="classroom.name")
    course_name = serializers.ReadOnlyField(source="course.course_name")
    session_status = serializers.SerializerMethodField()  # ✅ Added to show real-time session status

    class Meta:
        model = AttendanceSession
        fields = '__all__'

    @extend_schema_field(serializers.CharField())  # ✅ Ensure OpenAPI handles this correctly
    def get_session_status(self, obj) -> str:
        """Returns the current status of the session: Present, Late, or Closed"""
        return obj.get_status()


class AttendanceSerializer(serializers.ModelSerializer):
    """Serializer for Attendance Records"""

    student_email = serializers.ReadOnlyField(source="student.user.email")
    course_name = serializers.ReadOnlyField(source="session.course.course_name")
    attendance_status = serializers.ChoiceField(
        source="status", choices=Attendance.ATTENDANCE_STATUS_CHOICES
    )  # ✅ Fixes enum collision in OpenAPI
    timestamp = serializers.DateTimeField(format="%Y-%m-%d %H:%M")  # ✅ Better timestamp format

    class Meta:
        model = Attendance
        fields = '__all__'


class UpdateAttendanceStatusSerializer(serializers.ModelSerializer):
    """Serializer for updating attendance status"""

    attendance_status = serializers.ChoiceField(
        source="status", choices=Attendance.ATTENDANCE_STATUS_CHOICES
    )  # ✅ Renamed to prevent enum conflicts

    class Meta:
        model = Attendance
        fields = ['attendance_status']

    def validate_attendance_status(self, value):
        """Ensures only 'Absent' can be changed to 'Excused'"""
        instance = self.instance
        if instance and instance.status not in ["Absent", "Excused"]:
            raise serializers.ValidationError("Only 'Absent' status can be changed to 'Excused'.")
        return value