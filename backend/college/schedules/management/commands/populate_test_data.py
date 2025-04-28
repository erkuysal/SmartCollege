from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import time, timedelta

from academics.enrollment.models import AcademicTerm, Enrollment
from college.courses.models import Course, CourseSection
from college.departments.models import Department
from college.faculties.models import Faculty
from college.classrooms.models import Classroom
from college.schedules.models import TimeSlot
from users.students.models import Student
from users.lecturers.models import Lecturer
from academics.bindings.models import LecturerCourse


class Command(BaseCommand):
    help = 'Populates the database with test data for timetabling'

    def handle(self, *args, **options):
        self.stdout.write('Creating test data for timetabling...')
        
        # Create faculty
        faculty, created = Faculty.objects.get_or_create(
            name="Engineering",
            defaults={
                'code': 'ENG',
                'dean': 'Dr. Engineering Dean'
            }
        )
        self.stdout.write(f'{"Created" if created else "Found"} faculty: {faculty.name}')
        
        # Create departments
        departments = []
        department_data = [
            {'name': 'Computer Science', 'head': 'Dr. CS Head'},
            {'name': 'Electrical Engineering', 'head': 'Dr. EE Head'},
            {'name': 'Mathematics', 'head': 'Dr. Math Head'}
        ]
        
        for dept in department_data:
            department, created = Department.objects.get_or_create(
                name=dept['name'],
                defaults={
                    'faculty': faculty,
                    'head_of_department': dept['head']
                }
            )
            departments.append(department)
            self.stdout.write(f'{"Created" if created else "Found"} department: {department.name}')
        
        # Create courses
        courses = []
        course_data = [
            {'code': 'CS101', 'name': 'Introduction to Programming', 'dept': departments[0], 'credits': 3},
            {'code': 'CS202', 'name': 'Data Structures and Algorithms', 'dept': departments[0], 'credits': 4},
            {'code': 'EE101', 'name': 'Circuit Theory', 'dept': departments[1], 'credits': 3},
            {'code': 'MATH101', 'name': 'Calculus I', 'dept': departments[2], 'credits': 4},
            {'code': 'MATH201', 'name': 'Linear Algebra', 'dept': departments[2], 'credits': 3},
        ]
        
        for course_info in course_data:
            course, created = Course.objects.get_or_create(
                code=course_info['code'],
                defaults={
                    'name': course_info['name'],
                    'department': course_info['dept'],
                    'credits': course_info['credits']
                }
            )
            courses.append(course)
            self.stdout.write(f'{"Created" if created else "Found"} course: {course.code} - {course.name}')
        
        # Create academic terms
        today = timezone.now().date()
        academic_terms = []
        
        term_data = [
            {
                'term': 'Fall',
                'academic_year': '2023-2024',
                'start_date': today - timedelta(days=90),
                'end_date': today + timedelta(days=90),
                'is_active': True,
                'registration_start': today - timedelta(days=120),
                'registration_end': today - timedelta(days=100)
            },
            {
                'term': 'Spring',
                'academic_year': '2023-2024',
                'start_date': today + timedelta(days=100),
                'end_date': today + timedelta(days=280),
                'is_active': False,
                'registration_start': today + timedelta(days=70),
                'registration_end': today + timedelta(days=90)
            }
        ]
        
        for term_info in term_data:
            term, created = AcademicTerm.objects.get_or_create(
                term=term_info['term'],
                academic_year=term_info['academic_year'],
                defaults={
                    'start_date': term_info['start_date'],
                    'end_date': term_info['end_date'],
                    'is_active': term_info['is_active'],
                    'registration_start': term_info['registration_start'],
                    'registration_end': term_info['registration_end']
                }
            )
            academic_terms.append(term)
            self.stdout.write(f'{"Created" if created else "Found"} term: {term.term} {term.academic_year}')
        
        # Create course sections
        sections = []
        for i, course in enumerate(courses):
            for section_num in ['A', 'B']:
                section, created = CourseSection.objects.get_or_create(
                    course=course,
                    section_number=section_num,
                    academic_term=academic_terms[0],  # Use the active term
                    defaults={
                        'capacity': 25 + (i * 5) % 10  # Varying capacities
                    }
                )
                sections.append(section)
                self.stdout.write(f'{"Created" if created else "Found"} section: {section.course.code} {section.section_number}')
        
        # Create classrooms
        classrooms = []
        classroom_data = [
            {'name': 'Room 101', 'building': 'Main Building', 'capacity': 35},
            {'name': 'Room 102', 'building': 'Main Building', 'capacity': 30},
            {'name': 'Lab 201', 'building': 'Science Building', 'capacity': 25},
            {'name': 'Room 301', 'building': 'Engineering Building', 'capacity': 40},
            {'name': 'Hall 101', 'building': 'Main Building', 'capacity': 100},
        ]
        
        for i, room_info in enumerate(classroom_data):
            classroom, created = Classroom.objects.get_or_create(
                name=room_info['name'],
                defaults={
                    'building': room_info['building'],
                    'capacity': room_info['capacity'],
                    'department': departments[i % len(departments)]
                }
            )
            classrooms.append(classroom)
            self.stdout.write(f'{"Created" if created else "Found"} classroom: {classroom.name}')
        
        # Create time slots
        timeslots = []
        for day in range(5):  # Monday to Friday
            for hour in [8, 9, 10, 11, 13, 14, 15, 16]:
                timeslot, created = TimeSlot.objects.get_or_create(
                    day_of_week=day,
                    start_time=time(hour, 0),
                    end_time=time(hour + 1, 0)
                )
                timeslots.append(timeslot)
                if created:
                    self.stdout.write(f'Created timeslot: {timeslot}')
        
        # Create lecturers
        lecturers = []
        lecturer_data = [
            {'username': 'lecturer1', 'name': 'John Doe', 'dept': departments[0]},
            {'username': 'lecturer2', 'name': 'Jane Smith', 'dept': departments[1]},
            {'username': 'lecturer3', 'name': 'Robert Johnson', 'dept': departments[2]},
        ]
        
        for lecturer_info in lecturer_data:
            user, created = User.objects.get_or_create(
                username=lecturer_info['username'],
                defaults={
                    'first_name': lecturer_info['name'].split()[0],
                    'last_name': lecturer_info['name'].split()[1],
                    'email': f"{lecturer_info['username']}@example.com"
                }
            )
            
            lecturer, created = Lecturer.objects.get_or_create(
                user=user,
                defaults={
                    'department': lecturer_info['dept'],
                    'qualification': 'PhD',
                    'max_courses': 5
                }
            )
            lecturers.append(lecturer)
            self.stdout.write(f'{"Created" if created else "Found"} lecturer: {lecturer.user.get_full_name()}')
        
        # Assign lecturers to course sections
        for i, section in enumerate(sections):
            lecturer = lecturers[i % len(lecturers)]
            assignment, created = LecturerCourse.objects.get_or_create(
                lecturer=lecturer,
                section=section,
                defaults={
                    'is_primary': True,
                    'role': 'Instructor',
                    'hours_per_week': 3
                }
            )
            if created:
                self.stdout.write(f'Assigned {lecturer.user.get_full_name()} to {section.course.code} {section.section_number}')
        
        # Create students
        students = []
        student_data = [
            {'username': 'student1', 'name': 'Alice Johnson', 'id': 'S001'},
            {'username': 'student2', 'name': 'Bob Williams', 'id': 'S002'},
            {'username': 'student3', 'name': 'Carol Brown', 'id': 'S003'},
            {'username': 'student4', 'name': 'David Miller', 'id': 'S004'},
            {'username': 'student5', 'name': 'Eva Davis', 'id': 'S005'},
        ]
        
        for student_info in student_data:
            user, created = User.objects.get_or_create(
                username=student_info['username'],
                defaults={
                    'first_name': student_info['name'].split()[0],
                    'last_name': student_info['name'].split()[1],
                    'email': f"{student_info['username']}@example.com"
                }
            )
            
            student, created = Student.objects.get_or_create(
                user=user,
                defaults={
                    'student_number': student_info['id']
                }
            )
            students.append(student)
            self.stdout.write(f'{"Created" if created else "Found"} student: {student.user.get_full_name()}')
        
        # Enroll students in courses
        for i, student in enumerate(students):
            # Enroll each student in 3-4 courses
            for j in range(3 + (i % 2)):
                section_index = (i + j) % len(sections)
                enrollment, created = Enrollment.objects.get_or_create(
                    student=student,
                    section=sections[section_index],
                    defaults={
                        'status': 'registered',
                        'date_enrolled': timezone.now() - timedelta(days=30)
                    }
                )
                if created:
                    self.stdout.write(f'Enrolled {student.user.get_full_name()} in {sections[section_index].course.code} {sections[section_index].section_number}')
        
        self.stdout.write(self.style.SUCCESS('Successfully created test data for timetabling'))
        self.stdout.write('\nTo generate a timetable, run:')
        self.stdout.write('python manage.py shell')
        self.stdout.write('>>> from college.schedules.services import TimetablingService')
        self.stdout.write(f'>>> TimetablingService.solve_timetabling({academic_terms[0].id})') 