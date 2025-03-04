from rest_framework import viewsets, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import transaction
from datetime import datetime
from django.conf import settings

from users.students.models import Student
from users.students.serializers import StudentSerializer
from college.faculties.models import Faculty


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        
        # Generate student number in format S{YYYY}{0000}
        year = datetime.now().year
        # Count students registered in the current year
        current_year_count = Student.objects.filter(student_number__startswith=f"S{year}").count()
        next_number = current_year_count + 1
        student_number = f"S{year}{str(next_number).zfill(4)}"  # S is already uppercase
        
        # Create a user for the student first
        User = get_user_model()
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        
        # Use student number as username (lowercase)
        username = student_number.lower()
        
        # Create the user
        user = User.objects.create(
            username=username,
            first_name=first_name,
            last_name=last_name,
            is_active=True
        )
        
        # Generate institutional email
        domain = getattr(settings, 'INSTITUTION_EMAIL_DOMAIN', 'std.institution.edu')
        user.email = f"{username}@{domain}"
        user.save(update_fields=['email'])
        
        # Handle faculty_id -> faculty conversion
        faculty = None
        if 'faculty_id' in data:
            faculty_id = data.pop('faculty_id')
            if faculty_id:
                try:
                    faculty = Faculty.objects.get(id=faculty_id)
                except Faculty.DoesNotExist:
                    user.delete()  # Clean up the user if faculty doesn't exist
                    return Response(
                        {"detail": f"Faculty with ID {faculty_id} does not exist"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        
        # Create the student directly
        try:
            student = Student.objects.create(
                user=user,
                faculty=faculty,
                student_status=data.get('student_status', 'ACTIVE'),
                student_number=student_number  # This is already uppercase
            )
            
            # Return the serialized student
            serializer = self.get_serializer(student)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # If student creation fails, delete the user to avoid orphaned users
            user.delete()
            return Response(
                {"detail": f"Failed to create student: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

