from django.utils import timezone

from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from users.base.serializers import UserSerializer

from utilities.rfid_util.models import RFIDTag
from utilities.rfid_util.serializers import RFIDTagSerializer


class RFIDTagViewSet(viewsets.ModelViewSet):
    queryset = RFIDTag.objects.all()
    serializer_class = RFIDTagSerializer


class IdentifyUserView(GenericAPIView):
    """
    Identifies a user based on their RFID tag.
    """
    # permission_classes = [IsAuthenticated]
    serializer_class = RFIDTagSerializer

    def post(self, request):
        rfid_tag = request.data.get("rfid_tag")
        try:
            rfid = RFIDTag.objects.get(tag_id=rfid_tag)
            return Response({"user": rfid.user.email, "rfid_tag": rfid.tag_id}, status=status.HTTP_200_OK)
        except RFIDTag.DoesNotExist:
            return Response({"error": "RFID tag not found"}, status=status.HTTP_404_NOT_FOUND)


class WriteToRFIDView(GenericAPIView):
    """
    Writes user data to an RFID tag.
    """
    # permission_classes = [IsAuthenticated]
    serializer_class = RFIDTagSerializer

    def post(self, request):
        rfid_tag = request.data.get("rfid_tag")
        user_id = request.data.get("user_id")

        try:
            rfid = RFIDTag.objects.get(tag_id=rfid_tag)
            rfid.user_id = user_id
            rfid.save()
            return Response({"message": "RFID data updated successfully"}, status=status.HTTP_200_OK)
        except RFIDTag.DoesNotExist:
            return Response({"error": "RFID tag not found"}, status=status.HTTP_404_NOT_FOUND)

