import os
import shutil
from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from django.conf import settings


class Command(BaseCommand):
    help = "Reset migrations for the enrollment app, optionally cleaning the database"

    def add_arguments(self, parser):
        parser.add_argument(
            '--clean-db',
            action='store_true',
            help='Delete the relevant tables from the database',
        )
        parser.add_argument(
            '--all-migrations',
            action='store_true',
            help='Delete all migrations files (not just for AcademicTerm)',
        )

    def handle(self, *args, **options):
        # Path to the migrations directory
        migrations_dir = os.path.join(settings.BASE_DIR, 'academics', 'enrollment', 'migrations')
        
        # Check if the directory exists
        if not os.path.exists(migrations_dir):
            raise CommandError(f"Migrations directory does not exist: {migrations_dir}")
        
        # Keep __init__.py and __pycache__ folder
        if options['all_migrations']:
            # Delete all migration files
            for filename in os.listdir(migrations_dir):
                file_path = os.path.join(migrations_dir, filename)
                if filename != '__init__.py' and not filename.startswith('__pycache__'):
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                        self.stdout.write(self.style.SUCCESS(f"Deleted: {file_path}"))
        else:
            # Search for AcademicTerm-related migrations
            for filename in os.listdir(migrations_dir):
                file_path = os.path.join(migrations_dir, filename)
                if filename != '__init__.py' and not filename.startswith('__pycache__'):
                    if os.path.isfile(file_path):
                        # Check if the file contains AcademicTerm
                        with open(file_path, 'r') as f:
                            content = f.read()
                            if 'AcademicTerm' in content:
                                os.remove(file_path)
                                self.stdout.write(self.style.SUCCESS(f"Deleted: {file_path}"))
        
        # Clean the database if requested
        if options['clean_db']:
            with connection.cursor() as cursor:
                # Drop AcademicTerm table if it exists
                cursor.execute("""
                    DROP TABLE IF EXISTS academics_enrollment_academicterm;
                """)
                self.stdout.write(self.style.SUCCESS("Dropped academics_enrollment_academicterm table"))
                
                # Drop Django migration record
                cursor.execute("""
                    DELETE FROM django_migrations 
                    WHERE app = 'academics.enrollment' AND name LIKE '%academicterm%';
                """)
                self.stdout.write(self.style.SUCCESS("Removed AcademicTerm migration records from django_migrations"))
        
        self.stdout.write(self.style.SUCCESS(
            "Migration files have been reset. Now run:\n"
            "1. python manage.py makemigrations\n"
            "2. python manage.py migrate"
        )) 