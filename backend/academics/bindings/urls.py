from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import LecturerCourseViewSet

router = DefaultRouter()
router.register(r'', LecturerCourseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]