from rest_framework import serializers

from utilities.rfid_util.models import RFIDTag


class RFIDTagSerializer(serializers.ModelSerializer):
    user_id = serializers.ReadOnlyField(source='user.id')  # Show user_id
    user_email = serializers.ReadOnlyField(source='user.email')  # Show email instead of username

    class Meta:
        model = RFIDTag
        fields = '__all__'

