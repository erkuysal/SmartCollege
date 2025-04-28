import os
import sys
from django.core.management.base import BaseCommand, CommandError
from django.db import connection


class Command(BaseCommand):
    help = "Fix test database setup for AcademicTerm model tests"

    def add_arguments(self, parser):
        parser.add_argument(
            '--module',
            type=str,
            help='Specific test module to run (e.g., college.schedules.tests)'
        )

    def handle(self, *args, **options):
        # Ensure migrations are up to date
        self.stdout.write(self.style.WARNING("Running migrations..."))
        os.system('python manage.py migrate')
        
        # Set test environment
        os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
        
        # Run the specific test if module is provided, otherwise run all tests
        if options['module']:
            test_cmd = f"python -m pytest {options['module']} -v"
        else:
            test_cmd = "python -m pytest"
        
        self.stdout.write(self.style.WARNING(f"Running tests with command: {test_cmd}"))
        
        # Run the tests with proper database setup
        result = os.system(test_cmd)
        
        if result == 0:
            self.stdout.write(self.style.SUCCESS("All tests passed!"))
        else:
            self.stdout.write(self.style.ERROR(f"Tests failed with exit code {result}"))
            
        return result 