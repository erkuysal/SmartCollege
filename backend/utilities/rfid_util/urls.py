from django.urls import path, include
from rest_framework.routers import DefaultRouter

from utilities.rfid_util.views import RFIDTagViewSet, IdentifyUserView, WriteToRFIDView

router = DefaultRouter()
router.register(r'', RFIDTagViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('identify/', IdentifyUserView.as_view(), name="identify-user"),
    path('write/', WriteToRFIDView.as_view(), name="write-rfid"),
]

