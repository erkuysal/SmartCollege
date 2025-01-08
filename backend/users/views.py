from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Student
from .serializers import StudentSerializer

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
        Reads data from the RFID card (via Arduino) and validates against the DB.
        """
        # Ask Arduino to read the card
        arduino_response = read_from_arduino()

        if "error" in arduino_response:
            return Response(
                {"error": arduino_response["error"]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Extract the card data returned by Arduino (e.g. "12345,John,Doe")
        card_data = arduino_response.get("data")
        if not card_data:
            return Response(
                {"error": "No data read from the RFID card. Ensure the card is present and try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate the format "student_number,first_name,last_name"
        parts = card_data.split(",")
        if len(parts) != 3:
            return Response(
                {"error": "Invalid card data format. Expected: student_number,first_name,last_name."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        student_number, first_name, last_name = parts

        # Attempt to locate a matching student in the DB
        student = get_object_or_404(Student, student_number=student_number)

        # Compare first/last names
        if student.first_name == first_name and student.last_name == last_name:
            return Response(
                {"message": "Card data validated successfully.", "valid": True},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"message": "Card data does not match.", "valid": False},
                status=status.HTTP_400_BAD_REQUEST,
            )
