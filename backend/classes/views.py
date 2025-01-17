from rest_framework import viewsets

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


class CourseViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing lesson instances.
    """
    queryset = Courses.objects.all()
    serializer_class = CourseSerializer


class ScheduleViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing schedule instances.
    """
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing attendance instances.
    """
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

