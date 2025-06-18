from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.http import StreamingHttpResponse
from django.conf import settings

from .models import RFIDTag
from .serializers import (
    RFIDTagSerializer,
    WriteCardSerializer,
    ReadCardResponseSerializer
)
from .serial_writer import RFIDSerialWriter
from .serial_reader import RFIDSerialReader
from .services import read_rfid_card, continuous_scan

# Create your views here.

class RFIDTagViewSet(viewsets.ModelViewSet):
    queryset = RFIDTag.objects.all()
    serializer_class = RFIDTagSerializer


class WriteCardAPIView(APIView):
    """
    API endpoint for writing user numbers to RFID cards.
    """
    serializer_class = WriteCardSerializer
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_number = serializer.validated_data['user_number']
        port = getattr(settings, 'RFID_SERIAL_PORT', None)
        if not port:
            return Response(
                {"detail": "Serial port not configured."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        writer = RFIDSerialWriter(port=port, baudrate=115200, timeout=20)
        success, result = writer.write_user_number(user_number)
        if not success:
            return Response(
                {"detail": result},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({
            "status": "ok",
            "detail": "Successfully wrote user number to card",
            "uid": result.get("uid"),
            "tagId": result.get("tagId")
        })


class ReadCardAPIView(APIView):
    """
    API endpoint for reading user numbers from RFID cards.
    """
    serializer_class = ReadCardResponseSerializer
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        port = getattr(settings, 'RFID_SERIAL_PORT', None)
        if not port:
            return Response(
                {"detail": "Serial port not configured."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        reader = RFIDSerialReader(port=port, baudrate=115200, timeout=20)
        success, result = reader.read_user_number()
        if not success:
            return Response(
                {"detail": result},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({
            "status": "ok",
            "user_number": result.get("data"),
            "uid": result.get("uid")
        })

    post = get


@method_decorator(csrf_exempt, name='dispatch')
class ContinuousRFIDScanView(View):
    """
    Streaming endpoint for continuous RFID card scanning.
    Returns Server-Sent Events (SSE) with card scan records as they are detected.
    """
    def get(self, request, *args, **kwargs):
        resp = StreamingHttpResponse(
            continuous_scan(),
            content_type='text/event-stream'
        )
        resp["Cache-Control"] = "no-cache"
        resp["X-Accel-Buffering"] = "no"
        return resp
