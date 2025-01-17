from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, TeacherViewSet

router = DefaultRouter()
# If you want "students" in the URL:
router.register(r'students', StudentViewSet, basename='student')
router.register(r'teachers', TeacherViewSet, basename='teacher')

urlpatterns = [
    # Other project-level urls...
    path('', include(router.urls)),
]
