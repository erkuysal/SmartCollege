from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EnrollmentViewSet, RefreshSemesterEnrollmentView

router = DefaultRouter()
router.register(r'', EnrollmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('refresh-enrollment/', RefreshSemesterEnrollmentView.as_view(), name="refresh-enrollment"),
]