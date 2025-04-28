from rest_framework import status, viewsets, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiResponse
import random

from .serial_bridge import read_from_arduino, send_to_arduino_write
from .models import RFIDCard
from .serializers import (
    RFIDCardSerializer,
    RFIDResponseSerializer,
    UserRFIDSerializer,
    WriteRFIDRequestSerializer,
    WriteRFIDResponseSerializer,
    AssignRFIDToPersonnelSerializer,
    UpdateRFIDStatusSerializer,
    StaffSerializer
)

from users.base.models import User
from users.students.models import Student
from users.lecturers.models import Lecturer
from users.staff.models import Staff

from users.students.serializers import StudentSerializer
from users.lecturers.serializers import LecturerSerializer
from users.staff.serializers import StaffSerializer


class RFIDCardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing RFID cards.
    """
    queryset = RFIDCard.objects.all().select_related('user', 'assigned_to_personnel')
    serializer_class = RFIDCardSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tag_id', 'user__email', 'user__username']
    ordering_fields = ['issued_at', 'last_used_at', 'card_status']
    ordering = ['-issued_at']
    
    def get_queryset(self):
        """
        Optionally filter by card status.
        """
        queryset = super().get_queryset()
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(card_status=status)
        return queryset
    
    @action(detail=True, methods=['post'])
    def assign_to_personnel(self, request, pk=None):
        """
        Assign an RFID card to a staff member for writing.
        """
        rfid_card = self.get_object()
        serializer = AssignRFIDToPersonnelSerializer(data=request.data)
        
        if serializer.is_valid():
            staff_id = serializer.validated_data['staff_id']
            try:
                staff = Staff.objects.get(id=staff_id)
                rfid_card.assigned_to_personnel = staff
                rfid_card.card_status = RFIDCard.STATUS_ASSIGNED
                rfid_card.save()
                
                return Response({
                    'message': f'RFID card assigned to {staff.first_name} {staff.last_name}',
                    'rfid_card': RFIDCardSerializer(rfid_card).data
                })
            except Staff.DoesNotExist:
                return Response(
                    {'error': 'Staff member not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update the status of an RFID card.
        """
        rfid_card = self.get_object()
        serializer = UpdateRFIDStatusSerializer(data=request.data)
        
        if serializer.is_valid():
            new_status = serializer.validated_data['new_status']
            notes = serializer.validated_data.get('notes', '')
            
            # Update the card status
            rfid_card.card_status = new_status
            
            # Add notes if provided
            if notes:
                rfid_card.notes = notes
            
            # Handle special status changes
            if new_status == RFIDCard.STATUS_WRITTEN:
                rfid_card.written_at = timezone.now()
            elif new_status == RFIDCard.STATUS_LOST:
                rfid_card.is_active = False
            elif new_status == RFIDCard.STATUS_INACTIVE:
                rfid_card.is_active = False
            elif new_status == RFIDCard.STATUS_ISSUED:
                rfid_card.is_active = True
            
            rfid_card.save()
            
            return Response({
                'message': f'RFID card status updated to {rfid_card.get_card_status_display()}',
                'rfid_card': RFIDCardSerializer(rfid_card).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        Get all pending RFID cards.
        """
        pending_cards = RFIDCard.objects.filter(card_status=RFIDCard.STATUS_PENDING)
        serializer = self.get_serializer(pending_cards, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def assigned(self, request):
        """
        Get all RFID cards assigned to personnel.
        """
        staff_id = request.query_params.get('staff_id')
        if staff_id:
            assigned_cards = RFIDCard.objects.filter(
                card_status=RFIDCard.STATUS_ASSIGNED,
                assigned_to_personnel_id=staff_id
            )
        else:
            assigned_cards = RFIDCard.objects.filter(card_status=RFIDCard.STATUS_ASSIGNED)
        
        serializer = self.get_serializer(assigned_cards, many=True)
        return Response(serializer.data)


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
            rfid_card = RFIDCard.objects.select_related('user').get(
                tag_id=tag_id, 
                is_active=True
            )
            user = rfid_card.user

            # Record RFID usage
            rfid_card.record_usage()

            response_data = {
                "user_type": user.role,
                "user": UserRFIDSerializer(user).data,
                "rfid": RFIDCardSerializer(rfid_card).data
            }

            return Response(response_data)

        except RFIDCard.DoesNotExist:
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
            200: WriteRFIDResponseSerializer,
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
        staff_id = serializer.validated_data.get("staff_id")

        try:
            user = User.objects.get(id=user_id)
            
            # Get staff member if provided
            staff = None
            if staff_id:
                try:
                    staff = Staff.objects.get(id=staff_id)
                except Staff.DoesNotExist:
                    return Response(
                        {"error": "Staff member not found."}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Get or create RFID card
            try:
                rfid_card = RFIDCard.objects.get(user=user)
                
                # Update existing card
                rfid_card.tag_id = rfid_tag
                rfid_card.card_status = RFIDCard.STATUS_WRITTEN
                rfid_card.written_at = timezone.now()
                rfid_card.is_active = True
                
                if staff:
                    rfid_card.assigned_to_personnel = staff
                
                rfid_card.save()
                
            except RFIDCard.DoesNotExist:
                # Create new card
                rfid_card = RFIDCard.objects.create(
                    user=user,
                    tag_id=rfid_tag,
                    card_status=RFIDCard.STATUS_WRITTEN,
                    written_at=timezone.now(),
                    assigned_to_personnel=staff,
                    is_active=True
                )
            
            # Send write command to Arduino
            arduino_response = send_to_arduino_write(rfid_tag)
            
            return Response({
                "message": "RFID card successfully written and assigned.",
                "rfid_card": RFIDCardSerializer(rfid_card).data
            })

        except User.DoesNotExist:
            return Response(
                {"error": "User not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )


class AssignRFIDView(APIView):
    """
    Automatically assigns a new RFID tag to a user.
    """
    def post(self, request):
        user_id = request.data.get("user_id")
        
        if not user_id:
            return Response(
                {"error": "User ID is required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = User.objects.get(id=user_id)
            
            # Check if user already has an RFID card
            if hasattr(user, 'rfid_card'):
                return Response(
                    {"error": "User already has an RFID card assigned."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Generate a unique tag ID in the format T{5DIGIT}
            while True:
                tag_id = f"T{random.randint(10000, 99999)}"
                if not RFIDCard.objects.filter(tag_id=tag_id).exists():
                    break
                    
            # Create new RFID card
            rfid_card = RFIDCard.objects.create(
                user=user,
                tag_id=tag_id,
                card_status=RFIDCard.STATUS_PENDING,
                is_active=True
            )
            
            return Response({
                "message": "RFID card successfully assigned.",
                "rfid_card": RFIDCardSerializer(rfid_card).data
            })
            
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )


class StaffListView(APIView):
    """
    Get a list of staff members who can write RFID cards.
    """
    def get(self, request):
        staff = Staff.objects.all()
        serializer = StaffSerializer(staff, many=True)
        return Response(serializer.data)