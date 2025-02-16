from django.utils import timezone
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.generics import GenericAPIView

from users.students.models import Student
from users.lecturers.models import Lecturer
from college.courses.models import Course
from college.classrooms.models import Classroom
from college.schedules.models import Schedule

from .models import Attendance, AttendanceSession
from .serializers import AttendanceSerializer, UpdateAttendanceStatusSerializer, AttendanceSessionSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing attendance records.
    """
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer


class StartAttendanceSessionView(GenericAPIView):
    """
    Starts an attendance session when the lecturer scans their RFID.
    """
    serializer_class = AttendanceSessionSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        rfid_tag = request.data.get("rfid_tag")
        classroom_id = request.data.get("classroom_id")

        lecturer = get_object_or_404(Lecturer, user__rfid_tag__tag_id=rfid_tag)
        classroom = get_object_or_404(Classroom, id=classroom_id)

        now = timezone.now()
        schedule = Schedule.objects.filter(
            classroom=classroom,
            start_time__lte=now,
            end_time__gte=now
        ).first()

        if not schedule:
            return Response({"error": "No scheduled lesson at this time"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if an active session already exists for this schedule
        session, created = AttendanceSession.objects.get_or_create(
            lecturer=lecturer,
            classroom=classroom,
            course=schedule.course,
            defaults={"start_time": timezone.now(), "is_active": True}
        )

        return Response({
            "message": "Attendance session started" if created else "Session already active",
            "session_id": session.id
        }, status=status.HTTP_201_CREATED)


class MarkAttendanceView(GenericAPIView):
    """
    Marks student attendance during an active session.
    """
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        rfid_tag = request.data.get("rfid_tag")
        session_id = request.data.get("session_id")

        student = get_object_or_404(Student, user__rfid_tag__tag_id=rfid_tag)
        session = get_object_or_404(AttendanceSession, id=session_id, is_active=True)

        if session.get_status() == "Closed":
            return Response({"error": "Attendance has closed"}, status=status.HTTP_400_BAD_REQUEST)

        attendance, created = Attendance.objects.get_or_create(
            session=session,
            student=student,
            defaults={"status": session.get_status()}
        )

        return Response({
            "message": f"Attendance recorded as {attendance.status}" if created else "Attendance already recorded"
        }, status=status.HTTP_201_CREATED if created else status.HTTP_400_BAD_REQUEST)


class UpdateAttendanceStatusView(GenericAPIView):
    """
    Updates an attendance record to "Excused".
    Only 'Absent' status can be updated.
    """
    serializer_class = UpdateAttendanceStatusSerializer
    permission_classes = [IsAdminUser]

    def patch(self, request, attendance_id):
        attendance = get_object_or_404(Attendance, id=attendance_id)

        serializer = self.get_serializer(attendance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": f"Attendance status updated to {attendance.status}"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)