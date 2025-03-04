from django.urls import path, include

urlpatterns = [
    # Include URLs from submodules
    path('audit_logs/', include('security.audit_logs.urls')),
    path('authentication/', include('security.authentication.urls')),
] 