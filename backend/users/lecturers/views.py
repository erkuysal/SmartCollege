from rest_framework import viewsets

from users.lecturers.models import Lecturer
from users.lecturers.serializers import LecturerSerializer


class LecturerViewSet(viewsets.ModelViewSet):
    queryset = Lecturer.objects.all()
    serializer_class = LecturerSerializer


    

