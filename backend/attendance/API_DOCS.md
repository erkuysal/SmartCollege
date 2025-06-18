# Attendance Module API Documentation

This document describes the API endpoints for the Attendance module of SmartAttendance.

---

## Base URL

    /api/

---

## Endpoints

### 1. Attendance Sessions
- **List:** `GET /api/sessions/`
- **Retrieve:** `GET /api/sessions/{id}/`
- **Create:** `POST /api/sessions/`
- **Update:** `PUT/PATCH /api/sessions/{id}/`
- **Delete:** `DELETE /api/sessions/{id}/`
- **End Session:** `POST /api/sessions/{id}/end/`

#### Example Response
```json
{
  "id": 1,
  "name": "Morning Session",
  "course": 2,
  "start_time": "2025-06-07T09:00:00Z",
  "end_time": "2025-06-07T10:00:00Z",
  "is_active": false
}
```

---

### 2. Attendance Records
- **List:** `GET /api/records/`
- **Retrieve:** `GET /api/records/{id}/`
- **Create:** `POST /api/records/`
- **Update:** `PUT/PATCH /api/records/{id}/`
- **Delete:** `DELETE /api/records/{id}/`

#### Example Response
```json
{
  "id": 1,
  "student": {
    "id": 10,
    "user_number": "S20240001",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "student"
  },
  "session": 1,
  "timestamp": "2025-06-07T09:05:00Z"
}
```

---

### 3. Courses
- **List:** `GET /api/courses/`
- **Retrieve:** `GET /api/courses/{id}/`
- **Create:** `POST /api/courses/`
- **Update:** `PUT/PATCH /api/courses/{id}/`
- **Delete:** `DELETE /api/courses/{id}/`
- **Enroll Student:** `POST /api/courses/{id}/enroll_student/` (body: `{ "user_number": "S20240001" }`)
- **Unenroll Student:** `POST /api/courses/{id}/unenroll_student/` (body: `{ "user_number": "S20240001" }`)
- **List Enrolled Students:** `GET /api/courses/{id}/enrolled_students/`

#### Example Response
```json
{
  "id": 2,
  "code": "CS101",
  "name": "Introduction to Computer Science",
  "description": "Basic computer science course",
  "instructor": 5,
  "instructor_name": "Dr. Smith",
  "is_active": true,
  "enrolled_students_count": 25,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

---

### 4. Mark Attendance
- **Mark attendance (RFID):** `POST /api/mark-attendance/` (body: `{ "user_number": "S20240001", "session_id": 1 }`)

#### Example Response
```json
{
  "status": "success",
  "user_number": "S20240001",
  "uid": "ABC123DEF456",
  "session_id": 1,
  "timestamp": "2025-06-07T09:05:00Z",
  "message": "Attendance marked successfully."
}
```

---

### 5. Classrooms
- **List:** `GET /api/classrooms/`
- **Retrieve:** `GET /api/classrooms/{id}/`
- **Create:** `POST /api/classrooms/`
- **Update:** `PUT/PATCH /api/classrooms/{id}/`
- **Delete:** `DELETE /api/classrooms/{id}/`

#### Example Response
```json
{
  "id": 1,
  "name": "Room 101"
}
```

---

### 6. Schedules
- **List:** `GET /api/schedules/`
- **Retrieve:** `GET /api/schedules/{id}/`
- **Create:** `POST /api/schedules/`
- **Update:** `PUT/PATCH /api/schedules/{id}/`
- **Delete:** `DELETE /api/schedules/{id}/`
- **Check Conflicts:** `GET /api/schedules/check_conflicts/`
- **By Course:** `GET /api/schedules/by_course/?course={course_id}`
- **By Classroom:** `GET /api/schedules/by_classroom/?classroom={classroom_id}`

#### Example Response
```json
{
  "id": 1,
  "course": 2,
  "classroom": 1,
  "day": "Monday",
  "time_slot": 3,
  "is_active": true,
  "notes": "",
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

---

## Notes
- All endpoints currently allow any user (no authentication required).
- Use filtering query params for more specific queries (e.g., by course, session, or date).
- Date/time fields are in ISO 8601 format (UTC).
- Mark attendance endpoint expects a valid user number and session ID.

---

## See Also
- [Users API Documentation](../users/API_DOCS.md)
- [RFID API Documentation](../rfid/API_DOCS.md)
- [Django REST Framework Docs](https://www.django-rest-framework.org/) 