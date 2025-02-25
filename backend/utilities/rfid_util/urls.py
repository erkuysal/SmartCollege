from django.urls import path, include
from rest_framework.routers import DefaultRouter

from utilities.rfid_util.views import RFIDTagViewSet, RFIDReaderView, WriteRFIDView

router = DefaultRouter()
router.register(r'', RFIDTagViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('read/', RFIDReaderView.as_view(), name='rfid-read'),
    path('write/', WriteRFIDView.as_view(), name='rfid-write'),
]

