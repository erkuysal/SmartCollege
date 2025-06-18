from rest_framework import serializers
from .models import RFIDTag
from users.serializers import BaseUserSerializer
from users.models import BaseUser


class RFIDTagSerializer(serializers.ModelSerializer):
    user = BaseUserSerializer(read_only=True)
    user_number = serializers.CharField(write_only=True)

    class Meta:
        model = RFIDTag
        fields = ['id', 'tag_id', 'user', 'user_number', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        user_number = validated_data.pop('user_number')
        try:
            user = BaseUser.objects.get(user_number=user_number)
            return RFIDTag.objects.create(user=user, **validated_data)
        except BaseUser.DoesNotExist:
            raise serializers.ValidationError({
                'user_number': f'User with number {user_number} not found'
            })


class WriteCardSerializer(serializers.Serializer):
    user_number = serializers.CharField(max_length=20)


class ReadCardResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
    user_number = serializers.CharField(required=False) 