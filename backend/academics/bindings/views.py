from rest_framework import viewsets

from .models import LecturerCourse
from .serializers import LecturerCourseSerializer


class LecturerCourseViewSet(viewsets.ModelViewSet):
    queryset = LecturerCourse.objects.all()
    serializer_class = LecturerCourseSerializer

    