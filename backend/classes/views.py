from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Classroom, Courses, Schedule, Attendance
from .serializers import (
    ClassroomSerializer,
    CourseSerializer,
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

