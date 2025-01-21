from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Classroom, Courses, Enrollment, Schedule, Attendance
from .serializers import (
    ClassroomSerializer,
    CourseSerializer,
    EnrollmentSerializer,
    ScheduleSerializer,
    AttendanceSerializer
)


class ClassroomViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing classroom instances.
    """
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer

    @action(detail=True, methods=['get'])
    def schedule(self, request, pk=None):
        """
        Custom endpoint to fetch the schedule for a specific classroom.
        """
        try:
            classroom = self.get_object()  # Get the classroom instance by PK
            schedules = Schedule.objects.filter(classroom=classroom).order_by('day_of_week', 'start_time')
            serializer = ScheduleSerializer(schedules, many=True)
            return Response(serializer.data)
        except Classroom.DoesNotExist:
            return Response({"error": "Classroom not found."}, status=404)


class CourseViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing lesson instances.
    """
    queryset = Courses.objects.all()
    serializer_class = CourseSerializer


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for managing enrollments.
    Provides create, retrieve, update, and delete functionality.
    """
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer

    def create(self, request, *args, **kwargs):
        """
        Override the create method to check for duplicate enrollments.
        """
        student_id = request.data.get('student')
        course_id = request.data.get('course')

        # Check if the enrollment already exists
        if Enrollment.objects.filter(student_id=student_id, course_id=course_id).exists():
            return Response(
                {'detail': 'This student is already enrolled in the course.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Proceed with creation if no duplicates
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        """
        Override the destroy method to handle the deletion of enrollments.
        """
        enrollment = self.get_object()
        enrollment.delete()
        return Response({'success': True, 'message': 'Enrollment deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class ScheduleViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing schedule instances, with filtering support.
    """
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['classroom']  # Allows filtering schedules by classroom
    search_fields = ['course__title', 'classroom__name']  # Allows searching by course title or classroom name


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing attendance instances.
    """
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

