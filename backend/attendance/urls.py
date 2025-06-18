# attendance/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    AttendanceSessionViewSet,
    AttendanceRecordViewSet,
    CourseViewSet,
    MarkAttendanceAPIView,
    StartSessionAPIView,
    EndSessionAPIView,
    ListSessionsAPIView,
    ClassroomViewSet,
    ScheduleViewSet,
)

router = DefaultRouter()
router.register(r'sessions', AttendanceSessionViewSet)
router.register(r'records', AttendanceRecordViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'classrooms', ClassroomViewSet)
router.register(r'schedules', ScheduleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('mark-attendance/', MarkAttendanceAPIView.as_view(), name='mark-attendance'),
    path('sessions/', ListSessionsAPIView.as_view(), name='session-list'),
    path('sessions/start/', StartSessionAPIView.as_view(), name='session-start'),
    path('sessions/<int:id>/end/', EndSessionAPIView.as_view(), name='session-end'),
]