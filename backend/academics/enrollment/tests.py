from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from users.base.models import User
from datetime import timedelta

from .models import AcademicTerm, Enrollment
from college.courses.models import Course, CourseSection
from college.departments.models import Department
from college.faculties.models import Faculty
from users.students.models import Student


class AcademicTermTestCase(TestCase):
    """Tests for the AcademicTerm model"""
    
    def setUp(self):
        # Current date for reference
        self.today = timezone.now().date()
        
        # Create academic term
        self.term = AcademicTerm.objects.create(
            term="Fall",
            academic_year="2023-2024",
            start_date=self.today,
            end_date=self.today + timedelta(days=90),
            registration_start=self.today - timedelta(days=30),
            registration_end=self.today - timedelta(days=1),
            is_active=True
        )
    
    def test_term_creation(self):
        """Test that an academic term can be created"""
        self.assertEqual(self.term.term, "Fall")
        self.assertEqual(self.term.academic_year, "2023-2024")
        self.assertEqual(self.term.start_date, self.today)
        self.assertEqual(self.term.end_date, self.today + timedelta(days=90))
        self.assertEqual(self.term.registration_start, self.today - timedelta(days=30))
        self.assertEqual(self.term.registration_end, self.today - timedelta(days=1))
        self.assertTrue(self.term.is_active)
    
    def test_term_string_representation(self):
        """Test the string representation of an academic term"""
        self.assertEqual(str(self.term), "Fall 2023-2024")
    
    def test_auto_name_generation(self):
        """Test automatic name generation"""
        term = AcademicTerm(
            term="Spring",
            academic_year="2023-2024",
            start_date=self.today + timedelta(days=100),
            end_date=self.today + timedelta(days=190),
            registration_start=self.today + timedelta(days=70),
            registration_end=self.today + timedelta(days=90)
        )
        term.save()
        self.assertEqual(term.name, "Spring 2023-2024")
    
    def test_invalid_dates(self):
        """Test that invalid dates raise validation errors"""
        # End date before start date
        with self.assertRaises(ValidationError):
            term = AcademicTerm(
                term="Spring",
                academic_year="2023-2024",
                start_date=self.today + timedelta(days=100),
                end_date=self.today + timedelta(days=90),  # End before start
                registration_start=self.today + timedelta(days=70),
                registration_end=self.today + timedelta(days=90)
            )
            term.full_clean()
        
        # Registration end before registration start
        with self.assertRaises(ValidationError):
            term = AcademicTerm(
                term="Spring",
                academic_year="2023-2024",
                start_date=self.today + timedelta(days=100),
                end_date=self.today + timedelta(days=190),
                registration_start=self.today + timedelta(days=90),
                registration_end=self.today + timedelta(days=70)  # End before start
            )
            term.full_clean()
    
    def test_active_term_validation(self):
        """Test that only one term can be active at a time"""
        # Create another active term
        with self.assertRaises(ValidationError):
            term = AcademicTerm(
                term="Spring",
                academic_year="2023-2024",
                start_date=self.today + timedelta(days=100),
                end_date=self.today + timedelta(days=190),
                registration_start=self.today + timedelta(days=70),
                registration_end=self.today + timedelta(days=90),
                is_active=True  # This should cause validation error
            )
            term.full_clean()


class EnrollmentTestCase(TestCase):
    """Tests for the Enrollment model"""
    
    def setUp(self):
        # Create faculty and department
        self.faculty = Faculty.objects.create(name="Engineering", code="ENG", dean="Dr. Smith")
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
            capacity=2  # Small capacity to test enrollment limit
        )
        
        # Create student
        self.user = User.objects.create_user(
            username="student1",
            email="student1@example.com",
            first_name="John",
            last_name="Doe"
        )
        
        self.student = Student.objects.create(
            user=self.user,
            student_number="S001"
        )
        
        # Create enrollment
        self.enrollment = Enrollment.objects.create(
            student=self.student,
            section=self.section,
            status="registered",
            date_enrolled=timezone.now() - timedelta(days=1)
        )
    
    def test_enrollment_creation(self):
        """Test that an enrollment can be created"""
        self.assertEqual(self.enrollment.student, self.student)
        self.assertEqual(self.enrollment.section, self.section)
        self.assertEqual(self.enrollment.status, "registered")
        self.assertIsNotNone(self.enrollment.date_enrolled)
    
    def test_enrollment_string_representation(self):
        """Test the string representation of an enrollment"""
        expected = f"{self.student.user.username} enrolled in {self.section} [registered]"
        self.assertEqual(str(self.enrollment), expected)
    
    def test_duplicate_enrollment(self):
        """Test that a student cannot be enrolled in the same section twice"""
        with self.assertRaises(ValidationError):
            duplicate = Enrollment(
                student=self.student,
                section=self.section,
                status="registered"
            )
            duplicate.full_clean()
    
    def test_section_capacity(self):
        """Test that enrollment is limited by section capacity"""
        # Create another student
        user2 = User.objects.create_user(
            username="student2",
            email="student2@example.com",
            first_name="Jane",
            last_name="Smith"
        )
        
        student2 = Student.objects.create(
            user=user2,
            student_number="S002"
        )
        
        # Enroll second student (should work as capacity is 2)
        enrollment2 = Enrollment.objects.create(
            student=student2,
            section=self.section,
            status="registered",
            date_enrolled=timezone.now() - timedelta(days=1)
        )
        
        # Create a third student
        user3 = User.objects.create_user(
            username="student3",
            email="student3@example.com",
            first_name="Bob",
            last_name="Johnson"
        )
        
        student3 = Student.objects.create(
            user=user3,
            student_number="S003"
        )
        
        # Try to enroll third student (should fail as capacity is reached)
        with self.assertRaises(ValidationError):
            enrollment3 = Enrollment(
                student=student3,
                section=self.section,
                status="registered"
            )
            enrollment3.full_clean()
    
    def test_grade_validation(self):
        """Test grade validation for passed/failed enrollments"""
        # Set valid grade for passed status
        self.enrollment.status = "passed"
        self.enrollment.grade = "A"
        self.enrollment.save()
        
        # Set invalid grade
        self.enrollment.grade = "Z"  # Invalid grade
        with self.assertRaises(ValidationError):
            self.enrollment.full_clean()
