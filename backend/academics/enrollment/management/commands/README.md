# Migration Management Commands

This directory contains custom management commands to help manage migrations for the academics enrollment app, particularly for dealing with issues related to the AcademicTerm model.

## Available Commands

### 1. `fix_academic_term`

Fixes issues with the AcademicTerm model migrations by creating a proper migration file.

```bash
# Basic usage:
python manage.py fix_academic_term

# Clean the database as well:
python manage.py fix_academic_term --clean-db

# Just check if the model is properly defined (no changes):
python manage.py fix_academic_term --test-only
```

### 2. `reset_migrations`

Resets all migrations or just AcademicTerm-related migrations.

```bash
# Reset only AcademicTerm-related migrations:
python manage.py reset_migrations

# Reset all migrations in the enrollment app:
python manage.py reset_migrations --all-migrations

# Also clean the database:
python manage.py reset_migrations --clean-db
```

### 3. `fix_test_db`

Sets up the test database properly and runs tests.

```bash
# Run all tests:
python manage.py fix_test_db

# Run specific module tests:
python manage.py fix_test_db --module college.schedules.tests
```

## Common Issues and Solutions

### "no such table: enrollment_academicterm" Error in Tests

This typically happens when the migration for the AcademicTerm model is missing or hasn't been properly applied to the test database.

Solution:

1. Fix the AcademicTerm migration:
   ```bash
   python manage.py fix_academic_term --clean-db
   ```

2. Apply migrations:
   ```bash
   python manage.py migrate
   ```

3. Run the tests again:
   ```bash
   python manage.py test college.schedules
   ```

### Missing Dependencies in Frontend (e.g., moment.js)

If you encounter errors like "Failed to resolve import 'moment'", you need to install the required dependency:

```bash
cd frontend
npm install moment
```

Alternatively, remove the dependency if it's not used:

1. Edit the file to remove the import
2. Run tests to see if it works without it

## Troubleshooting Migration Errors

If you continue to have issues with migrations:

1. Reset all migrations:
   ```bash
   python manage.py reset_migrations --all-migrations --clean-db
   ```

2. Generate fresh migrations:
   ```bash
   python manage.py makemigrations academics.enrollment
   ```

3. Apply migrations:
   ```bash
   python manage.py migrate
   ```

4. Run tests:
   ```bash
   python manage.py test
   ``` 