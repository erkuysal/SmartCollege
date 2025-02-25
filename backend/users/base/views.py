from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser

from users.base.models import User
from users.base.serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    User management with restricted permissions.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """
        Restrict access:
        - Read: All users can view profiles.
        - Write: Only Admins can modify users.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminUser]  # 🔒 Only admins can edit
        return super().get_permissions()

