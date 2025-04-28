from rest_framework import serializers

from .models import Enrollment, AcademicTerm


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="student.user.username")
    course_name = serializers.ReadOnlyField(source="course.name")

    class Meta:
        model = Enrollment
        fields = '__all__'


class AcademicTermSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicTerm
        fields = ['id', 'name', 'term', 'academic_year', 'start_date', 'end_date', 
                 'registration_start', 'registration_end', 'is_active']
