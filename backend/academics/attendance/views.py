from django.utils import timezone

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from users.students.models import Student
from users.lecturers.models import Lecturer

from college.courses.models import Course
from college.classrooms.models import Classroom

from .models import Attendance, AttendanceSession
from .serializers import AttendanceSerializer, UpdateAttendanceStatusSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer


@api_view(['POST'])
def start_attendance_session(request):
    """
    Starts an attendance session when the lecturer scans their RFID.
    Expected JSON: {"rfid_tag": "123456", "classroom_id": 1}
    """
    rfid_tag = request.data.get("rfid_tag")
    classroom_id = request.data.get("classroom_id")

    try:
        lecturer = Lecturer.objects.get(user__rfid_tag__tag_id=rfid_tag)
        classroom = Classroom.objects.get(id=classroom_id)

        # Check if there is an active scheduled course in this classroom
        now = timezone.now()
        from college.schedules.models import Schedule

        schedule = Schedule.objects.filter(
            classroom=classroom,
            start_time__lte=now,
            end_time__gte=now
        ).first()

        if not schedule:
            return Response({"error": "No scheduled lesson at this time"}, status=400)

        # Start an attendance session
        session = AttendanceSession.objects.create(
            lecturer=lecturer,
            classroom=classroom,
            course=schedule.course
        )

        return Response({"message": "Attendance started", "session_id": session.id}, status=201)

    except Lecturer.DoesNotExist:
        return Response({"error": "Lecturer not found"}, status=404)
    except Classroom.DoesNotExist:
        return Response({"error": "Classroom not found"}, status=404)


@api_view(['POST'])
def mark_attendance(request):
    """
    Marks student attendance during an active session.
    Expected JSON: {"rfid_tag": "123456", "session_id": 1}
    """
    rfid_tag = request.data.get("rfid_tag")
    session_id = request.data.get("session_id")

    try:
        student = Student.objects.get(user__rfid_tag__tag_id=rfid_tag)
        session = AttendanceSession.objects.get(id=session_id, is_active=True)

        if session.get_status() == "Closed":
            return Response({"error": "Attendance has closed"}, status=400)

        attendance, created = Attendance.objects.get_or_create(
            session=session,
            student=student,
            defaults={"status": session.get_status()}
        )

        if not created:
            return Response({"message": "Attendance already recorded"}, status=400)

        return Response({"message": f"Attendance recorded as {attendance.status}"}, status=201)

    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)
    except AttendanceSession.DoesNotExist:
        return Response({"error": "Session not found or closed"}, status=404)



@api_view(['PATCH'])
@permission_classes([IsAdminUser])  # ✅ Only admins can change to "Excused"
def update_attendance_status(request, attendance_id):
    """
    Updates an attendance record to "Excused".
    Only 'Absent' status can be updated.
    """
    try:
        attendance = Attendance.objects.get(id=attendance_id)

        serializer = UpdateAttendanceStatusSerializer(attendance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": f"Attendance status updated to {attendance.status}"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Attendance.DoesNotExist:
        return Response({"error": "Attendance record not found"}, status=status.HTTP_404_NOT_FOUND)



