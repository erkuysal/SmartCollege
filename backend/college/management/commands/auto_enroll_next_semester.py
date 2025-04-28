from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.apps import apps


class Command(BaseCommand):
    help = 'Auto-enroll continuing students in their next semester courses'

    def add_arguments(self, parser):
        parser.add_argument('--current-semester', type=str, required=True, 
                            help='Current semester (e.g., Fall, Spring)')
        parser.add_argument('--current-year', type=str, required=True, 
                            help='Current academic year (e.g., 2024-2025)')
        parser.add_argument('--next-semester', type=str, required=True, 
                            help='Next semester to enroll for (e.g., Spring, Fall)')
        parser.add_argument('--next-year', type=str, required=True, 
                            help='Next academic year (e.g., 2024-2025)')
        parser.add_argument('--min-gpa', type=float, default=2.0,
                            help='Minimum GPA required to auto-advance (default: 2.0)')
        parser.add_argument('--dry-run', action='store_true', 
                            help='Preview enrollments without making changes')

    def handle(self, *args, **options):
        current_semester = options['current_semester']
        current_year = options['current_year']
        next_semester = options['next_semester']
        next_year = options['next_year']
        min_gpa = options['min_gpa']
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write("DRY RUN - No changes will be made")
        
        self.stdout.write(f"Auto-enrolling students for {next_semester} {next_year}...")
        
        # Use lazy loading for models
        Student = apps.get_model('students', 'Student')
        CoursePackage = apps.get_model('courses', 'CoursePackage')
        Enrollment = apps.get_model('enrollment', 'Enrollment')
        Grade = apps.get_model('grades', 'Grade')
        
        # Get all active, non-freshman students
        continuing_students = Student.objects.filter(
            is_active=True,
            current_semester__gt=1
        )
        self.stdout.write(f"Found {continuing_students.count()} continuing students")
        
        enrollment_count = 0
        promotion_count = 0
        
        try:
            with transaction.atomic():
                for student in continuing_students:
                    # Calculate student's GPA for current semester
                    current_grades = Grade.objects.filter(
                        student=student,
                        enrollment__semester=current_semester,
                        enrollment__academic_year=current_year
                    )
                    
                    if not current_grades.exists():
                        self.stdout.write(self.style.WARNING(
                            f"No grades found for {student.user.username} in {current_semester} {current_year}"
                        ))
                        continue
                    
                    # Calculate GPA (assuming grades are on 4.0 scale)
                    total_credits = sum(grade.enrollment.course.credits for grade in current_grades)
                    weighted_grades = sum(grade.grade_point * grade.enrollment.course.credits for grade in current_grades)
                    gpa = weighted_grades / total_credits if total_credits > 0 else 0
                    
                    self.stdout.write(f"{student.user.username} - GPA: {gpa:.2f}")
                    
                    # Check if GPA meets minimum requirement
                    if gpa < min_gpa:
                        self.stdout.write(self.style.WARNING(
                            f"{student.user.username} GPA {gpa:.2f} below minimum {min_gpa} - not advancing"
                        ))
                        continue
                    
                    # Get the next semester package
                    next_semester_number = student.current_semester + 1
                    try:
                        package = CoursePackage.objects.get(
                            department=student.department, 
                            semester=next_semester_number
                        )
                    except CoursePackage.DoesNotExist:
                        self.stdout.write(self.style.WARNING(
                            f"No course package found for {student.department} semester {next_semester_number}"
                        ))
                        continue
                    
                    # Get all courses in the package
                    next_courses = package.courses.filter(is_active=True)
                    self.stdout.write(f"Found {next_courses.count()} courses for {student.user.username} in semester {next_semester_number}")
                    
                    # Verify prerequisites are met for all courses
                    eligible_courses = []
                    for course in next_courses:
                        if student.has_completed_prerequisites(course):
                            eligible_courses.append(course)
                        else:
                            self.stdout.write(self.style.WARNING(
                                f"{student.user.username} missing prerequisites for {course.code}"
                            ))
                    
                    # Enroll the student in eligible courses
                    for course in eligible_courses:
                        # Check if student is already enrolled
                        existing = Enrollment.objects.filter(
                            student=student,
                            course=course,
                            semester=next_semester,
                            academic_year=next_year
                        ).exists()
                        
                        if not existing:
                            if not dry_run:
                                Enrollment.objects.create(
                                    student=student,
                                    course=course,
                                    semester=next_semester,
                                    academic_year=next_year
                                )
                            enrollment_count += 1
                    
                    # If the student gets enrolled in courses, promote to next semester
                    if eligible_courses and not dry_run:
                        old_semester = student.current_semester
                        student.current_semester = next_semester_number
                        student.save()
                        promotion_count += 1
                        self.stdout.write(f"Promoted {student.user.username} from semester {old_semester} to {next_semester_number}")
                
                if dry_run:
                    self.stdout.write(f"Would create {enrollment_count} enrollments and promote {promotion_count} students")
                    raise CommandError("Dry run completed. No changes made.")
                    
            self.stdout.write(self.style.SUCCESS(
                f"Created {enrollment_count} enrollments and promoted {promotion_count} students successfully"
            ))
                
        except Exception as e:
            if not isinstance(e, CommandError) or 'Dry run' not in str(e):
                raise CommandError(f"Error during auto-enrollment: {str(e)}")
            else:
                raise e 