from typing import List, Dict, Any
from django.db import transaction, models
from django.core.exceptions import ValidationError
from django.apps import apps
from .models import Schedule, TimeSlot, ScheduleConstraint
from django.db.models import Sum, Count, Q
from ortools.sat.python import cp_model
from academics.enrollment.models import AcademicTerm

class ScheduleService:
    @staticmethod
    def get_available_slots(section: object) -> List[TimeSlot]:
        """Find available time slots for a course section"""
        Enrollment = apps.get_model('enrollment', 'Enrollment')
        LecturerCourse = apps.get_model('bindings', 'LecturerCourse')

        # Get all users involved in the section
        enrolled_students = Enrollment.objects.filter(
            section=section,
            status='registered'
        ).values_list('student', flat=True)

        assigned_lecturers = LecturerCourse.objects.filter(
            section=section
        ).values_list('lecturer', flat=True) 

        # Get all time slots where these users are already scheduled
        busy_slots = Schedule.objects.filter(
            models.Q(section__enrollments__student__in=enrolled_students) |
            models.Q(section__lecturer_assignments__lecturer__in=assigned_lecturers),
            is_active=True
        ).values_list('time_slot', flat=True)

        # Return available time slots
        return TimeSlot.objects.exclude(id__in=busy_slots)

    @staticmethod
    def assign_classroom(section: object) -> Schedule:
        """Automatically assign a classroom and time slot to a course section"""
        Classroom = apps.get_model('classrooms', 'Classroom')
        
        # Get available time slots
        available_slots = ScheduleService.get_available_slots(section)
        
        if not available_slots.exists():
            raise ValidationError("No available time slots for this section")
        
        # For each available slot, try to find a suitable classroom
        for slot in available_slots:
            # Find classrooms that are not already booked at this time slot and have enough capacity
            available_classrooms = Classroom.objects.exclude(
                schedules__time_slot=slot,
                schedules__is_active=True
            ).filter(is_active=True, capacity__gte=section.capacity)

            for classroom in available_classrooms:
                try:
                    with transaction.atomic():
                        schedule = Schedule.objects.create(
                            classroom=classroom,
                            section=section,
                            time_slot=slot
                        )
                        return schedule
                except ValidationError:
                    continue

        raise ValidationError("No available slots or classrooms found for this section")

    def get_student_schedule(self, student_id, term_id):
        """Get the schedule for a specific student in a specific term."""
        Enrollment = apps.get_model('enrollment', 'Enrollment')
        
        # Get the academic term
        academic_term = AcademicTerm.objects.get(id=term_id)
        
        # Get all enrollments for this student in the term
        enrollments = Enrollment.objects.filter(
            student_id=student_id,
            section__academic_term=academic_term,
            status='registered'
        ).select_related('section', 'section__course')
        
        # Get all section IDs this student is enrolled in
        section_ids = [e.section.id for e in enrollments]
        
        # Get schedules for these sections
        schedules = Schedule.objects.filter(
            section_id__in=section_ids,
            is_active=True
        ).select_related(
            'section', 'section__course', 'classroom', 'time_slot'
        )
        
        # Build the schedule
        result = []
        for schedule in schedules:
            result.append({
                'course': schedule.section.course.name,
                'course_code': schedule.section.course.code,
                'section': schedule.section.section_number,
                'room': schedule.classroom.name,
                'building': schedule.classroom.building if hasattr(schedule.classroom, 'building') else None,
                'day': schedule.time_slot.get_day_of_week_display(),
                'start_time': schedule.time_slot.start_time,
                'end_time': schedule.time_slot.end_time
            })
            
        return result

