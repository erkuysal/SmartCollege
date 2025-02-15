from rest_framework import serializers

from .models import LecturerCourse


class LecturerCourseSerializer(serializers.ModelSerializer):
    lecturer_name = serializers.ReadOnlyField(source="lecturer.user.username")
    course_name = serializers.ReadOnlyField(source="course.course_name")

    class Meta:
        model = LecturerCourse
        fields = '__all__'

