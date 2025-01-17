from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Student, Teacher
from .serializers import StudentSerializer, TeacherSerializer

# Import our Arduino helper functions
from .utils.serial_bridge import send_to_arduino_write, read_from_arduino


class StudentViewSet(viewsets.ModelViewSet):
    """
    A ViewSet to handle CRUD operations for students
    and custom actions for writing and reading RFID cards via Arduino.
    """

    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    lookup_field = "student_number"
    lookup_url_kwarg = "student_number"

    @action(detail=True, methods=["post"], url_path="card/write", url_name="write-rfid")
    def write_rfid(self, request, student_number=None):
        """
        POST /students/<student_number>/card/write/
        Sends only the student's number to the Arduino for writing an RFID card.
        """
        student = self.get_object()

        # ONLY the student_number
        data_to_write = str(student.student_number)

        # Use your existing utility that sends "WRITE:<data>" to Arduino
        arduino_response = send_to_arduino_write(data_to_write)
        if "error" in arduino_response:
            return Response(
                {"error": arduino_response["error"]},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # If success, mark your model
        student.written_to_card = True
        student.save()

        return Response(
            {
                "message": f"RFID card written with student number {student.student_number}."
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="card/read", url_name="read-rfid")
    def read_rfid(self, request):
        """
        GET /students/card/read/
        Reads the student number from the RFID card (via Arduino) and retrieves student details.
        """
        # Ask Arduino to read the card
        arduino_response = read_from_arduino()

        if "error" in arduino_response:
            return Response(
                {"error": arduino_response["error"]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Extract the student number returned by Arduino
        student_number = arduino_response.get("data")
        if not student_number:
            return Response(
                {"error": "No student number read from the RFID card. Ensure the card is present and try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Attempt to locate a matching student in the DB
        try:
            student = get_object_or_404(Student, student_number=student_number)
        except Exception as e:
            return Response(
                {"error": f"Student not found for number: {student_number}."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Serialize the student details and return them
        serializer = StudentSerializer(student)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TeacherViewSet(viewsets.ModelViewSet):
    """
    A ViewSet to handle CRUD operations for teachers
    """
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

