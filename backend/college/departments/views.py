from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination

from .models import Department
from .serializers import DepartmentSerializer


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    # Temporarily using AllowAny for testing
    permission_classes = [AllowAny]  # Change back to [IsAuthenticated] after testing
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = Department.objects.all()
        
        # Filter by active status if provided
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            is_active = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)
            
        # Filter by faculty if provided
        faculty_id = self.request.query_params.get('faculty_id', None)
        if faculty_id:
            queryset = queryset.filter(faculty_id=faculty_id)
            
        # Search by name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
            
        return queryset
