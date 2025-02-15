from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    AttendanceViewSet,
    start_attendance_session, mark_attendance,
    update_attendance_status
)

router = DefaultRouter()
router.register(r'', AttendanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('start-session/', start_attendance_session, name="start-attendance-session"),
    path('mark-attendance/', mark_attendance, name="mark-attendance"),
    path('update-status/<int:attendance_id>/', update_attendance_status, name="update-attendance-status"),
]

