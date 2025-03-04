from rest_framework import serializers
from users.students.models import Student
from drf_spectacular.utils import extend_schema_field  # ✅ Fixes OpenAPI schema issues


class StudentSerializer(serializers.ModelSerializer):
    """Serializer for Student model"""

    student_status = serializers.ChoiceField(
        choices=Student.STUDENT_STATUS_CHOICES
    )  # Remove incorrect source="status"
    email = serializers.ReadOnlyField(source="user.email")  # ✅ Display user's email
    faculty_name = serializers.ReadOnlyField(source="faculty.name")  # ✅ Show faculty name
    first_name = serializers.ReadOnlyField(source="user.first_name")
    last_name = serializers.ReadOnlyField(source="user.last_name")

    class Meta:
        model = Student
        fields = [
            'id', 
            'first_name',
            'last_name',
            'email', 
            'faculty', 
            'faculty_name', 
            'student_status', 
            'semester', 
            'student_number',
            'rfid_tag', 
            'balance_points', 
            'enrolled_at'
        ]

    @extend_schema_field(serializers.CharField())  # ✅ Ensure OpenAPI recognizes this field correctly
    def get_student_status(self, obj) -> str:
        return obj.student_status  # Changed from obj.status to obj.student_status

