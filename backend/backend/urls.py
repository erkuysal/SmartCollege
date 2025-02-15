from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from backend.admin.admin import custom_admin_site

urlpatterns = [
    path('admin/', custom_admin_site.urls),

    # Module Urls
    path('api/users/', include('users.urls')),
    path('api/academics/', include('academics.urls')),
    path('api/college/', include('college.urls')),

    # UNDER CONSTRUCTION
    # path('api/security/', include('security.urls')),
    # path('api/transactions/', include('transactions.urls')),

    # Utilities
    path('api/utilities/', include('utilities.urls')),

    # drf-spectacular schema and UIs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

]
