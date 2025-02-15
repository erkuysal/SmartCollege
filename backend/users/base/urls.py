from django.urls import path, include
from rest_framework.routers import DefaultRouter

from users.base.views import UserViewSet

router = DefaultRouter()
router.register(r'', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]