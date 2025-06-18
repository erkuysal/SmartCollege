# Academic Module API Documentation

This document describes the API endpoints for the Academic module of SmartAttendance.

---

## Base URL

    /api/academic/

---

## Endpoints

### 1. Academic Years
- **List:** `GET /api/academic/academic-years/`
- **Retrieve:** `GET /api/academic/academic-years/{id}/`
- **Create:** `POST /api/academic/academic-years/`
- **Update:** `PUT/PATCH /api/academic/academic-years/{id}/`
- **Delete:** `DELETE /api/academic/academic-years/{id}/`

#### Example Response
```json
{
  "id": 1,
  "year": "2024-2025",
  "start_date": "2024-09-01",
  "end_date": "2025-06-30",
  "is_active": true,
  "duration": "Sep 2024 - Jun 2025",
  "is_current": true,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

---

### 2. Semesters
- **List:** `GET /api/academic/semesters/`
- **Retrieve:** `GET /api/academic/semesters/{id}/`
- **Create:** `POST /api/academic/semesters/`
- **Update:** `PUT/PATCH /api/academic/semesters/{id}/`
- **Delete:** `DELETE /api/academic/semesters/{id}/`

#### Example Response
```json
{
  "id": 1,
  "academic_year": 1,
  "semester_type": "fall",
  "start_date": "2024-09-01",
  "end_date": "2024-12-31",
  "registration_start": "2024-08-01",
  "registration_end": "2024-08-31",
  "is_active": true,
  "full_name": "Fall 2024-2025",
  "registration_period": "Aug 01 - Aug 31, 2024",
  "is_registration_open": true,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

---

### 3. Course Offerings
- **List:** `GET /api/academic/offerings/`
- **Retrieve:** `GET /api/academic/offerings/{id}/`
- **Create:** `POST /api/academic/offerings/`
- **Update:** `PUT/PATCH /api/academic/offerings/{id}/`
- **Delete:** `DELETE /api/academic/offerings/{id}/`
- **Filter:** `?course={course_id}&semester={semester_id}`

#### Example Response
```json
{
  "id": 1,
  "course": 1,
  "semester": 1,
  "instructor": 5,
  "capacity": 30,
  "enrolled_count": 25,
  "is_active": true,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

---

### 4. Class Schedules
- **List:** `GET /api/academic/schedules/`
- **Retrieve:** `GET /api/academic/schedules/{id}/`
- **Create:** `POST /api/academic/schedules/`
- **Update:** `PUT/PATCH /api/academic/schedules/{id}/`
- **Delete:** `DELETE /api/academic/schedules/{id}/`
- **Filter:** `?course_offering={offering_id}`
- **Generate Sessions:** `POST /api/academic/schedules/{id}/generate_sessions/` (body: `{ "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" }`)

#### Example Response
```json
{
  "id": 1,
  "course_offering": 1,
  "classroom": 2,
  "day": "Monday",
  "time_slot": 3,
  "is_active": true,
  "notes": "",
  "recurrence_rule": "RRULE:FREQ=WEEKLY;BYDAY=MO,WE",
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

---

### 5. Course Registrations
- **List:** `GET /api/academic/registrations/`
- **Retrieve:** `GET /api/academic/registrations/{id}/`
- **Create:** `POST /api/academic/registrations/`
- **Update:** `PUT/PATCH /api/academic/registrations/{id}/`
- **Delete:** `DELETE /api/academic/registrations/{id}/`
- **Approve:** `POST /api/academic/registrations/{id}/approve/`
- **Reject:** `POST /api/academic/registrations/{id}/reject/` (body: `{ "reason": "..." }`)

#### Example Response
```json
{
  "id": 1,
  "student": 10,
  "student_name": "John Doe",
  "course_offering": 1,
  "course_code": "CS101",
  "semester": "Fall 2024-2025",
  "instructor": "Dr. Smith",
  "status": "approved",
  "registration_date": "2024-08-10T10:00:00Z",
  "approval_date": "2024-08-11T12:00:00Z",
  "approved_by": "Dr. Smith",
  "notes": "Welcome to the course!",
  "can_register": false,
  "created_at": "2024-08-10T10:00:00Z",
  "updated_at": "2024-08-11T12:00:00Z"
}
```

---

## Notes
- All endpoints currently allow any user (no authentication required).
- Use filtering query params for more specific queries (e.g., by course, semester, or offering).
- For custom actions (approve/reject/generate_sessions), use the provided POST endpoints.
- Date/time fields are in ISO 8601 format (UTC).

---

## See Also
- [Attendance API Documentation](../attendance/API_DOCS.md) (if available)
- [Django REST Framework Docs](https://www.django-rest-framework.org/) 