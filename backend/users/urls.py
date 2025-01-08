from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet

router = DefaultRouter()
# If you want "students" in the URL:
router.register(r'', StudentViewSet, basename='student')

urlpatterns = [
    # Other project-level urls...
    path('', include(router.urls)),
]
