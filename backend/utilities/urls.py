from django.urls import path, include

urlpatterns = [
    path('', include('utilities.rfid_util.urls')),
    # ---- MODULES ARE INCOMPLETE ----
    #path('', include('utilities.reports.urls')),
    #path('', include('utilities.notifications.urls')),
]