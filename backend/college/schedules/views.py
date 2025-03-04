from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Schedule, TimeSlot
from .serializers import ScheduleSerializer, TimeSlotSerializer
from .services import ScheduleService


class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

    @action(detail=False, methods=['post'])
    def auto_assign(self, request):
        """Automatically assign classroom and time slot to a course"""
        course_id = request.data.get('course_id')
        semester = request.data.get('semester')
        academic_year = request.data.get('academic_year')

        try:
            course = Course.objects.get(id=course_id)
            schedule = ScheduleService.assign_classroom(course, semester, academic_year)
            return Response(
                ScheduleSerializer(schedule).data,
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """Get available time slots for a course"""
        course_id = request.query_params.get('course_id')
        semester = request.query_params.get('semester')
        academic_year = request.query_params.get('academic_year')

        try:
            course = Course.objects.get(id=course_id)
            slots = ScheduleService.get_available_slots(course, semester, academic_year)
            return Response(TimeSlotSerializer(slots, many=True).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )