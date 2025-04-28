from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from django.utils import timezone
from django.contrib.auth.decorators import login_required

from academics.enrollment.models import Enrollment, AcademicTerm

from college.courses.models import CoursePackage

from users.students.models import Student

from .serializers import EnrollmentSerializer, AcademicTermSerializer


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer


class AcademicTermViewSet(viewsets.ModelViewSet):
    """
    API endpoint for academic terms
    """
    queryset = AcademicTerm.objects.all()
    serializer_class = AcademicTermSerializer
    

class RefreshSemesterEnrollmentView(GenericAPIView):
    """
    Refresh semester enrollment: Activate students and assign courses.
    Only HoDs can perform this action.
    """
    permission_classes = [IsAdminUser]
    serializer_class = EnrollmentSerializer  # ✅ Explicitly set serializer_class

    def post(self, request):
        students = Student.objects.filter(status="Inactive")  # Only process inactive students

        for student in students:
            student.status = "Active"
            student.save()
            student.assign_courses_for_semester()

            for course in student.enrolled_courses.all():
                Enrollment.objects.create(student=student, course=course, semester=student.semester, date_enrolled=timezone.now())

        return Response({"message": "Semester enrollment refreshed successfully!"}, status=status.HTTP_200_OK)
