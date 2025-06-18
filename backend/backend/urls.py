# smart_attendance/urls.py

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

# API URLs
api_urlpatterns = [
    path('', include('attendance.urls')),
    path('users/', include('users.urls')),
    path('rfid/', include('rfid.urls')),
    path('academic/', include('academic.urls')),
    path('wallet/', include('wallet.urls')),
    # API Schema URLs
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(api_urlpatterns)),
]