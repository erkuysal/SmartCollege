from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

from .models import Course, CourseSection, CoursePackage
from college.departments.models import Department
from college.faculties.models import Faculty
from academics.enrollment.models import AcademicTerm


class CourseTestCase(TestCase):
    """Tests for the Course model"""
    
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
            credits=3,
            semester="Fall"
        )
        
        # Create a prerequisite course
        self.prereq_course = Course.objects.create(
            code="MATH101",
            name="Calculus I",
            department=self.department,
            credits=4,
            semester="Fall"
        )
    
    def test_course_creation(self):
        """Test that a course can be created"""
        self.assertEqual(self.course.code, "CS101")
        self.assertEqual(self.course.name, "Intro to Programming")
        self.assertEqual(self.course.department, self.department)
        self.assertEqual(self.course.credits, 3)
        self.assertEqual(self.course.semester, "Fall")
        self.assertTrue(self.course.is_active)
    
    def test_course_string_representation(self):
        """Test the string representation of a course"""
        self.assertEqual(str(self.course), "CS101 - Intro to Programming")
    
    def test_add_prerequisite(self):
        """Test adding a prerequisite to a course"""
        # Add a prerequisite
        self.course.prerequisites.add(self.prereq_course)
        
        # Check if the prerequisite was added
        self.assertEqual(self.course.prerequisites.count(), 1)
        self.assertEqual(self.course.prerequisites.first(), self.prereq_course)
    
    def test_prevent_self_prerequisite(self):
        """Test that a course cannot be its own prerequisite"""
        # Try to add the course as its own prerequisite
        self.course.prerequisites.add(self.course)
        
        # Validate should raise an error
        with self.assertRaises(ValidationError):
            self.course.clean()


class CourseSectionTestCase(TestCase):
    """Tests for the CourseSection model"""
    
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
    
    def test_section_creation(self):
        """Test that a course section can be created"""
        self.assertEqual(self.section.course, self.course)
        self.assertEqual(self.section.section_number, "A")
        self.assertEqual(self.section.academic_term, self.academic_term)
        self.assertEqual(self.section.capacity, 30)
        self.assertTrue(self.section.is_active)
    
    def test_section_string_representation(self):
        """Test the string representation of a course section"""
        expected = f"{self.course.code} - Section A ({self.academic_term})"
        self.assertEqual(str(self.section), expected)
    
    def test_duplicate_section(self):
        """Test that creating a duplicate section raises an error"""
        with self.assertRaises(ValidationError):
            duplicate = CourseSection(
                course=self.course,
                section_number="A",
                academic_term=self.academic_term,
                capacity=30
            )
            duplicate.full_clean()  # This should raise ValidationError
    
    def test_invalid_capacity(self):
        """Test that a section with invalid capacity raises an error"""
        with self.assertRaises(ValidationError):
            invalid_section = CourseSection(
                course=self.course,
                section_number="B",
                academic_term=self.academic_term,
                capacity=0  # Invalid capacity
            )
            invalid_section.full_clean()  # This should raise ValidationError


class CoursePackageTestCase(TestCase):
    """Tests for the CoursePackage model"""
    
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
        
        # Create course package
        self.package = CoursePackage.objects.create(
            department=self.department,
            semester=1
        )
        self.package.courses.add(self.course1, self.course2)
    
    def test_package_creation(self):
        """Test that a course package can be created"""
        self.assertEqual(self.package.department, self.department)
        self.assertEqual(self.package.semester, 1)
        self.assertEqual(self.package.courses.count(), 2)
        self.assertIn(self.course1, self.package.courses.all())
        self.assertIn(self.course2, self.package.courses.all())
    
    def test_package_string_representation(self):
        """Test the string representation of a course package"""
        expected = f"{self.department.name} - Semester 1"
        self.assertEqual(str(self.package), expected)
