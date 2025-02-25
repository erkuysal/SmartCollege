from rest_framework import serializers

from users.base.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'rfid_tag']
        read_only_fields = ['role', 'rfid_tag']

