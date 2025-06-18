from django.shortcuts import render
from rest_framework import viewsets
from .models import Student, Lecturer
from .serializers import StudentSerializer, LecturerSerializer

# Create your views here.

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class LecturerViewSet(viewsets.ModelViewSet):
    queryset = Lecturer.objects.all()
    serializer_class = LecturerSerializer
