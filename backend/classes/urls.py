from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClassroomViewSet, CourseViewSet, EnrollmentViewSet, ScheduleViewSet, AttendanceViewSet

router = DefaultRouter()

# Register all viewsets
router.register(r'classrooms', ClassroomViewSet, basename='classroom')  # This will handle /api/classes/
router.register(r'courses', CourseViewSet, basename='course')  # This will handle /api/classes/courses/
router.register(r'schedule', ScheduleViewSet, basename='schedule')  # This will handle /api/classes/schedules/
router.register(r'attendance', AttendanceViewSet, basename='attendance')  # This will handle /api/classes/attendances/
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')  # This will handle /api/classes/enrollments/

urlpatterns = [
    path('', include(router.urls)),
]