# SmartCollege API Endpoints Documentation

## Base URL Structure
All API endpoints are prefixed with `/api/`

## Core Modules

### 1. Users Module (`/api/users/`)
#### Base User Endpoints (`/api/users/base/`)
- Authentication:
  - `POST /login/` - User login
  - `POST /logout/` - User logout
  - `POST /register/` - User registration
  - `POST /password/reset/` - Request password reset
  - `POST /password/reset/confirm/` - Confirm password reset
- User Profile:
  - `GET /profile/` - Get user profile
  - `PATCH /profile/` - Update user profile
  - `GET /profile/{id}/` - Get specific user profile
  - `DELETE /profile/{id}/` - Delete user (admin only)

#### Staff Endpoints (`/api/users/staff/`)
- Staff Management:
  - `GET /` - List all staff
  - `POST /` - Create new staff
  - `GET /{id}/` - Get staff details
  - `PATCH /{id}/` - Update staff information
  - `DELETE /{id}/` - Remove staff
- Administrative Functions:
  - `GET /permissions/` - List staff permissions
  - `PATCH /permissions/{id}/` - Update staff permissions

#### Lecturer Endpoints (`/api/users/lecturers/`)
- Profile Management:
  - `GET /` - List all lecturers
  - `POST /` - Add new lecturer
  - `GET /{id}/` - Get lecturer details
  - `PATCH /{id}/` - Update lecturer information
  - `DELETE /{id}/` - Remove lecturer
- Course Assignments:
  - `GET /courses/` - List assigned courses
  - `POST /courses/assign/` - Assign course to lecturer
  - `DELETE /courses/{id}/` - Remove course assignment

#### Student Endpoints (`/api/users/students/`)
- Profile Management:
  - `GET /` - List all students
  - `POST /` - Add new student
  - `GET /{id}/` - Get student details
  - `PATCH /{id}/` - Update student information
  - `DELETE /{id}/` - Remove student
- Academic Records:
  - `GET /courses/` - List enrolled courses
  - `GET /grades/` - View grades
  - `GET /attendance/` - View attendance

### 2. Academics Module (`/api/academics/`)
#### Attendance (`/api/academics/attendance/`)
- Attendance Records:
  - `GET /` - List all attendance records
  - `POST /` - Create attendance record
  - `GET /{id}/` - Get specific attendance
  - `PATCH /{id}/` - Update attendance
  - `DELETE /{id}/` - Delete attendance record
- Reports:
  - `GET /reports/daily/` - Daily attendance report
  - `GET /reports/monthly/` - Monthly attendance report
  - `GET /reports/course/{course_id}/` - Course-wise attendance

#### Enrollment (`/api/academics/enrollment/`)
- Course Enrollment:
  - `GET /` - List all enrollments
  - `POST /` - Create new enrollment
  - `GET /{id}/` - Get enrollment details
  - `PATCH /{id}/` - Update enrollment
  - `DELETE /{id}/` - Cancel enrollment
- Academic Periods:
  - `GET /periods/` - List academic periods
  - `POST /periods/` - Create academic period
  - `PATCH /periods/{id}/` - Update period
  - `DELETE /periods/{id}/` - Delete period

#### Bindings (`/api/academics/bindings/`)
- Course Bindings:
  - `GET /` - List all bindings
  - `POST /` - Create new binding
  - `GET /{id}/` - Get binding details
  - `PATCH /{id}/` - Update binding
  - `DELETE /{id}/` - Remove binding

### 3. College Module (`/api/college/`)
#### Classrooms (`/api/college/classrooms/`)
- Room Management:
  - `GET /` - List all classrooms
  - `POST /` - Add new classroom
  - `GET /{id}/` - Get classroom details
  - `PATCH /{id}/` - Update classroom
  - `DELETE /{id}/` - Remove classroom
- Scheduling:
  - `GET /schedule/` - View room schedule
  - `POST /schedule/` - Book room
  - `DELETE /schedule/{id}/` - Cancel booking

