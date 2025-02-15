from django.urls import path, include
from rest_framework.routers import DefaultRouter

from utilities.rfid_util.views import RFIDTagViewSet, identify_user, write_to_rfid

router = DefaultRouter()
router.register(r'', RFIDTagViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('identify/', identify_user, name="identify-user"),
    path('write/', write_to_rfid, name="write-rfid"),
]

