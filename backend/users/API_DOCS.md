# Users Module API Documentation

This document describes the API endpoints for the Users module of SmartAttendance.

---

## Base URL

    /api/users/

---

## Endpoints

### 1. Students
- **List:** `GET /api/users/students/`
- **Retrieve:** `GET /api/users/students/{id}/`
- **Create:** `POST /api/users/students/`
- **Update:** `PUT/PATCH /api/users/students/{id}/`
- **Delete:** `DELETE /api/users/students/{id}/`

#### Example Response
```json
{
  "id": 1,
  "user_number": "S20240001",
  "email": "S20240001@institution.edu",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "student",
  "is_active": true,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z",
  "student_number": "S20240001"
}
```

---

### 2. Lecturers
- **List:** `GET /api/users/lecturers/`
- **Retrieve:** `GET /api/users/lecturers/{id}/`
- **Create:** `POST /api/users/lecturers/`
- **Update:** `PUT/PATCH /api/users/lecturers/{id}/`
- **Delete:** `DELETE /api/users/lecturers/{id}/`

#### Example Response
```json
{
  "id": 2,
  "user_number": "L20240001",
  "email": "L20240001@institution.edu",
  "first_name": "Jane",
  "last_name": "Smith",
  "user_type": "lecturer",
  "is_active": true,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z",
  "lecturer_number": "L20240001",
  "title": "Dr."
}
```

---

## Notes
- All endpoints currently allow any user (no authentication required).
- Use filtering query params for more specific queries (e.g., by name or user number).
- Date/time fields are in ISO 8601 format (UTC).
- User numbers and emails are auto-generated based on user type and year.

---

## See Also
- [Academic API Documentation](../academic/API_DOCS.md)
- [Wallet API Documentation](../wallet/API_DOCS.md)
- [Django REST Framework Docs](https://www.django-rest-framework.org/) 