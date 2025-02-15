from django.urls import path, include
from rest_framework.routers import DefaultRouter

from users.students.views import StudentViewSet

router = DefaultRouter()
router.register(r'', StudentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]