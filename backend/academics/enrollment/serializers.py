from rest_framework import serializers

from .models import Enrollment


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="student.user.username")
    course_name = serializers.ReadOnlyField(source="course.course_name")

    class Meta:
        model = Enrollment
        fields = '__all__'
