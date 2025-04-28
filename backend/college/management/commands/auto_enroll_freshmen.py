from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.apps import apps


class Command(BaseCommand):
    help = 'Auto-enroll freshman students in their required courses based on department packages'

    def add_arguments(self, parser):
        parser.add_argument('--semester', type=str, required=True, 
                            help='Semester to enroll for (e.g., Fall, Spring)')
        parser.add_argument('--academic-year', type=str, required=True, 
                            help='Academic year (e.g., 2024-2025)')
        parser.add_argument('--dry-run', action='store_true', 
                            help='Preview enrollments without making changes')

    def handle(self, *args, **options):
        semester = options['semester']
        academic_year = options['academic_year']
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write("DRY RUN - No changes will be made")
        
        self.stdout.write(f"Auto-enrolling freshmen for {semester} {academic_year}...")
        
        # Use lazy loading for models
        Student = apps.get_model('students', 'Student')
        CoursePackage = apps.get_model('courses', 'CoursePackage')
        Enrollment = apps.get_model('enrollment', 'Enrollment')
        
        # Get all freshman students (assuming they have semester=1 in their profile)
        freshmen = Student.objects.filter(current_semester=1, is_active=True)
        self.stdout.write(f"Found {freshmen.count()} freshman students")
        
        enrollment_count = 0
        
        try:
            with transaction.atomic():
                for student in freshmen:
                    # Get the course package for the student's department, semester 1
                    try:
                        package = CoursePackage.objects.get(
                            department=student.department, 
                            semester=1
                        )
                    except CoursePackage.DoesNotExist:
                        self.stdout.write(self.style.WARNING(
                            f"No course package found for {student.department} semester 1"
                        ))
                        continue
                    
                    # Get all courses in the package
                    freshman_courses = package.courses.filter(is_active=True)
                    self.stdout.write(f"Found {freshman_courses.count()} courses for {student.user.username}")
                    
                    # Enroll the student in each course
                    for course in freshman_courses:
                        # Check if student is already enrolled
                        existing = Enrollment.objects.filter(
                            student=student,
                            course=course,
                            semester=semester,
                            academic_year=academic_year
                        ).exists()
                        
                        if not existing:
                            if not dry_run:
                                Enrollment.objects.create(
                                    student=student,
                                    course=course,
                                    semester=semester,
                                    academic_year=academic_year
                                )
                            enrollment_count += 1
                
                if dry_run:
                    self.stdout.write(f"Would create {enrollment_count} enrollments")
                    raise CommandError("Dry run completed. No changes made.")
                    
            self.stdout.write(self.style.SUCCESS(f"Created {enrollment_count} enrollments successfully"))
                
        except Exception as e:
            if not isinstance(e, CommandError) or 'Dry run' not in str(e):
                raise CommandError(f"Error during auto-enrollment: {str(e)}")
            else:
                raise e 