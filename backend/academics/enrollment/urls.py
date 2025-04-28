from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EnrollmentViewSet, RefreshSemesterEnrollmentView, AcademicTermViewSet

# Main router for Enrollment
enrollment_router = DefaultRouter()
enrollment_router.register(r'', EnrollmentViewSet)

# Terms router
terms_router = DefaultRouter()
terms_router.register(r'', AcademicTermViewSet)

urlpatterns = [
    path('', include(enrollment_router.urls)),
    path('terms/', include(terms_router.urls)),
    path('refresh-enrollment/', RefreshSemesterEnrollmentView.as_view(), name="refresh-enrollment"),
] 