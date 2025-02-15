from rest_framework import viewsets

from users.staff.models import Staff
from users.staff.serializers import StaffSerializer


class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer

