from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from users.lecturers.models import Lecturer
from users.base.models import User


class LecturerSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    faculty_name = serializers.ReadOnlyField(source='faculty.name')
    department_name = serializers.ReadOnlyField(source='department.name')
    
    class Meta:
        model = Lecturer
        fields = ['id', 'user', 'first_name', 'last_name', 'email', 'username', 
                  'department', 'department_name', 'faculty', 'faculty_name', 
                  'office_number', 'courses_taught']
        read_only_fields = ['id', 'first_name', 'last_name', 'email', 'username', 
                           'faculty_name', 'department_name']

