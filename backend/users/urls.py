from django.urls import path, include

urlpatterns = [
    path('base/', include('users.base.urls')),
    path('staff/', include('users.staff.urls')),
    path('lecturers/', include('users.lecturers.urls')),
    path('students/', include('users.students.urls')),
]