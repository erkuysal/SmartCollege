from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import time, timedelta, datetime
from django.contrib.auth import get_user_model

from .models import TimeSlot, Schedule
from .services import ScheduleService, TimetablingService

from academics.enrollment.models import AcademicTerm, Enrollment
from college.courses.models import Course, CourseSection
from college.departments.models import Department
from college.faculties.models import Faculty
from college.classrooms.models import Classroom
from users.students.models import Student
from users.lecturers.models import Lecturer
from academics.bindings.models import LecturerCourse

from django.db import IntegrityError
from users.base.models import User


class TimeSlotTestCase(TestCase):
    """Tests for the TimeSlot model"""
    
    def setUp(self):
        self.time_slot = TimeSlot.objects.create(
            day_of_week=0,  # Monday
            start_time=time(8, 0),  # 8:00 AM
            end_time=time(9, 0)  # 9:00 AM
        )
    
    def test_time_slot_creation(self):
        """Test that a time slot can be created"""
        self.assertEqual(self.time_slot.day_of_week, 0)
        self.assertEqual(self.time_slot.start_time, time(8, 0))
        self.assertEqual(self.time_slot.end_time, time(9, 0))
    
    def test_time_slot_str(self):
        """Test the string representation of a time slot"""
        self.assertEqual(str(self.time_slot), "Monday 08:00:00-09:00:00")
    
    def test_invalid_time_slot(self):
        """Test that a time slot with end time before start time raises an error"""
        with self.assertRaises(ValidationError):
            TimeSlot.objects.create(
                day_of_week=0,
                start_time=time(9, 0),
                end_time=time(8, 0)
            )
    
    def test_duplicate_time_slot(self):
        """Test that creating a duplicate time slot raises an error"""
        with self.assertRaises(ValidationError):
            TimeSlot.objects.create(
                day_of_week=0,
                start_time=time(8, 0),
                end_time=time(9, 0)
            )


class ScheduleTestCase(TestCase):
    """Tests for the Schedule model"""
    
    def setUp(self):
        # Create faculty
        self.faculty = Faculty.objects.create(name="Engineering", code="ENG", dean="Dr. Smith")
        
        # Create department
        self.department = Department.objects.create(
            name="Computer Science", 
            faculty=self.faculty,
            head_of_department="Dr. Johnson"
        )
        
        # Create course
        self.course = Course.objects.create(
            code="CS101",
            name="Intro to Programming",
            department=self.department,
            credits=3
        )
        
        # Create academic term
        self.academic_term = AcademicTerm.objects.create(
            term="Fall",
            academic_year="2023-2024",
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timedelta(days=90),
            registration_start=timezone.now().date() - timedelta(days=30),
            registration_end=timezone.now().date() - timedelta(days=1),
            is_active=True
        )
        
        # Create course section
        self.section = CourseSection.objects.create(
            course=self.course,
            section_number="A",
            academic_term=self.academic_term,
            capacity=30
        )
        
        # Create classroom
        self.classroom = Classroom.objects.create(
            name="Room 101",
            capacity=40,
            building="Main Building",
            department=self.department
        )
        
        # Create time slot
        self.time_slot = TimeSlot.objects.create(
            day_of_week=0,  # Monday
            start_time=time(8, 0),  # 8:00 AM
            end_time=time(9, 0)  # 9:00 AM
        )
        
        # Create schedule
        self.schedule = Schedule.objects.create(
            classroom=self.classroom,
            section=self.section,
            time_slot=self.time_slot
        )
    
    def test_schedule_creation(self):
        """Test that a schedule can be created"""
        self.assertEqual(self.schedule.classroom, self.classroom)
        self.assertEqual(self.schedule.section, self.section)
        self.assertEqual(self.schedule.time_slot, self.time_slot)
        self.assertTrue(self.schedule.is_active)
    
    def test_schedule_str(self):
        """Test the string representation of a schedule"""
        expected = f"{self.section} - {self.classroom} - {self.time_slot}"
        self.assertEqual(str(self.schedule), expected)
    
    def test_duplicate_schedule(self):
        """Test that creating a duplicate schedule raises an error"""
        with self.assertRaises(ValidationError):
            Schedule.objects.create(
                classroom=self.classroom,
                section=self.section,
                time_slot=self.time_slot
            )
    
    def test_classroom_availability(self):
        """Test that a classroom cannot be double-booked"""
        # Create another section
        section2 = CourseSection.objects.create(
            course=self.course,
            section_number="B",
            academic_term=self.academic_term,
            capacity=30
        )
        
        # Try to create another schedule for the same classroom and time slot
        with self.assertRaises(ValidationError):
            Schedule.objects.create(
                classroom=self.classroom,
                section=section2,
                time_slot=self.time_slot
            )


