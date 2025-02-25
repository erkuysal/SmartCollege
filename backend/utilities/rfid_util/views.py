from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .serial_bridge import read_from_arduino, send_to_arduino_write
from .models import RFIDTag
from .serializers import (
    RFIDTagSerializer,
    RFIDResponseSerializer,
    UserRFIDSerializer,
    WriteRFIDRequestSerializer
)

from users.base.models import User
from users.students.models import Student
from users.lecturers.models import Lecturer
from users.staff.models import Staff

from users.students.serializers import StudentSerializer
from users.lecturers.serializers import LecturerSerializer
from users.staff.serializers import StaffSerializer


class RFIDTagViewSet(viewsets.ModelViewSet):
    queryset = RFIDTag.objects.all()
    serializer_class = RFIDTagSerializer


class RFIDReaderView(APIView):
    """
    Reads an RFID tag and returns the associated user.
    """
    serializer_class = RFIDResponseSerializer

    @extend_schema(
        responses={
            200: RFIDResponseSerializer,
            404: OpenApiResponse(description="RFID tag not found"),
            400: OpenApiResponse(description="Invalid RFID read")
        }
    )
    def get(self, request):
        response = read_from_arduino()

        if "error" in response:
            return Response(
                {"error": response["error"]}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        tag_id = response.get("data")

        try:
            rfid_tag = RFIDTag.objects.select_related('user').get(
                tag_id=tag_id, 
                is_active=True
            )
            user = rfid_tag.user

            # Record RFID usage
            rfid_tag.record_usage()

            response_data = {
                "user_type": user.role,
                "user": UserRFIDSerializer(user).data,
                "rfid": {
                    "tag_id": rfid_tag.tag_id,
                    "last_used": rfid_tag.last_used_at
                }
            }

            return Response(
                RFIDResponseSerializer(response_data).data
            )

        except RFIDTag.DoesNotExist:
            return Response(
                {"error": "No active user found for this RFID tag."}, 
                status=status.HTTP_404_NOT_FOUND
            )


class WriteRFIDView(APIView):
    """
    Assigns RFID tag to any user type.
    """
    serializer_class = WriteRFIDRequestSerializer

    @extend_schema(
        request=WriteRFIDRequestSerializer,
        responses={
            200: UserRFIDSerializer,
            404: OpenApiResponse(description="User not found"),
            400: OpenApiResponse(description="Invalid request data")
        }
    )
    def post(self, request):
        serializer = WriteRFIDRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )

        rfid_tag = serializer.validated_data["rfid_tag"]
        user_id = serializer.validated_data["user_id"]

        try:
            user = User.objects.get(id=user_id)
            
            # Create or update RFID tag
            RFIDTag.objects.update_or_create(
                user=user,
                defaults={
                    'tag_id': rfid_tag,
                    'is_active': True,
                    'issued_at': timezone.now()
                }
            )

            # Update user's rfid_tag field
            user.rfid_tag = rfid_tag
            user.save(update_fields=['rfid_tag'])

            send_to_arduino_write(rfid_tag)
            
            return Response(
                UserRFIDSerializer(user).data,
                status=status.HTTP_200_OK
            )

        except User.DoesNotExist:
            return Response(
                {"error": "User not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )