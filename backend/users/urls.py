from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, LecturerViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'lecturers', LecturerViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 