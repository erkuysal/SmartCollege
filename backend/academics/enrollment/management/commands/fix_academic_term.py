import os
import re
from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from django.conf import settings
from django.apps import apps
from django.db.migrations.writer import MigrationWriter
from django.db.migrations.autodetector import MigrationAutodetector
from django.db.migrations.state import ProjectState
from django.db.migrations.loader import MigrationLoader


class Command(BaseCommand):
    help = "Fix AcademicTerm model migrations"

    def add_arguments(self, parser):
        parser.add_argument(
            '--clean-db',
            action='store_true',
            help='Clean database of existing AcademicTerm table',
        )
        parser.add_argument(
            '--test-only',
            action='store_true',
            help='Just run tests for AcademicTerm without fixing migrations',
        )

    def handle(self, *args, **options):
        # First, check if the model is correctly defined
        try:
            AcademicTerm = apps.get_model('enrollment', 'AcademicTerm')
            self.stdout.write(self.style.SUCCESS(f"AcademicTerm model exists with fields: {[f.name for f in AcademicTerm._meta.fields]}"))
        except LookupError:
            raise CommandError("AcademicTerm model not found in enrollment app")
        
        if options['test_only']:
            self.stdout.write(self.style.SUCCESS("Test only mode - not fixing migrations"))
            return
        
        # Clean DB if requested
        if options['clean_db']:
            self.clean_database()
        
        # Check existing migrations and find the ones related to AcademicTerm
        migrations_dir = os.path.join(settings.BASE_DIR, 'academics', 'enrollment', 'migrations')
        academic_term_migrations = []
        
        for filename in os.listdir(migrations_dir):
            if filename.endswith('.py') and filename != '__init__.py':
                file_path = os.path.join(migrations_dir, filename)
                with open(file_path, 'r') as f:
                    content = f.read()
                    if 'AcademicTerm' in content:
                        academic_term_migrations.append(filename)
        
        if academic_term_migrations:
            self.stdout.write(self.style.WARNING(f"Found AcademicTerm in migrations: {', '.join(academic_term_migrations)}"))
            
            # Delete the migrations related to AcademicTerm
            for filename in academic_term_migrations:
                file_path = os.path.join(migrations_dir, filename)
                os.remove(file_path)
                self.stdout.write(self.style.SUCCESS(f"Deleted migration: {filename}"))
        
        # Create a special migration just for AcademicTerm
        self.create_academic_term_migration()
        
        self.stdout.write(self.style.SUCCESS(
            "AcademicTerm migration has been fixed. Now run:\n"
            "python manage.py migrate academics.enrollment\n"
            "python manage.py check"
        ))
    
    def clean_database(self):
        """Clean up database tables and migration records related to AcademicTerm"""
        with connection.cursor() as cursor:
            # Check if the table exists first
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='academics_enrollment_academicterm';
            """)
            table_exists = cursor.fetchone()
            
            if table_exists:
                # Drop AcademicTerm related tables
                cursor.execute("DROP TABLE academics_enrollment_academicterm;")
                self.stdout.write(self.style.SUCCESS("Dropped academics_enrollment_academicterm table"))
            
            # Clean migration records
            cursor.execute("""
                DELETE FROM django_migrations 
                WHERE app = 'academics.enrollment' AND name LIKE '%academic%term%';
            """)
            self.stdout.write(self.style.SUCCESS("Removed AcademicTerm migration records"))
    
    def create_academic_term_migration(self):
        """Create a new migration file specifically for AcademicTerm model"""
        migrations_dir = os.path.join(settings.BASE_DIR, 'academics', 'enrollment', 'migrations')
        
        # Find the highest migration number
        migration_numbers = []
        for filename in os.listdir(migrations_dir):
            if filename.endswith('.py') and filename != '__init__.py':
                match = re.match(r'(\d{4})_.*\.py', filename)
                if match:
                    migration_numbers.append(int(match.group(1)))
        
        next_number = 1
        if migration_numbers:
            next_number = max(migration_numbers) + 1
        
        # Create a new migration file
        migration_name = f"{next_number:04d}_add_academic_term_model.py"
        migration_path = os.path.join(migrations_dir, migration_name)
        
        migration_content = self.generate_migration_content()
        
        with open(migration_path, 'w') as f:
            f.write(migration_content)
        
        self.stdout.write(self.style.SUCCESS(f"Created new migration file: {migration_name}"))
    
    def generate_migration_content(self):
        """Generate the migration file content for AcademicTerm model"""
        return """# Generated manually to add AcademicTerm model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('enrollment', '0010_remove_enrollment_enrollment_date_not_future_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='AcademicTerm',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text="Term name (e.g., 'Fall 2025')", max_length=50)),
                ('term', models.CharField(choices=[('Fall', 'Fall'), ('Spring', 'Spring'), ('Summer', 'Summer')], help_text='Term (Fall, Spring, Summer)', max_length=20)),
                ('academic_year', models.CharField(help_text="Academic year (e.g., '2024-2025')", max_length=20)),
                ('start_date', models.DateField(help_text='Term start date')),
                ('end_date', models.DateField(help_text='Term end date')),
                ('registration_start', models.DateField(help_text='Registration start date')),
                ('registration_end', models.DateField(help_text='Registration end date')),
                ('is_active', models.BooleanField(default=False, help_text='Whether this term is currently active')),
            ],
            options={
                'ordering': ['-academic_year', 'term'],
                'unique_together': {('term', 'academic_year')},
            },
        ),
        migrations.AddConstraint(
            model_name='academicterm',
            constraint=models.CheckConstraint(check=models.Q(('end_date__gt', models.F('start_date'))), name='end_date_after_start_date'),
        ),
        migrations.AddConstraint(
            model_name='academicterm',
            constraint=models.CheckConstraint(check=models.Q(('registration_end__gt', models.F('registration_start'))), name='registration_end_after_start'),
        ),
        migrations.AddIndex(
            model_name='academicterm',
            index=models.Index(fields=['term', 'academic_year'], name='enrollment__term_50c25d_idx'),
        ),
        migrations.AddIndex(
            model_name='academicterm',
            index=models.Index(fields=['is_active'], name='enrollment__is_acti_1b1fcd_idx'),
        ),
    ]
""" 