class TimetablingServiceTestCase(TestCase):
    """Tests for the TimetablingService"""
    
    @classmethod
    def setUpClass(cls):
        """Set up class-level fixtures and check for OR-Tools"""
        super().setUpClass()
        try:
            from ortools.sat.python import cp_model
            cls.skip_ortools_tests = False
        except ImportError:
            cls.skip_ortools_tests = True
            print("WARNING: OR-Tools not found. Skipping optimization tests.")
    
    def setUp(self):
        # Create faculty
        self.faculty = Faculty.objects.create(name="Engineering", code="ENG", dean="Dr. Smith")
        
        # Create department
        self.department = Department.objects.create(
            name="Computer Science", 
            faculty=self.faculty,
            head_of_department="Dr. Johnson"
        )
        
        # Create courses
        self.course1 = Course.objects.create(
            code="CS101",
            name="Intro to Programming",
            department=self.department,
            credits=3
        )
        
        self.course2 = Course.objects.create(
            code="CS102",
            name="Data Structures",
            department=self.department,
            credits=3
        )
        
        # Create academic term
        self.academic_term = AcademicTerm.objects.create(
            term="Fall",
            academic_year="2023-2024",
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timedelta(days=90),
            registration_start=timezone.now().date() - timedelta(days=30),
            registration_end=timezone.now().date() - timedelta(days=1),
            is_active=True
        )
        
        # Create course sections
        self.section1 = CourseSection.objects.create(
            course=self.course1,
            section_number="A",
            academic_term=self.academic_term,
            capacity=30
        )
        
        self.section2 = CourseSection.objects.create(
            course=self.course2,
            section_number="A",
            academic_term=self.academic_term,
            capacity=25
        )
        
        # Create classrooms
        self.classroom1 = Classroom.objects.create(
            name="Room 101",
            capacity=40,
            building="Main Building",
            department=self.department
        )
        
        self.classroom2 = Classroom.objects.create(
            name="Room 102",
            capacity=30,
            building="Main Building",
            department=self.department
        )
        
        # Create time slots
        self.time_slot1 = TimeSlot.objects.create(
            day_of_week=0,  # Monday
            start_time=time(8, 0),  # 8:00 AM
            end_time=time(9, 0)  # 9:00 AM
        )
        
        self.time_slot2 = TimeSlot.objects.create(
            day_of_week=0,  # Monday
            start_time=time(9, 0),  # 9:00 AM
            end_time=time(10, 0)  # 10:00 AM
        )
        
        self.time_slot3 = TimeSlot.objects.create(
            day_of_week=1,  # Tuesday
            start_time=time(8, 0),  # 8:00 AM
            end_time=time(9, 0)  # 9:00 AM
        )
        
        # Create lecturer
        self.user_lecturer = User.objects.create(
            username="lecturer1",
            email="lecturer1@example.com",
            first_name="John",
            last_name="Doe"
        )
        
        self.lecturer = Lecturer.objects.create(
            user=self.user_lecturer,
            department=self.department,
            qualification="PhD",
            max_courses=3
        )
        
        # Assign lecturer to courses
        LecturerCourse.objects.create(
            lecturer=self.lecturer,
            section=self.section1,
            is_primary=True
        )
        
        LecturerCourse.objects.create(
            lecturer=self.lecturer,
            section=self.section2,
            is_primary=True
        )
        
        # Create students
        self.user_student1 = User.objects.create(
            username="student1",
            email="student1@example.com",
            first_name="Alice",
            last_name="Smith"
        )
        
        self.student1 = Student.objects.create(
            user=self.user_student1,
            student_number="S001"
        )
        
        self.user_student2 = User.objects.create(
            username="student2",
            email="student2@example.com",
            first_name="Bob",
            last_name="Johnson"
        )
        
        self.student2 = Student.objects.create(
            user=self.user_student2,
            student_number="S002"
        )
        
        # Enroll students in courses
        Enrollment.objects.create(
            student=self.student1,
            section=self.section1,
            status="registered",
            date_enrolled=timezone.now() - timedelta(days=1)
        )
        
        Enrollment.objects.create(
            student=self.student1,
            section=self.section2,
            status="registered",
            date_enrolled=timezone.now() - timedelta(days=1)
        )
        
        Enrollment.objects.create(
            student=self.student2,
            section=self.section1,
            status="registered",
            date_enrolled=timezone.now() - timedelta(days=1)
        )
    
    def test_solve_timetabling(self):
        """Test that TimetablingService can generate a valid timetable"""
        # Skip this test if OR-Tools is not available
        if getattr(self.__class__, 'skip_ortools_tests', False):
            self.skipTest("OR-Tools not available")
            
        # Initial check - no schedules should exist
        self.assertEqual(Schedule.objects.count(), 0)
        
        # Run timetabling algorithm
        result = TimetablingService.solve_timetabling(self.academic_term.id)
        
        # Check result
        self.assertTrue(result)
        
        # Verify that schedules were created
        self.assertEqual(Schedule.objects.count(), 2)
        
        # Verify that each section got a schedule
        self.assertTrue(Schedule.objects.filter(section=self.section1).exists())
        self.assertTrue(Schedule.objects.filter(section=self.section2).exists())
        
        # Verify that no conflicts exist
        # 1. No classroom double-booking
        for time_slot in TimeSlot.objects.all():
            for classroom in Classroom.objects.all():
                self.assertLessEqual(
                    Schedule.objects.filter(
                        time_slot=time_slot,
                        classroom=classroom,
                        is_active=True
                    ).count(),
                    1
                )
        
        # 2. No lecturer conflicts
        for time_slot in TimeSlot.objects.all():
            schedules = Schedule.objects.filter(
                time_slot=time_slot,
                is_active=True,
                section__lecturer_assignments__lecturer=self.lecturer
            )
            self.assertLessEqual(schedules.count(), 1)
        
        # 3. No student conflicts
        for time_slot in TimeSlot.objects.all():
            for student in [self.student1, self.student2]:
                enrolled_sections = Enrollment.objects.filter(
                    student=student,
                    status="registered"
                ).values_list('section_id', flat=True)
                
                schedules = Schedule.objects.filter(
                    time_slot=time_slot,
                    is_active=True,
                    section__id__in=enrolled_sections
                )
                
                self.assertLessEqual(schedules.count(), 1)
    
    def test_get_available_slots(self):
        """Test the get_available_slots method"""
        # Create a schedule
        Schedule.objects.create(
            section=self.section1,
            classroom=self.classroom1,
            time_slot=self.time_slot1
        )
        
        # The lecturer is assigned to section1, so time_slot1 should not be available for section2
        available_slots = ScheduleService.get_available_slots(self.section2)
        self.assertNotIn(self.time_slot1, available_slots)
        self.assertIn(self.time_slot2, available_slots)
        self.assertIn(self.time_slot3, available_slots)
    
    def test_get_student_schedule(self):
        """Test the get_student_schedule method"""
        # Create schedules
        Schedule.objects.create(
            section=self.section1,
            classroom=self.classroom1,
            time_slot=self.time_slot1
        )
        
        Schedule.objects.create(
            section=self.section2,
            classroom=self.classroom2,
            time_slot=self.time_slot2
        )
        
        # Get student1's schedule
        schedule = TimetablingService.get_student_schedule(self.student1.id, self.academic_term.id)
        
        # Verify it contains both courses
        self.assertEqual(len(schedule), 2)
        
        # Verify schedule details
        course_codes = [item['course_code'] for item in schedule]
        self.assertIn(self.course1.code, course_codes)
        self.assertIn(self.course2.code, course_codes)
        
        # Get student2's schedule
        schedule = TimetablingService.get_student_schedule(self.student2.id, self.academic_term.id)
        
        # Verify it contains only one course
        self.assertEqual(len(schedule), 1)
        
        # Verify schedule details
        self.assertEqual(schedule[0]['course_code'], self.course1.code)
