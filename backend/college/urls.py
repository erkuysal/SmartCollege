from django.urls import path, include

urlpatterns = [
    path('facilities/', include('college.facilities.urls')),
    path('departments/', include('college.departments.urls')),
    path('courses/', include('college.courses.urls')),
    path('classrooms/', include('college.classrooms.urls')),
    path('schedules/', include('college.schedules.urls')),
]