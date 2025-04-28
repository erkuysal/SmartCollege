from django.urls import path, include
from rest_framework.routers import DefaultRouter

from utilities.rfid_util.views import (
    RFIDCardViewSet, 
    RFIDReaderView, 
    WriteRFIDView,
    AssignRFIDView,
    StaffListView
)

router = DefaultRouter()
router.register(r'cards', RFIDCardViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('read/', RFIDReaderView.as_view(), name='rfid-read'),
    path('write/', WriteRFIDView.as_view(), name='rfid-write'),
    path('assign/', AssignRFIDView.as_view(), name='rfid-assign'),
    path('staff/', StaffListView.as_view(), name='rfid-staff-list'),
]

