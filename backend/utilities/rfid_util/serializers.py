from rest_framework import serializers
from users.base.models import User
from .models import RFIDTag

from users.students.models import Student
from users.lecturers.models import Lecturer


class RFIDTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = RFIDTag
        fields = ['tag_id', 'issued_at', 'last_used_at', 'is_active']


class UserRFIDSerializer(serializers.ModelSerializer):
    rfid_tag = RFIDTagSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'role', 'rfid_tag']


class RFIDReaderResponseSerializer(serializers.Serializer):
    user_type = serializers.ChoiceField(choices=["Student", "Lecturer"])
    user = serializers.JSONField()


class WriteRFIDRequestSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    rfid_tag = serializers.CharField(max_length=50)


class WriteRFIDResponseSerializer(serializers.Serializer):
    message = serializers.CharField()


class RFIDResponseSerializer(serializers.Serializer):
    user_type = serializers.CharField()
    user = UserRFIDSerializer()
    rfid = RFIDTagSerializer()