#### Facilities (`/api/college/facilities/`)
- Facility Management:
  - `GET /` - List all facilities
  - `POST /` - Add new facility
  - `GET /{id}/` - Get facility details
  - `PATCH /{id}/` - Update facility
  - `DELETE /{id}/` - Remove facility
- Bookings:
  - `GET /bookings/` - List all bookings
  - `POST /bookings/` - Create booking
  - `PATCH /bookings/{id}/` - Update booking
  - `DELETE /bookings/{id}/` - Cancel booking

#### Courses (`/api/college/courses/`)
- Course Management:
  - `GET /` - List all courses
  - `POST /` - Create new course
  - `GET /{id}/` - Get course details
  - `PATCH /{id}/` - Update course
  - `DELETE /{id}/` - Remove course
- Course Schedule:
  - `GET /{id}/schedule/` - Get course schedule
  - `PATCH /{id}/schedule/` - Update schedule

#### Departments (`/api/college/departments/`)
- Department Management:
  - `GET /` - List all departments
  - `POST /` - Create new department
  - `GET /{id}/` - Get department details
  - `PATCH /{id}/` - Update department
  - `DELETE /{id}/` - Remove department
- Programs:
  - `GET /{id}/programs/` - List department programs
  - `POST /{id}/programs/` - Add program
  - `PATCH /{id}/programs/{program_id}/` - Update program
  - `DELETE /{id}/programs/{program_id}/` - Remove program

### 4. Utilities Module (`/api/utilities/`)
#### RFID Utilities (`/api/utilities/rfid_util/`)
- Card Management:
  - `GET /cards/` - List all RFID cards
  - `POST /cards/` - Register new card
  - `GET /cards/{id}/` - Get card details
  - `PATCH /cards/{id}/` - Update card
  - `DELETE /cards/{id}/` - Deactivate card
- Access Control:
  - `POST /access/verify/` - Verify access
  - `GET /access/logs/` - Access logs
  - `GET /access/logs/{id}/` - Specific log entry

### 5. API Documentation
- `/api/schema/` - OpenAPI Schema
- `/api/schema/swagger-ui/` - Swagger UI Documentation
- `/api/schema/redoc/` - ReDoc Documentation

### 6. Admin Interface
- `/admin/` - Administrative interface

## Modules Under Construction
The following modules are planned but not yet implemented:
- Security Module (`/api/security/`)
- Transactions Module (`/api/transactions/`)

---

## Integration Notes for Frontend

1. **Authentication**:
   - All API endpoints except public ones require JWT authentication
   - Include the JWT token in the Authorization header: `Authorization: Bearer <token>`
   - Token refresh endpoint: `POST /api/users/base/token/refresh/`

2. **Response Format**:
   - All responses follow standard REST conventions
   - Successful responses include appropriate HTTP status codes:
     - GET: 200 OK
     - POST: 201 Created
     - PATCH: 200 OK
     - DELETE: 204 No Content
   - Error responses include error messages and appropriate status codes:
     - 400: Bad Request
     - 401: Unauthorized
     - 403: Forbidden
     - 404: Not Found
     - 500: Internal Server Error

3. **API Documentation Access**:
   - Use Swagger UI (`/api/schema/swagger-ui/`) for interactive API testing
   - Use ReDoc (`/api/schema/redoc/`) for detailed API documentation
   - Download OpenAPI schema from `/api/schema/` for code generation

4. **Rate Limiting**:
   - APIs may have rate limiting applied
   - Check response headers for rate limit information:
     - `X-RateLimit-Limit`
     - `X-RateLimit-Remaining`
     - `X-RateLimit-Reset`

5. **Data Formats**:
   - Request/Response bodies use JSON format
   - Dates follow ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
   - File uploads should use multipart/form-data
   - IDs are typically integers
   - Pagination format:
     ```json
     {
       "count": total_items,
       "next": next_page_url,
       "previous": previous_page_url,
       "results": []
     }
     ```

---

## Detailed Endpoint Structure

Let me fetch the specific endpoints for each module... 