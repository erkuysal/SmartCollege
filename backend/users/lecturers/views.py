from rest_framework import viewsets, status
from rest_framework.response import Response
from django.conf import settings
from django.db.models import Max
import string
import random

from users.lecturers.models import Lecturer
from users.lecturers.serializers import LecturerSerializer
from users.base.models import User


class LecturerViewSet(viewsets.ModelViewSet):
    queryset = Lecturer.objects.all()
    serializer_class = LecturerSerializer

    def create(self, request, *args, **kwargs):
        # Extract user data from request
        user_data = {
            'first_name': request.data.get('first_name', ''),
            'last_name': request.data.get('last_name', '')
        }
        
        # Generate lecturer code (username)
        # Find the highest lecturer number
        last_lecturer = Lecturer.objects.all().order_by('-id').first()
        next_number = 1
        if last_lecturer:
            # Try to extract the number from the username if it follows the pattern L{000}
            try:
                username = last_lecturer.user.username
                if username.startswith('L'):
                    next_number = int(username[1:]) + 1
            except (ValueError, IndexError):
                # If we can't parse the username, just use the ID + 1
                next_number = last_lecturer.id + 1
        
        # Format the lecturer code as L{000}
        lecturer_code = f"L{str(next_number).zfill(3)}"
        
        # Generate email
        domain = getattr(settings, 'LECTURER_EMAIL_DOMAIN', 'lect.institution.edu')
        email = f"{user_data['first_name'].lower()}.{user_data['last_name'].lower()}@{domain}"
        
        # Generate a random password
        password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        
        # Set username to lecturer code
        user_data['username'] = lecturer_code.lower()  # Store username in lowercase
        user_data['email'] = email
        user_data['password'] = password
        
        # Create user - role will be assigned by signal when Lecturer is created
        user = User.objects.create_user(
            username=user_data['username'],
            email=user_data['email'],
            password=user_data['password'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name']
        )
        
        # Create lecturer profile - this will trigger the signal to set the role
        lecturer_data = {
            'user': user.id,
            'department': request.data.get('department')
        }
        
        serializer = self.get_serializer(data=lecturer_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Add the generated lecturer code and credentials to the response
        response_data = serializer.data
        response_data['lecturer_code'] = lecturer_code
        response_data['email'] = user_data['email']
        response_data['password'] = user_data['password']  # Include the generated password in the response
        
        headers = self.get_success_headers(serializer.data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)


    

