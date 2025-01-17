from django.contrib import admin

# Register your models here.
from .models import Classroom, Courses, Schedule, Attendance

admin.site.register(Classroom)
admin.site.register(Courses)
admin.site.register(Schedule)
admin.site.register(Attendance)

