from django.core.management.base import BaseCommand, CommandError
from django.apps import apps


class Command(BaseCommand):
    help = 'Generate a conflict-free timetable for a semester using constraint satisfaction'

    def add_arguments(self, parser):
        parser.add_argument('--semester', type=str, required=True, 
                            help='Semester to generate the timetable for (e.g., Fall, Spring)')
        parser.add_argument('--academic-year', type=str, required=True, 
                            help='Academic year (e.g., 2024-2025)')

    def handle(self, *args, **options):
        semester = options['semester']
        academic_year = options['academic_year']
        
        self.stdout.write(f"Generating timetable for {semester} {academic_year}...")
        
        try:
            # Use lazy loading for the service to prevent circular imports
            from college.schedules.services import TimetablingService
            
            success = TimetablingService.solve_timetabling(semester, academic_year)
            
            if success:
                self.stdout.write(self.style.SUCCESS('Timetable generated successfully!'))
            else:
                self.stdout.write(self.style.ERROR('Could not find a feasible timetable. Try adjusting constraints.'))
        except Exception as e:
            raise CommandError(f"Error generating timetable: {str(e)}") 