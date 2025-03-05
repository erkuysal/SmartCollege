from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from django.conf import settings
import string
import random

from users.staff.models import Staff
from users.staff.serializers import StaffSerializer
from users.base.models import User


class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        
        # Extract user data from request
        user_data = {
            'first_name': data.get('first_name', ''),
            'last_name': data.get('last_name', '')
        }
        
        # Generate staff code (username) - S{000}
        last_staff = Staff.objects.all().order_by('-id').first()
        next_number = 1
        if last_staff:
            try:
                username = last_staff.user.username
                if username.startswith('S') and username[1:].isdigit():
                    next_number = int(username[1:]) + 1
            except (ValueError, IndexError):
                next_number = last_staff.id + 1
        
        # Format the staff code as S{000}
        staff_code = f"S{str(next_number).zfill(3)}"
        
        # Generate email
        domain = getattr(settings, 'STAFF_EMAIL_DOMAIN', 'staff.institution.edu')
        email = f"{user_data['first_name'].lower()}.{user_data['last_name'].lower()}@{domain}"
        
        # Generate a random password
        password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        
        # Create user - role will be assigned by signal when Staff is created
        user = User.objects.create_user(
            username=staff_code.lower(),
            email=email,
            password=password,
            first_name=user_data['first_name'],
            last_name=user_data['last_name']
        )
        
        # Create staff profile - this will trigger the signal to set the role
        try:
            staff = Staff.objects.create(
                user=user,
                position=data.get('position', 'General Staff'),
                office_location=data.get('office_location', '')
            )
            
            # Add the generated credentials to the response
            serializer = self.get_serializer(staff)
            response_data = serializer.data
            response_data['staff_code'] = staff_code
            response_data['email'] = email
            response_data['password'] = password
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # If staff creation fails, delete the user to avoid orphaned users
            user.delete()
            return Response(
                {"detail": f"Failed to create staff: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

