from django.urls import path, include
from rest_framework.routers import DefaultRouter


from .views import AttendanceViewSet, StartAttendanceSessionView, MarkAttendanceView, UpdateAttendanceStatusView
# from .views import (
#     AttendanceViewSet,
#     start_attendance_session, mark_attendance,
#     update_attendance_status
# )

router = DefaultRouter()
router.register(r'', AttendanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('start-session/', StartAttendanceSessionView.as_view(), name="start-attendance-session"),
    path('mark-attendance/', MarkAttendanceView.as_view(), name="mark-attendance"),
    path('update-status/<int:attendance_id>/', UpdateAttendanceStatusView.as_view(), name="update-attendance-status"),
]