class TimetablingService:
    """
    Service for solving the course timetabling problem using OR-Tools CP-SAT solver.
    Provides conflict-free room and time slot assignments for course sections.
    """
    
    @staticmethod
    def solve_timetabling(academic_term_id: int) -> bool:
        """
        Solve the timetabling problem using CP-SAT solver
        
        Args:
            academic_term_id: The ID of the academic term to generate a timetable for
            
        Returns:
            bool: True if a solution was found, False otherwise
        """
        AcademicTerm = apps.get_model('enrollment', 'AcademicTerm')
        CourseSection = apps.get_model('courses', 'CourseSection')
        Classroom = apps.get_model('classrooms', 'Classroom')
        Enrollment = apps.get_model('enrollment', 'Enrollment')
        
        # Get the academic term
        academic_term = AcademicTerm.objects.get(id=academic_term_id)
        
        # Create the constraint satisfaction model
        model = cp_model.CpModel()
        
        # Gather all sections, rooms, and timeslots
        sections = CourseSection.objects.filter(academic_term=academic_term, is_active=True)
        rooms = Classroom.objects.filter(is_active=True)
        slots = TimeSlot.objects.all()
        
        # Create decision variables: x[s,r,t] = 1 if section s is in room r at timeslot t
        x = {}
        for s in sections:
            for r in rooms:
                # Skip rooms that are too small for this section
                if r.capacity < s.capacity:
                    continue
                    
                for t in slots:
                    x[s.id, r.id, t.id] = model.NewBoolVar(f"x_{s.id}_{r.id}_{t.id}")
        
        # Constraint 1: Each section must be assigned exactly one room and one timeslot
        for s in sections:
            valid_vars = []
            for r in rooms:
                if r.capacity < s.capacity:
                    continue
                for t in slots:
                    if (s.id, r.id, t.id) in x:
                        valid_vars.append(x[s.id, r.id, t.id])
            
            if valid_vars:  # Only add constraint if there are valid room-slot combinations
                model.Add(sum(valid_vars) == 1)
            
        # Constraint 2: No room can be used by more than one section at the same time
        for r in rooms:
            for t in slots:
                room_slot_vars = []
                for s in sections:
                    if (s.id, r.id, t.id) in x:
                        room_slot_vars.append(x[s.id, r.id, t.id])
                
                if room_slot_vars:  # Only add constraint if there are sections that can use this room-slot
                    model.Add(sum(room_slot_vars) <= 1)
        
        # Constraint 3: Students cannot be enrolled in multiple sections at the same time
        # Get all enrollments for this term
        student_enrollments = {}
        for enrollment in Enrollment.objects.filter(
            section__academic_term=academic_term,
            status='registered'
        ):
            student_id = enrollment.student.id
            section_id = enrollment.section.id
            
            if student_id not in student_enrollments:
                student_enrollments[student_id] = []
            
            # Track sections this student is enrolled in
            student_enrollments[student_id].append(section_id)
        
        # For each student, ensure no two sections they're enrolled in overlap
        for student_id, enrolled_section_ids in student_enrollments.items():
            for i in range(len(enrolled_section_ids)):
                for j in range(i+1, len(enrolled_section_ids)):
                    s1_id, s2_id = enrolled_section_ids[i], enrolled_section_ids[j]
                    
                    # For each timeslot, ensure the student is not double-booked
                    for t in slots:
                        # Collect all variables for these sections at this timeslot
                        s1_vars = [x[s1_id, r.id, t.id] for r in rooms if (s1_id, r.id, t.id) in x]
                        s2_vars = [x[s2_id, r.id, t.id] for r in rooms if (s2_id, r.id, t.id) in x]
                        
                        # If both sections can be scheduled at this timeslot, ensure they don't overlap
                        if s1_vars and s2_vars:
                            for v1 in s1_vars:
                                for v2 in s2_vars:
                                    model.Add(v1 + v2 <= 1)  # Can't have both = 1
        
        # Constraint 4: Lecturers cannot be assigned to multiple sections at the same time
        LecturerCourse = apps.get_model('bindings', 'LecturerCourse')
        lecturer_sections = {}
        
        for assignment in LecturerCourse.objects.filter(
            section__academic_term=academic_term
        ):
            lecturer_id = assignment.lecturer.id
            section_id = assignment.section.id
            
            if lecturer_id not in lecturer_sections:
                lecturer_sections[lecturer_id] = []
                
            lecturer_sections[lecturer_id].append(section_id)
            
        # For each lecturer, ensure no overlapping sections
        for lecturer_id, section_ids in lecturer_sections.items():
            for i in range(len(section_ids)):
                for j in range(i+1, len(section_ids)):
                    s1_id, s2_id = section_ids[i], section_ids[j]
                    
                    # For each timeslot, ensure the lecturer is not double-booked
                    for t in slots:
                        s1_vars = [x[s1_id, r.id, t.id] for r in rooms if (s1_id, r.id, t.id) in x]
                        s2_vars = [x[s2_id, r.id, t.id] for r in rooms if (s2_id, r.id, t.id) in x]
                        
                        if s1_vars and s2_vars:
                            for v1 in s1_vars:
                                for v2 in s2_vars:
                                    model.Add(v1 + v2 <= 1)
        
        # Solve the model
        solver = cp_model.CpSolver()
        status = solver.Solve(model)
        
        # If optimal solution found, save the assignments
        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            with transaction.atomic():
                # Delete existing schedules for this term
                Schedule.objects.filter(
                    section__academic_term=academic_term
                ).delete()
                
                # Create new schedules based on solution
                for (sid, rid, tid), var in x.items():
                    if solver.Value(var):
                        Schedule.objects.create(
                            section_id=sid,
                            classroom_id=rid,
                            time_slot_id=tid,
                            is_active=True
                        )
            return True
        
        return False
    
    @staticmethod
    def get_student_schedule(student_id: int, academic_term_id: int) -> List[Dict[str, Any]]:
        """
        Get the schedule for a specific student
        
        Args:
            student_id: The ID of the student
            academic_term_id: The ID of the academic term
            
        Returns:
            List of dictionaries containing schedule details
        """
        Enrollment = apps.get_model('enrollment', 'Enrollment')
        
        # Get the academic term
        academic_term = AcademicTerm.objects.get(id=academic_term_id)
        
        # Get all enrollments for this student in the term
        enrollments = Enrollment.objects.filter(
            student_id=student_id,
            section__academic_term=academic_term,
            status='registered'
        ).select_related('section', 'section__course')
        
        # Get all section IDs this student is enrolled in
        section_ids = [e.section.id for e in enrollments]
        
        # Get schedules for these sections
        schedules = Schedule.objects.filter(
            section_id__in=section_ids,
            is_active=True
        ).select_related(
            'section', 'section__course', 'classroom', 'time_slot'
        )
        
        # Build the schedule
        result = []
        for schedule in schedules:
            result.append({
                'course': schedule.section.course.name,
                'course_code': schedule.section.course.code,
                'section': schedule.section.section_number,
                'room': schedule.classroom.name,
                'building': schedule.classroom.building if hasattr(schedule.classroom, 'building') else None,
                'day': schedule.time_slot.get_day_of_week_display(),
                'start_time': schedule.time_slot.start_time,
                'end_time': schedule.time_slot.end_time
            })
            
        return result

    def _get_lecturer_constraints(self, lecturer_id, term_id):
        """Get constraints for a specific lecturer in a specific term."""
        LecturerCourse = apps.get_model('bindings', 'LecturerCourse')
        
        # Get all sections assigned to this lecturer in the term
        lecturer_courses = LecturerCourse.objects.filter(
            lecturer_id=lecturer_id,
            section__academic_term_id=term_id
        ).select_related('section')
        
        # Get all existing constraints for this lecturer
        constraints = ScheduleConstraint.objects.filter(
            constraint_type='LECTURER',
            reference_id=lecturer_id
        )
        
        return lecturer_courses, constraints 