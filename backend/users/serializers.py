from rest_framework import serializers
from .models import Student, Lecturer, BaseUser


# class StudentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Student
#         fields = ['id', 'student_number', 'first_name', 'last_name']
#         read_only_fields = ['student_number']

class BaseUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaseUser
        fields = [
            'id',
            'user_number',
            'email',
            'first_name',
            'last_name',
            'user_type',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'user_number',
            'email',
            'user_type',
            'created_at',
            'updated_at'
        ]


class StudentSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        model = Student
        fields = BaseUserSerializer.Meta.fields + ['student_number']
        read_only_fields = BaseUserSerializer.Meta.read_only_fields + ['student_number']

    def create(self, validated_data):
        return Student.objects.create(**validated_data)


class LecturerSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        model = Lecturer
        fields = BaseUserSerializer.Meta.fields + ['lecturer_number', 'title']
        read_only_fields = BaseUserSerializer.Meta.read_only_fields + ['lecturer_number']

    def create(self, validated_data):
        return Lecturer.objects.create(**validated_data)

