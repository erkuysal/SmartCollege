from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RFIDTagViewSet,
    WriteCardAPIView,
    ReadCardAPIView,
    ContinuousRFIDScanView,
)

router = DefaultRouter()
router.register(r'tags', RFIDTagViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # RFID card operations
    path('write_card/', WriteCardAPIView.as_view(), name='write_card'),
    path('read_card/', ReadCardAPIView.as_view(), name='read_card'),
    path('continuous/', ContinuousRFIDScanView.as_view(), name='continuous_rfid_scan'),
] 