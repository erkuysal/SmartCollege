# SmartCollege Backend

This is the backend for the SmartCollege application, built with Django and Django REST Framework.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the backend directory with the following variables:
   ```
   DJANGO_SECRET_KEY=your_secret_key_here
   DJANGO_DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

5. Run migrations:
   ```
   python manage.py migrate
   ```

6. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

7. Run the development server:
   ```
   python manage.py runserver
   ```

## API Documentation

The API documentation is available at:
- Swagger UI: `/api/schema/swagger-ui/`
- ReDoc: `/api/schema/redoc/`

## Project Structure

- `backend/`: Django project settings
- `users/`: User management (students, lecturers, staff)
- `academics/`: Academic records (attendance, grades, enrollment)
- `college/`: College resources (courses, classrooms, departments)
- `utilities/`: Utility services (RFID, notifications)
- `security/`: Security features (audit logs, authentication)
- `transactions/`: Financial transactions (payments)

## Environment Variables

- `DJANGO_SECRET_KEY`: Secret key for Django
- `DJANGO_DEBUG`: Set to "True" for development, "False" for production
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts

## Field Naming Conventions

- All model fields use consistent naming conventions:
  - Course fields: `code`, `name`, `credits`, `semester`
  - Attendance status values: `present`, `absent`, `late`, `excused` 