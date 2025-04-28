from rest_framework import serializers
from users.base.models import User
from users.staff.models import Staff
from .models import RFIDCard

from users.students.models import Student
from users.lecturers.models import Lecturer


class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = ['id', 'first_name', 'last_name', 'email']


class RFIDCardSerializer(serializers.ModelSerializer):
    assigned_to_personnel_name = serializers.SerializerMethodField()
    card_status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = RFIDCard
        fields = [
            'id', 'tag_id', 'unique_identifier', 'card_status', 'card_status_display',
            'assigned_to_personnel', 'assigned_to_personnel_name',
            'issued_at', 'last_used_at', 'written_at', 'is_active', 'notes'
        ]
    
    def get_assigned_to_personnel_name(self, obj):
        if obj.assigned_to_personnel:
            return f"{obj.assigned_to_personnel.first_name} {obj.assigned_to_personnel.last_name}"
        return None
    
    def get_card_status_display(self, obj):
        return obj.get_card_status_display()


class UserRFIDSerializer(serializers.ModelSerializer):
    rfid_status = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'role', 'rfid_status']
    
    def get_rfid_status(self, obj):
        try:
            rfid_card = obj.rfid_card
            return {
                'tag_id': rfid_card.tag_id,
                'status': rfid_card.card_status,
                'status_display': rfid_card.get_card_status_display(),
                'is_active': rfid_card.is_active
            }
        except RFIDCard.DoesNotExist:
            return None


class RFIDReaderResponseSerializer(serializers.Serializer):
    user_type = serializers.ChoiceField(choices=["Student", "Lecturer", "Staff"])
    user = serializers.JSONField()


class WriteRFIDRequestSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    rfid_tag = serializers.CharField(max_length=50)
    staff_id = serializers.IntegerField(required=False)


class AssignRFIDToPersonnelSerializer(serializers.Serializer):
    rfid_card_id = serializers.IntegerField()
    staff_id = serializers.IntegerField()


class UpdateRFIDStatusSerializer(serializers.Serializer):
    rfid_card_id = serializers.IntegerField()
    new_status = serializers.ChoiceField(choices=[
        RFIDCard.STATUS_PENDING,
        RFIDCard.STATUS_ASSIGNED,
        RFIDCard.STATUS_WRITTEN,
        RFIDCard.STATUS_ISSUED,
        RFIDCard.STATUS_LOST,
        RFIDCard.STATUS_INACTIVE
    ])
    notes = serializers.CharField(required=False, allow_blank=True)


class WriteRFIDResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    rfid_card = RFIDCardSerializer()


class RFIDResponseSerializer(serializers.Serializer):
    user_type = serializers.CharField()
    user = UserRFIDSerializer()
    rfid = RFIDCardSerializer()

