from rest_framework import serializers

from users.staff.models import Staff


class StaffSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Staff
        fields = ['id', 'user', 'first_name', 'last_name', 'email', 'username', 
                 'position', 'office_location']
        read_only_fields = ['id', 'first_name', 'last_name', 'email', 'username']

