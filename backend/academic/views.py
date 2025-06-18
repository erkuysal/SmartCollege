from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import CourseRegistration, ClassSchedule, AcademicYear, Semester, CourseOffering
from .serializers import CourseRegistrationSerializer, ClassScheduleSerializer, AcademicYearSerializer, SemesterSerializer, CourseOfferingSerializer
from users.models import BaseUser

# Create your views here.

class CourseRegistrationViewSet(viewsets.ModelViewSet):
    queryset = CourseRegistration.objects.all()
    serializer_class = CourseRegistrationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        # Students see their own registrations, lecturers see their courses, admins see all
        if user.user_type == 'student':
            return qs.filter(student=user)
        elif user.user_type == 'lecturer':
            return qs.filter(course_offering__instructor=user)
        return qs

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def approve(self, request, pk=None):
        registration = self.get_object()
        if request.user.user_type != 'lecturer':
            return Response({'detail': 'Only lecturers can approve.'}, status=403)
        registration.approve(request.user)
        serializer = self.get_serializer(registration)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def reject(self, request, pk=None):
        registration = self.get_object()
        if request.user.user_type != 'lecturer':
            return Response({'detail': 'Only lecturers can reject.'}, status=403)
        reason = request.data.get('reason', '')
        registration.reject(request.user, reason=reason)
        serializer = self.get_serializer(registration)
        return Response(serializer.data)

class ClassScheduleViewSet(viewsets.ModelViewSet):
    queryset = ClassSchedule.objects.all()
    serializer_class = ClassScheduleSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        course_offering = self.request.query_params.get('course_offering')
        if course_offering:
            qs = qs.filter(course_offering_id=course_offering)
        return qs

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def generate_sessions(self, request, pk=None):
        schedule = self.get_object()
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        sessions = schedule.generate_future_sessions(start_date, end_date)
        return Response({'created_sessions': len(sessions)})

class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    permission_classes = [AllowAny]

class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer
    permission_classes = [AllowAny]

class CourseOfferingViewSet(viewsets.ModelViewSet):
    queryset = CourseOffering.objects.all()
    serializer_class = CourseOfferingSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        course = self.request.query_params.get('course')
        semester = self.request.query_params.get('semester')
        if course:
            qs = qs.filter(course_id=course)
        if semester:
            qs = qs.filter(semester_id=semester)
        return qs
