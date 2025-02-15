from django.urls import path, include

urlpatterns = [
    path('attendance/', include('academics.attendance.urls')),
    path('enrollment/', include('academics.enrollment.urls')),
    path('bindings/', include('academics.bindings.urls')),
]