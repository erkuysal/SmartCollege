from rest_framework.routers import DefaultRouter
from .views import (
    CourseRegistrationViewSet,
    ClassScheduleViewSet,
    AcademicYearViewSet,
    SemesterViewSet,
    CourseOfferingViewSet,
)

router = DefaultRouter()
router.register(r'registrations', CourseRegistrationViewSet, basename='registration')
router.register(r'schedules', ClassScheduleViewSet, basename='schedule')
router.register(r'academic-years', AcademicYearViewSet, basename='academicyear')
router.register(r'semesters', SemesterViewSet, basename='semester')
router.register(r'offerings', CourseOfferingViewSet, basename='offering')

urlpatterns = router.urls 