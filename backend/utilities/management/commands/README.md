# Migration Management Commands

This directory contains commands to help manage migrations across your Django project.

## Global Migration Reset Command

### `reset_all_migrations`

This command allows you to reset migrations for all modules or specific modules in your project.

#### Basic Usage

```bash
# Show what migrations would be deleted without actually deleting them
python manage.py reset_all_migrations --dry-run

# Reset migrations for all modules
python manage.py reset_all_migrations --force

# Reset migrations for specific modules
python manage.py reset_all_migrations --modules academics college.schedules --force

# Reset migrations and also clean database tables
python manage.py reset_all_migrations --clean-db --force

# Keep the initial (0001_initial.py) migration file for each app
python manage.py reset_all_migrations --keep-initial --force
```

#### Options

- `--modules`: Specific modules to reset (e.g., academics.enrollment college.schedules)
- `--clean-db`: Delete the relevant tables from the database
- `--keep-initial`: Keep the initial migration file (0001_initial.py) for each app
- `--dry-run`: Show what would be deleted without actually deleting anything
- `--force`: Force reset without asking for confirmation

## Specific Migration Commands for academics.enrollment

For issues specific to the AcademicTerm model, use the following specialized commands:

### `fix_academic_term`

```bash
# Basic usage
python manage.py fix_academic_term

# Clean the database as well
python manage.py fix_academic_term --clean-db

# Test only (checks if model is properly defined)
python manage.py fix_academic_term --test-only
```

### `reset_migrations` (enrollment specific)

```bash
# Reset only AcademicTerm-related migrations
python manage.py reset_migrations

# Reset all migrations in the enrollment app
python manage.py reset_migrations --all-migrations

# Also clean the database
python manage.py reset_migrations --clean-db
```

### `fix_test_db`

```bash
# Run all tests with proper test database setup
python manage.py fix_test_db

# Run tests for a specific module
python manage.py fix_test_db --module college.schedules
```

## Common Workflows

### Complete Reset of All Migrations

```bash
# 1. Reset all migrations and clean database
python manage.py reset_all_migrations --clean-db --force

# 2. Regenerate migrations for all apps
python manage.py makemigrations

# 3. Apply migrations
python manage.py migrate

# 4. Run tests to verify
python manage.py test
```

### Fix AcademicTerm Issues Only

```bash
# 1. Fix the AcademicTerm model migration
python manage.py fix_academic_term --clean-db

# 2. Apply migrations
python manage.py migrate
```

### Workflow for Testing New Models

```bash
# 1. Reset migrations for specific app
python manage.py reset_all_migrations --modules myapp --keep-initial --force

# 2. Generate fresh migrations for the app
python manage.py makemigrations myapp

# 3. Apply migrations
python manage.py migrate

# 4. Run tests
python manage.py test myapp
``` 