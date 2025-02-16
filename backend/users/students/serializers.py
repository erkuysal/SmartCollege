from rest_framework import serializers
from users.students.models import Student
from drf_spectacular.utils import extend_schema_field  # ✅ Fixes OpenAPI schema issues


class StudentSerializer(serializers.ModelSerializer):
    """Serializer for Student model"""

    student_status = serializers.ChoiceField(
        source="status", choices=Student.STUDENT_STATUS_CHOICES
    )  # ✅ Renaming `status` prevents enum collision
    email = serializers.ReadOnlyField(source="user.email")  # ✅ Display user's email
    department_name = serializers.ReadOnlyField(source="department.name")  # ✅ Show department name

    class Meta:
        model = Student
        fields = ['id', 'email', 'department_name', 'student_status', 'semester', 'rfid_tag', 'balance_points', 'enrolled_at']

    @extend_schema_field(serializers.CharField())  # ✅ Ensure OpenAPI recognizes this field correctly
    def get_student_status(self, obj) -> str:
        return obj.status

