// Base URLs and common path segments
const API_PREFIX = '/api';

// Module base paths
const USERS_BASE = `${API_PREFIX}/users`;
const ACADEMICS_BASE = `${API_PREFIX}/academics`;
const COLLEGE_BASE = `${API_PREFIX}/college`;
const UTILITIES_BASE = `${API_PREFIX}/utilities`;
const SECURITY_BASE = `${API_PREFIX}/security`;
const TRANSACTIONS_BASE = `${API_PREFIX}/transactions`;

// User module sub-paths
const USERS_AUTH_BASE = `${USERS_BASE}/base`;
const STAFF_BASE = `${USERS_BASE}/staff`;
const LECTURERS_BASE = `${USERS_BASE}/lecturers`;
const STUDENTS_BASE = `${USERS_BASE}/students`;

// Academics module sub-paths
const ATTENDANCE_BASE = `${ACADEMICS_BASE}/attendance`;
const ENROLLMENT_BASE = `${ACADEMICS_BASE}/enrollment`;
const BINDINGS_BASE = `${ACADEMICS_BASE}/bindings`;

// College module sub-paths
const CLASSROOMS_BASE = `${COLLEGE_BASE}/classrooms`;
const FACILITIES_BASE = `${COLLEGE_BASE}/facilities`;
const COURSES_BASE = `${COLLEGE_BASE}/courses`;
const DEPARTMENTS_BASE = `${COLLEGE_BASE}/departments`;
const SCHEDULES_BASE = `${COLLEGE_BASE}/schedules`;
const FACULTIES_BASE = `${COLLEGE_BASE}/faculties`;

// Utilities module sub-paths
const RFID_BASE = `${UTILITIES_BASE}/rfid_util`;

// Export the API routes
export const API_ROUTES = {
  // Base API prefix
  API_PREFIX,
  
  // 1. Users Module
  USERS_BASE_URL: USERS_BASE,
  USERS_AUTH: {
    LOGIN: `${USERS_AUTH_BASE}/login/`,
    LOGOUT: `${USERS_AUTH_BASE}/logout/`,
    REGISTER: `${USERS_AUTH_BASE}/register/`,
    PASSWORD_RESET: `${USERS_AUTH_BASE}/password/reset/`,
    PASSWORD_RESET_CONFIRM: `${USERS_AUTH_BASE}/password/reset/confirm/`,
    PROFILE: `${USERS_AUTH_BASE}/profile/`,
    TOKEN_REFRESH: `${USERS_AUTH_BASE}/token/refresh/`
  },
  
  // Staff endpoints
  STAFF_ROUTE: STAFF_BASE,
  STAFF_PERMISSIONS: `${STAFF_BASE}/permissions`,
  
  // Lecturer endpoints
  LECTURERS_ROUTE: LECTURERS_BASE,
  LECTURER_COURSES: `${LECTURERS_BASE}/courses`,
  LECTURER_COURSE_ASSIGN: `${LECTURERS_BASE}/courses/assign`,
  
  // Student endpoints
  STUDENTS_ROUTE: STUDENTS_BASE,
  STUDENT_COURSES: `${STUDENTS_BASE}/courses`,
  STUDENT_GRADES: `${STUDENTS_BASE}/grades`,
  STUDENT_ATTENDANCE: `${STUDENTS_BASE}/attendance`,
  
  // 2. Academics Module
  ACADEMICS_BASE_URL: ACADEMICS_BASE,
  
  // Attendance endpoints
  ATTENDANCE_ROUTE: ATTENDANCE_BASE,
  ATTENDANCE_REPORTS: {
    DAILY: `${ATTENDANCE_BASE}/reports/daily`,
    MONTHLY: `${ATTENDANCE_BASE}/reports/monthly`,
    COURSE: `${ATTENDANCE_BASE}/reports/course`
  },
  
  // Enrollment endpoints
  ENROLLMENT_ROUTE: ENROLLMENT_BASE,
  ACADEMIC_PERIODS: `${ENROLLMENT_BASE}/periods`,
  
  // Bindings endpoints
  BINDINGS_ROUTE: BINDINGS_BASE,
  
  // 3. College Module
  COLLEGE_BASE_URL: COLLEGE_BASE,
  
  // Classroom endpoints
  CLASSROOMS_ROUTE: CLASSROOMS_BASE,
  CLASSROOM_SCHEDULE: `${CLASSROOMS_BASE}/schedule`,
  
  // Schedule endpoints
  SCHEDULES_ROUTE: SCHEDULES_BASE,
  
  // Facilities endpoints
  FACILITIES_ROUTE: FACILITIES_BASE,
  FACILITIES_BOOKINGS: `${FACILITIES_BASE}/bookings`,
  
  // Course endpoints
  COURSES_ROUTE: COURSES_BASE,
  COURSE_SCHEDULE: `${COURSES_BASE}/{id}/schedule`,
  
  // Department endpoints
  DEPARTMENTS_ROUTE: DEPARTMENTS_BASE,
  DEPARTMENT_PROGRAMS: `${DEPARTMENTS_BASE}/{id}/programs`,
  
  // Faculty endpoints
  FACULTIES_ROUTE: FACULTIES_BASE,
  
  // 4. Utilities Module
  UTILITIES_BASE_URL: UTILITIES_BASE,
  
  // RFID utilities
  RFID_CARDS: `${RFID_BASE}/cards`,
  RFID_ACCESS: {
    VERIFY: `${RFID_BASE}/access/verify`,
    LOGS: `${RFID_BASE}/access/logs`
  },
  
  // 5. API Documentation
  API_SCHEMA: `${API_PREFIX}/schema`,
  SWAGGER_UI: `${API_PREFIX}/schema/swagger-ui`,
  REDOC: `${API_PREFIX}/schema/redoc`,
  
  // 6. Modules Under Construction
  SECURITY_BASE_URL: SECURITY_BASE,
  TRANSACTIONS_BASE_URL: TRANSACTIONS_BASE
} as const; 