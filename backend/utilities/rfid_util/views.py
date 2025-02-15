from django.utils import timezone

from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from users.base.serializers import UserSerializer

from utilities.rfid_util.models import RFIDTag
from utilities.rfid_util.serializers import RFIDTagSerializer


class RFIDTagViewSet(viewsets.ModelViewSet):
    queryset = RFIDTag.objects.all()
    serializer_class = RFIDTagSerializer


@api_view(['POST'])
def identify_user(request):
    """
    Identifies a user based on an RFID scan.
    Expected JSON Payload: {"tag_id": "123456"}
    """
    tag_id = request.data.get("tag_id")

    try:
        rfid = RFIDTag.objects.get(tag_id=tag_id)
        user_data = UserSerializer(rfid.user).data
        return Response({"user": user_data}, status=200)

    except RFIDTag.DoesNotExist:
        return Response({"error": "RFID tag not found"}, status=404)


@api_view(['POST'])
def write_to_rfid(request):
    """
    Writes user data to an RFID tag.
    Expected JSON Payload: {"tag_id": "123456", "user_id": 1}
    """
    tag_id = request.data.get("tag_id")
    user_id = request.data.get("user_id")

    try:
        # Ensure the tag exists
        rfid = RFIDTag.objects.get(tag_id=tag_id)

        # Assign the tag to the user if it belongs to another user
        if rfid.user.id != user_id:
            return Response({"error": "RFID tag is already assigned to another user"}, status=400)

        # Simulate writing data to RFID (in real-world cases, integrate with an RFID writer)
        rfid.last_written_at = timezone.now()
        rfid.save()

        return Response({"message": f"RFID tag {tag_id} updated for user {rfid.user.email}"}, status=200)

    except RFIDTag.DoesNotExist:
        return Response({"error": "RFID tag not found"}, status=404)

