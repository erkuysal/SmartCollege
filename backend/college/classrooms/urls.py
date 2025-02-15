from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClassroomViewSet

router = DefaultRouter()
router.register(r'', ClassroomViewSet)

urlpatterns = [
    path('', include(router.urls)),
]