from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.apps import apps
from .models import Schedule, TimeSlot
from .serializers import ScheduleSerializer, TimeSlotSerializer
from .services import ScheduleService, TimetablingService
from django.core.exceptions import ValidationError
from academics.enrollment.models import AcademicTerm


class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer


class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all().select_related('section', 'classroom', 'time_slot')
    serializer_class = ScheduleSerializer
    
    def get_queryset(self):
        """
        Filter schedules by academic term, course, student or lecturer
        """
        queryset = super().get_queryset()
        
        # Get query parameters
        academic_term = self.request.query_params.get('academic_term')
        course = self.request.query_params.get('course')
        student = self.request.query_params.get('student')
        lecturer = self.request.query_params.get('lecturer')
        classroom = self.request.query_params.get('classroom')
        active_only = self.request.query_params.get('active_only', 'true').lower() == 'true'
        
        # Apply filters based on parameters
        if active_only:
            queryset = queryset.filter(is_active=True)
            
        if academic_term:
            queryset = queryset.filter(section__academic_term_id=academic_term)
            
        if course:
            queryset = queryset.filter(section__course_id=course)
            
        if student:
            Enrollment = apps.get_model('enrollment', 'Enrollment')
            # Get all sections this student is enrolled in
            enrolled_sections = Enrollment.objects.filter(
                student_id=student, status='registered'
            ).values_list('section_id', flat=True)
            
            queryset = queryset.filter(section_id__in=enrolled_sections)
            
        if lecturer:
            LecturerCourse = apps.get_model('bindings', 'LecturerCourse')
            # Get all sections this lecturer is assigned to
            assigned_sections = LecturerCourse.objects.filter(
                lecturer_id=lecturer
            ).values_list('section_id', flat=True)
            
            queryset = queryset.filter(section_id__in=assigned_sections)
            
        if classroom:
            queryset = queryset.filter(classroom_id=classroom)
            
        return queryset
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Generate a timetable for a specific academic term
        """
        academic_term_id = request.data.get('academic_term')
        
        if not academic_term_id:
            return Response(
                {"error": "Academic term ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            academic_term = AcademicTerm.objects.get(id=academic_term_id)
        except AcademicTerm.DoesNotExist:
            return Response(
                {"error": "Academic term not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Generate timetable using the service
        success = TimetablingService.solve_timetabling(academic_term_id)
        
        if success:
            return Response({"status": "Timetable generated successfully"})
        else:
            return Response(
                {"error": "Could not find a valid timetable solution"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def student_schedule(self, request):
        """
        Get the schedule for a specific student in a specific academic term
        """
        student_id = request.query_params.get('student_id')
        academic_term_id = request.query_params.get('academic_term_id')
        
        if not student_id or not academic_term_id:
            return Response(
                {"error": "Both student_id and academic_term_id are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Check if student exists
            Student = apps.get_model('users.students', 'Student')
            Student.objects.get(id=student_id)
            
            # Check if academic term exists
            academic_term = AcademicTerm.objects.get(id=academic_term_id)
        except (Student.DoesNotExist, AcademicTerm.DoesNotExist):
            return Response(
                {"error": "Student or academic term not found"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Get the student's schedule
        schedule = TimetablingService.get_student_schedule(student_id, academic_term_id)
        
        return Response(schedule)

    @action(detail=False, methods=['post'])
    def auto_assign(self, request):
        """Automatically assign classroom and time slot to a course section"""
        section_id = request.data.get('section_id')

        if not section_id:
            return Response(
                {'error': 'Course section ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            CourseSection = apps.get_model('courses', 'CourseSection')
            section = CourseSection.objects.get(id=section_id)
            schedule = ScheduleService.assign_classroom(section)
            return Response(
                ScheduleSerializer(schedule).data,
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'An unexpected error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """Get available time slots for a course section"""
        section_id = request.query_params.get('section_id')

        if not section_id:
            return Response(
                {'error': 'Course section ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            CourseSection = apps.get_model('courses', 'CourseSection')
            section = CourseSection.objects.get(id=section_id)
            slots = ScheduleService.get_available_slots(section)
            return Response(TimeSlotSerializer(slots, many=True).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    @action(detail=False, methods=['get'])
    def course_schedules(self, request):
        """
        Get all schedules for an academic term
        """
        academic_term_id = request.query_params.get('academic_term_id')
        
        if not academic_term_id:
            return Response(
                {'error': 'Academic term ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Verify academic term exists
            academic_term = AcademicTerm.objects.get(id=academic_term_id)
            
            # Get all schedules for this term
            schedules = Schedule.objects.filter(
                section__academic_term_id=academic_term_id,
                is_active=True
            ).select_related(
                'section', 'section__course', 'classroom', 'time_slot'
            )
            
            # Serialize the data
            data = []
            for schedule in schedules:
                data.append({
                    'id': schedule.id,
                    'section': {
                        'id': schedule.section.id,
                        'section_number': schedule.section.section_number,
                        'course': {
                            'id': schedule.section.course.id,
                            'code': schedule.section.course.code,
                            'name': schedule.section.course.name
                        }
                    },
                    'classroom': {
                        'id': schedule.classroom.id,
                        'name': schedule.classroom.name,
                        'building': schedule.classroom.building if hasattr(schedule.classroom, 'building') else None,
                        'capacity': schedule.classroom.capacity
                    },
                    'timeslot': {
                        'id': schedule.time_slot.id,
                        'day_of_week': schedule.time_slot.day_of_week,
                        'day_display': schedule.time_slot.get_day_of_week_display(),
                        'start_time': schedule.time_slot.start_time.strftime('%H:%M'),
                        'end_time': schedule.time_slot.end_time.strftime('%H:%M')
                    }
                })
            
            return Response(data)
        except AcademicTerm.DoesNotExist:
            return Response(
                {'error': 'Academic term not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )