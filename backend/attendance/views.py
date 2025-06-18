# attendance/views.py

import os
import serial
import json
from datetime import datetime
import threading
import time

from rest_framework import viewsets, status, serializers
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import APIException, NotFound, ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework.decorators import action

from django.utils import timezone
from django.conf import settings
from django.http import StreamingHttpResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from django.db.models.deletion import ProtectedError
from django.core.exceptions import ValidationError
from django.db.transaction import atomic
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from users.models import BaseUser
from users.serializers import BaseUserSerializer
from .models import AttendanceRecord, AttendanceSession, Course, Classroom, Schedule
from .serializers import (
    AttendanceRecordSerializer,
    AttendanceSessionSerializer,
    MarkAttendanceResponseSerializer,
    StartSessionSerializer,
    EndSessionSerializer,
    CourseSerializer,
    ClassroomSerializer,
    ScheduleSerializer
)
from rfid.services import read_rfid_card, continuous_scan
from .helpers import mark_attendance, AttendanceError, AlreadyMarked, InvalidCard, UserNotFound, SessionNotActive
from academic.models import CourseRegistration


class StandardResultsSetPagination(PageNumberPagination):
    """
    Custom pagination class for standardizing API response pagination.
    
    Attributes:
        page_size (int): Default number of items per page
        page_size_query_param (str): Query parameter name for customizing page size
        max_page_size (int): Maximum allowed items per page
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


class AttendanceSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing attendance sessions.
    Provides CRUD operations and session management actions.
    """
    queryset = AttendanceSession.objects.all()
    serializer_class = AttendanceSessionSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]  # <-- Add this line
    filterset_fields = ['course']  

    def get_serializer_class(self):
        if self.action == 'create':
            return StartSessionSerializer
        elif self.action == 'partial_update':
            return EndSessionSerializer
        return self.serializer_class

    @action(detail=True, methods=['post'])
    def end_session(self, request, pk=None):
        """End an active attendance session."""
        session = self.get_object()
        if not session.is_active:
            return Response(
                {'error': 'Session is already ended'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.end_time = timezone.now()
        session.save()
        return Response(self.get_serializer(session).data)

    def create(self, request, *args, **kwargs):
        serializer = StartSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = serializer.save()
        # Use the full serializer for the response
        output_serializer = AttendanceSessionSerializer(session)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing attendance records.
    Provides CRUD operations with filtering capabilities.
    """
    queryset = AttendanceRecord.objects.select_related('student', 'session').all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'timestamp': ['date'],
        'session': ['exact'],
    }

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.order_by('-timestamp')


class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing courses.
    Provides CRUD operations and additional actions for course management.
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

    @action(detail=True, methods=['post'])
    def enroll_student(self, request, pk=None):
        """Enroll a student in the course."""
        course = self.get_object()
        user_number = request.data.get('user_number')
        
        try:
            user = BaseUser.objects.get(user_number=user_number, user_type='student')
            current_offering = course.get_current_offering()
            
            if not current_offering:
                return Response(
                    {'error': 'No active course offering found for this course'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create a new registration
            registration = CourseRegistration.objects.create(
                student=user,
                course_offering=current_offering,
                status='approved'  # Auto-approve for now
            )
            
            return Response({'status': 'student enrolled'})
        except BaseUser.DoesNotExist:
            return Response(
                {'error': f'Student with number {user_number} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def unenroll_student(self, request, pk=None):
        """Remove a student from the course."""
        course = self.get_object()
        user_number = request.data.get('user_number')
        
        try:
            user = BaseUser.objects.get(user_number=user_number, user_type='student')
            current_offering = course.get_current_offering()
            
            if not current_offering:
                return Response(
                    {'error': 'No active course offering found for this course'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Find and update the registration
            registration = CourseRegistration.objects.get(
                student=user,
                course_offering=current_offering,
                status='approved'
            )
            registration.drop()
            
            return Response({'status': 'student unenrolled'})
        except BaseUser.DoesNotExist:
            return Response(
                {'error': f'Student with number {user_number} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except CourseRegistration.DoesNotExist:
            return Response(
                {'error': 'Student is not enrolled in this course'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True)
    def enrolled_students(self, request, pk=None):
        """List all students enrolled in the course."""
        course = self.get_object()
        registrations = CourseRegistration.objects.approved_for_course(course)
        students = [reg.student for reg in registrations]
        serializer = BaseUserSerializer(students, many=True)
        return Response(serializer.data)


class MarkAttendanceAPIView(APIView):
    """
    API endpoint for marking student attendance using RFID cards.
    Supports both single scan and continuous scanning modes.
    """
    permission_classes = [AllowAny]
    serializer_class = MarkAttendanceResponseSerializer
    rfid_reader = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        try:
            self.rfid_reader = serial.Serial(
                port=settings.RFID_PORT,
                baudrate=settings.RFID_BAUDRATE,
                timeout=1
            )
        except Exception as e:
            print(f"Failed to initialize RFID reader: {e}")

    def __del__(self):
        if self.rfid_reader and self.rfid_reader.is_open:
            self.rfid_reader.close()

    def get(self, request, *args, **kwargs):
        """Handle continuous scanning mode."""
        continuous = request.query_params.get('continuous', 'false').lower() == 'true'
        if not continuous:
            return Response(
                {"detail": "Continuous mode not enabled"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate session
        session_id = request.query_params.get('session')
        if not session_id:
            return Response(
                {"detail": "Session ID is required for continuous scanning"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            session = AttendanceSession.objects.get(id=session_id)
        except AttendanceSession.DoesNotExist:
            return Response(
                {"detail": f"Session {session_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        def event_stream():
            retry_count = 0
            max_retries = 3
            last_error_time = None
            error_cooldown = 5  # seconds between error messages
            
            try:
                while True:
                    # Read RFID card
                    success, result = read_rfid_card()
                    
                    if success:
                        retry_count = 0  # Reset retry count on success
                        try:
                            # Use the mark_attendance helper
                            attendance_result = mark_attendance(
                                session=session,
                                user_number=result["user"].user_number,
                                uid=result["uid"]
                            )
                            yield f"data: {json.dumps(attendance_result)}\n\n"
                        except (UserNotFound, InvalidCard, AlreadyMarked, SessionNotActive) as e:
                            yield f"data: {json.dumps({
                                'status': 'error',
                                'message': str(e)
                            })}\n\n"
                        except Exception as e:
                            yield f"data: {json.dumps({
                                'status': 'error',
                                'message': str(e)
                            })}\n\n"
                    else:
                        retry_count += 1
                        if retry_count >= max_retries:
                            yield f"data: {json.dumps({
                                'status': 'error',
                                'message': 'Failed to read RFID card after multiple attempts'
                            })}\n\n"
                            retry_count = 0
                        time.sleep(0.1)  # Small delay between retries

            except Exception as e:
                yield f"data: {json.dumps({
                    'status': 'error',
                    'message': str(e)
                })}\n\n"

        return StreamingHttpResponse(
            event_stream(),
            content_type='text/event-stream'
        )

    def post(self, request, *args, **kwargs):
        """Handle single scan mode."""
        session_id = request.data.get('session')
        user_number = request.data.get('user_number')
        uid = request.data.get('uid')

        if not all([session_id, user_number, uid]):
            return Response(
                {"detail": "session, user_number, and uid are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            session = AttendanceSession.objects.get(id=session_id)
        except AttendanceSession.DoesNotExist:
            return Response(
                {"detail": f"Session {session_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            result = mark_attendance(
                session=session,
                user_number=user_number,
                uid=uid
            )
            return Response(result)
        except (UserNotFound, InvalidCard, AlreadyMarked, SessionNotActive) as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StartSessionAPIView(APIView):
    """
    API endpoint for starting a new attendance session.
    
    Endpoint:
        POST /api/sessions/start/
        
    Request Body (optional):
        {
            "name": "Morning Session",  # Optional session name
            "end_time": "2024-03-21T10:02:00Z"  # Optional end time
        }
        
    Responses:
        201 Created:
            {
                "id": 1,
                "name": "Morning Session",
                "start_time": "2025-06-07T09:00:00Z",
                "end_time": "2025-06-07T10:02:00Z",
                "is_active": true,
                "students": [],  # Initially empty, will be populated as students scan
                "message": "New session started successfully with continuous scanning"
            }
            
        400 Bad Request:
            {
                "name": ["Session name must be 100 characters or less"]
            }
    """
    serializer_class = StartSessionSerializer
    permission_classes = [AllowAny]

    @atomic
    def post(self, request, format=None):
        # End any active session first
        active_sessions = AttendanceSession.objects.filter(end_time__isnull=True)
        for session in active_sessions:
            session.end_time = timezone.now()
            session.save()

        # Create new session
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        session = serializer.save(start_time=timezone.now())
        
        # Start continuous scanning in a background thread
        threading.Thread(target=self._continuous_scan_worker, args=(session.id,), daemon=True).start()
        
        return Response({
            "id": session.id,
            "name": session.name,
            "start_time": session.start_time,
            "end_time": session.end_time,
            "is_active": session.is_active,
            "students": [],  # Initially empty, will be populated as students scan
            "message": "New session started successfully with continuous scanning"
        })

    def _continuous_scan_worker(self, session_id):
        """Background worker for continuous scanning"""
        try:
            session = AttendanceSession.objects.get(id=session_id)
            for event in continuous_scan():
                if event.startswith("data: "):
                    try:
                        data = json.loads(event[6:])  # Remove "data: " prefix
                        if data.get("status") == "ok" and "student_number" in data:
                            # Try to mark attendance
                            try:
                                student = BaseUser.objects.get(user_number=data["student_number"], user_type='student')
                                AttendanceRecord.objects.create(
                                    student=student,
                                    session=session,
                                    timestamp=timezone.now()
                                )
                            except BaseUser.DoesNotExist:
                                print(f"Student not found: {data['student_number']}")
                            except Exception as e:
                                print(f"Error marking attendance: {e}")
                    except json.JSONDecodeError:
                        continue
        except Exception as e:
            print(f"Error in continuous scan worker: {e}")


class EndSessionAPIView(APIView):
    """
    API endpoint for ending an attendance session.
    
    Endpoint:
        POST /api/sessions/{id}/end/
        
    Request Body (optional):
        {
            "end_time": "2025-06-07T10:00:00Z"  # Optional end time
        }
        
    Responses:
        200 OK:
            {
                "id": 1,
                "name": "Morning Session",
                "start_time": "2025-06-07T09:00:00Z",
                "end_time": "2025-06-07T10:00:00Z",
                "is_active": false,
                "students": [
                    {
                        "student_number": "S20250001",
                        "first_name": "John",
                        "last_name": "Doe",
                        "timestamp": "2025-06-07T09:00:00Z"
                    }
                ],
                "total_students": 1,
                "message": "Session ended successfully"
            }
            
        400 Bad Request:
            {
                "detail": "end_time must be a valid ISO 8601 timestamp"
            }
            
        404 Not Found:
            {
                "detail": "Not found"
            }
    """
    serializer_class = EndSessionSerializer
    permission_classes = [AllowAny]

    @atomic
    def post(self, request, id, format=None):
        session = get_object_or_404(AttendanceSession, id=id)
        
        if session.end_time:
            return Response(
                {"detail": "Session is already ended"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.serializer_class(session, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        session = serializer.save()
        
        # Get all attendance records for this session
        attendance_records = AttendanceRecord.objects.filter(session=session).select_related('student')
        
        # Format the response
        return Response({
            "id": session.id,
            "name": session.name,
            "start_time": session.start_time,
            "end_time": session.end_time,
            "is_active": session.is_active,
            "students": [
                {
                    "student_number": record.student.user_number,
                    "first_name": record.student.first_name,
                    "last_name": record.student.last_name,
                    "timestamp": record.timestamp
                }
                for record in attendance_records
            ],
            "total_students": attendance_records.count(),
            "message": "Session ended successfully"
        })


class ListSessionsAPIView(APIView):
    """
    API endpoint for listing all attendance sessions.
    
    Endpoint:
        GET /api/sessions/
        
    Responses:
        200 OK:
            [
                {
                    "id": 1,
                    "name": "Morning Session",
                    "start_time": "2025-06-07T09:00:00Z",
                    "end_time": "2025-06-07T10:00:00Z",
                    "is_active": false
                },
                ...
            ]
    """
    serializer_class = AttendanceSessionSerializer
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        sessions = AttendanceSession.objects.all().order_by('-start_time')
        serializer = self.serializer_class(sessions, many=True)
        return Response(serializer.data)


class ClassroomViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing classrooms.
    Provides CRUD operations for physical classrooms.
    """
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]


class ScheduleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing class schedules.
    Provides CRUD operations and additional actions for schedule management.
    """
    queryset = Schedule.objects.select_related('course', 'classroom').all()
    serializer_class = ScheduleSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'course': ['exact'],
        'classroom': ['exact'],
        'day': ['exact'],
        'is_active': ['exact'],
    }

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def check_conflicts(self, request):
        """
        Check for schedule conflicts based on provided parameters.
        """
        course_id = request.query_params.get('course')
        classroom_id = request.query_params.get('classroom')
        time_slot_id = request.query_params.get('time_slot')
        day = request.query_params.get('day')

        if not all([course_id, classroom_id, time_slot_id, day]):
            return Response(
                {'error': 'All parameters (course, classroom, time_slot, day) are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            schedule = Schedule(
                course_id=course_id,
                classroom_id=classroom_id,
                time_slot_id=time_slot_id,
                day=day
            )
            conflicts = Schedule.objects.filter(
                day=schedule.day,
                time_slot=schedule.time_slot
            ).filter(
                models.Q(classroom=schedule.classroom) |  # Same classroom
                models.Q(course=schedule.course)          # Same course
            )

            if conflicts.exists():
                conflict = conflicts.first()
                if conflict.course == schedule.course:
                    return Response({
                        'has_conflicts': True,
                        'conflict_type': 'course',
                        'message': 'This course already has a schedule at this time.'
                    })
                if conflict.classroom == schedule.classroom:
                    return Response({
                        'has_conflicts': True,
                        'conflict_type': 'classroom',
                        'message': 'This classroom is already booked at this time.'
                    })

            return Response({'has_conflicts': False})
        except (Course.DoesNotExist, Classroom.DoesNotExist, TimeSlot.DoesNotExist):
            return Response(
                {'error': 'Invalid course, classroom, or time slot ID'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_course(self, request):
        """
        Get all schedules for a specific course.
        """
        course_id = request.query_params.get('course')
        if not course_id:
            return Response(
                {'error': 'Course ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            schedules = self.queryset.filter(course_id=course_id)
            serializer = self.get_serializer(schedules, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_classroom(self, request):
        """
        Get all schedules for a specific classroom.
        """
        classroom_id = request.query_params.get('classroom')
        if not classroom_id:
            return Response(
                {'error': 'Classroom ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            schedules = self.queryset.filter(classroom_id=classroom_id)
            serializer = self.get_serializer(schedules, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )