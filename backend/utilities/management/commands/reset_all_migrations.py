import os
import re
import shutil
import glob
from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from django.conf import settings
from django.apps import apps


class Command(BaseCommand):
    help = "Reset migrations for all modules or specific modules in the project"

    def add_arguments(self, parser):
        parser.add_argument(
            '--modules',
            nargs='+',
            help='Specific modules to reset (e.g., academics.enrollment college.schedules)'
        )
        parser.add_argument(
            '--clean-db',
            action='store_true',
            help='Delete the relevant tables from the database'
        )
        parser.add_argument(
            '--keep-initial',
            action='store_true',
            help='Keep the initial migration file (0001_initial.py) for each app'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting anything'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force reset without asking for confirmation'
        )

    def handle(self, *args, **options):
        # Get all installed apps from Django settings
        all_apps = [app_config.name for app_config in apps.get_app_configs()]
        
        # Filter apps based on modules argument if provided
        if options['modules']:
            target_apps = []
            for module in options['modules']:
                matching_apps = [app for app in all_apps if app.startswith(module)]
                if not matching_apps:
                    self.stdout.write(self.style.WARNING(f"No apps found matching the module '{module}'"))
                target_apps.extend(matching_apps)
            target_apps = list(set(target_apps))  # Remove duplicates
        else:
            target_apps = all_apps
        
        if not target_apps:
            self.stdout.write(self.style.ERROR("No apps selected for migration reset"))
            return
            
        # Get the list of migrations to be deleted for each app
        migrations_to_delete = {}
        for app in target_apps:
            app_label = app.split('.')[-1]
            
            # Find the migrations directory for this app
            migrations_dir = None
            for app_path in settings.INSTALLED_APPS:
                possible_path = os.path.join(settings.BASE_DIR, app_path.replace('.', '/'), 'migrations')
                if os.path.exists(possible_path):
                    try:
                        module = __import__(f"{app_path}.migrations", fromlist=[''])
                        migrations_dir = os.path.dirname(module.__file__)
                        break
                    except ImportError:
                        continue
            
            if not migrations_dir or not os.path.exists(migrations_dir):
                self.stdout.write(self.style.WARNING(f"No migrations directory found for app '{app}'"))
                continue
                
            # Find migration files to delete
            app_migrations = []
            for filename in os.listdir(migrations_dir):
                if filename.endswith('.py') and filename != '__init__.py':
                    # If keep_initial is True, don't add 0001_initial.py to the list
                    if options['keep_initial'] and filename.startswith('0001_initial'):
                        continue
                    app_migrations.append(os.path.join(migrations_dir, filename))
            
            if app_migrations:
                migrations_to_delete[app] = {
                    'dir': migrations_dir,
                    'files': app_migrations
                }
        
        # Show summary
        self.stdout.write(self.style.WARNING("The following migration files will be deleted:"))
        total_files = 0
        for app, data in migrations_to_delete.items():
            file_count = len(data['files'])
            total_files += file_count
            self.stdout.write(f"{app}: {file_count} migration file(s)")
            
            # Show the files in dry-run mode
            if options['dry_run']:
                for file_path in data['files']:
                    self.stdout.write(f"  - {os.path.basename(file_path)}")
        
        self.stdout.write(self.style.WARNING(f"Total: {total_files} migration file(s) across {len(migrations_to_delete)} app(s)"))
        
        # If dry-run mode, exit
        if options['dry_run']:
            self.stdout.write(self.style.SUCCESS("Dry run completed. No files were deleted."))
            return
        
        # Ask for confirmation if not forced
        if not options['force']:
            confirm = input("Do you want to proceed with deleting these migration files? (y/n): ")
            if confirm.lower() != 'y':
                self.stdout.write(self.style.SUCCESS("Operation cancelled."))
                return
        
        # Delete the migration files
        for app, data in migrations_to_delete.items():
            for file_path in data['files']:
                try:
                    os.remove(file_path)
                    self.stdout.write(self.style.SUCCESS(f"Deleted: {file_path}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error deleting {file_path}: {str(e)}"))
        
        # Clean the database if requested
        if options['clean_db']:
            self.clean_database(migrations_to_delete.keys())
        
        self.stdout.write(self.style.SUCCESS(
            "Migration files have been reset. Now run:\n"
            "1. python manage.py makemigrations\n"
            "2. python manage.py migrate"
        ))
    
    def clean_database(self, app_list):
        """Clean up database tables and migration records for the given apps"""
        self.stdout.write(self.style.WARNING("Cleaning database..."))
        
        with connection.cursor() as cursor:
            # Get the list of all tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            all_tables = [row[0] for row in cursor.fetchall()]
            
            # Drop tables for the apps if they exist
            for app in app_list:
                app_label = app.split('.')[-1]
                
                # Find tables related to this app
                app_tables = [table for table in all_tables if table.startswith(f"{app_label}_")]
                
                for table in app_tables:
                    try:
                        cursor.execute(f"DROP TABLE IF EXISTS {table};")
                        self.stdout.write(self.style.SUCCESS(f"Dropped table: {table}"))
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Error dropping table {table}: {str(e)}"))
                
                # Clean migration records for this app
                try:
                    cursor.execute(f"DELETE FROM django_migrations WHERE app = '{app}';")
                    self.stdout.write(self.style.SUCCESS(f"Removed migration records for: {app}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error removing migration records for {app}: {str(e)}"))
        
        self.stdout.write(self.style.SUCCESS("Database cleaning completed")) 