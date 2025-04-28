from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from users.base.models import User
from datetime import timedelta

from .models import LecturerCourse
from college.courses.models import Course, CourseSection
from college.departments.models import Department
from college.faculties.models import Faculty
from academics.enrollment.models import AcademicTerm
from users.lecturers.models import Lecturer


class LecturerCourseTestCase(TestCase):
    """Tests for the LecturerCourse model"""
    
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
        self.term = AcademicTerm.objects.create(
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
            academic_term=self.term,
            capacity=30
        )
        
        # Create lecturer
        self.user = User.objects.create_user(
            username="lecturer1",
            email="lecturer1@example.com",
            first_name="John",
            last_name="Doe"
        )
        
        self.lecturer = Lecturer.objects.create(
            user=self.user,
            department=self.department,
            qualification="PhD",
            max_courses=3
        )
        
        # Create lecturer course assignment
        self.assignment = LecturerCourse.objects.create(
            lecturer=self.lecturer,
            section=self.section,
            is_primary=True,
            role="Instructor",
            hours_per_week=3
        )
    
    def test_assignment_creation(self):
        """Test that a lecturer course assignment can be created"""
        self.assertEqual(self.assignment.lecturer, self.lecturer)
        self.assertEqual(self.assignment.section, self.section)
        self.assertTrue(self.assignment.is_primary)
        self.assertEqual(self.assignment.role, "Instructor")
        self.assertEqual(self.assignment.hours_per_week, 3)
    
    def test_assignment_string_representation(self):
        """Test the string representation of a lecturer course assignment"""
        expected = f"{self.lecturer.user.username} teaches {self.section.course.name} {self.section.section_number} ({self.section.academic_term})"
        self.assertEqual(str(self.assignment), expected)
    
    def test_duplicate_primary_assignment(self):
        """Test that creating a duplicate primary assignment raises an error"""
        with self.assertRaises(ValidationError):
            duplicate = LecturerCourse(
                lecturer=self.lecturer,
                section=self.section,
                is_primary=True
            )
            duplicate.full_clean()
    
    def test_secondary_assignment(self):
        """Test that a secondary assignment can be created for the same section"""
        # Create another lecturer
        user2 = User.objects.create_user(
            username="lecturer2",
            email="lecturer2@example.com",
            first_name="Jane",
            last_name="Smith"
        )
        
        lecturer2 = Lecturer.objects.create(
            user=user2,
            department=self.department,
            qualification="PhD",
            max_courses=3
        )
        
        # Assign second lecturer as non-primary
        assignment2 = LecturerCourse.objects.create(
            lecturer=lecturer2,
            section=self.section,
            is_primary=False,
            role="Teaching Assistant"
        )
        
        self.assertEqual(assignment2.lecturer, lecturer2)
        self.assertEqual(assignment2.section, self.section)
        self.assertFalse(assignment2.is_primary)
        self.assertEqual(assignment2.role, "Teaching Assistant")
    
    def test_workload_limit(self):
        """Test that a lecturer cannot be assigned more courses than their max_courses"""
        # Create two more courses and sections
        course2 = Course.objects.create(
            code="CS102",
            name="Data Structures",
            department=self.department,
            credits=3
        )
        
        section2 = CourseSection.objects.create(
            course=course2,
            section_number="A",
            academic_term=self.term,
            capacity=30
        )
        
        course3 = Course.objects.create(
            code="CS103",
            name="Algorithms",
            department=self.department,
            credits=3
        )
        
        section3 = CourseSection.objects.create(
            course=course3,
            section_number="A",
            academic_term=self.term,
            capacity=30
        )
        
        course4 = Course.objects.create(
            code="CS104",
            name="Computer Architecture",
            department=self.department,
            credits=3
        )
        
        section4 = CourseSection.objects.create(
            course=course4,
            section_number="A",
            academic_term=self.term,
            capacity=30
        )
        
        # Assign lecturer to two more courses (should work as max is 3)
        LecturerCourse.objects.create(
            lecturer=self.lecturer,
            section=section2,
            is_primary=True
        )
        
        LecturerCourse.objects.create(
            lecturer=self.lecturer,
            section=section3,
            is_primary=True
        )
        
        # Trying to assign a fourth course should fail
        with self.assertRaises(ValidationError):
            assignment4 = LecturerCourse(
                lecturer=self.lecturer,
                section=section4,
                is_primary=True
            )
            assignment4.full_clean()
