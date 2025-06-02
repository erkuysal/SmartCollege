// Base URLs and common path segments
const API_PREFIX = '/api';

// Helper function to replace route parameters
const routeWithParams = (route: string, params: Record<string, string | number>) => {
  let result = route;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`{${key}}`, String(value));
  });
  return result;
};

// Module base paths
const USERS_BASE = `${API_PREFIX}/users`;
const ACADEMICS_BASE = `${API_PREFIX}/academics`;
const COLLEGE_BASE = `${API_PREFIX}/college`;
const UTILITIES_BASE = `${API_PREFIX}/utilities`;

// User module sub-paths
const USERS_AUTH_BASE = `${USERS_BASE}/base`;
const STAFF_BASE = `${USERS_BASE}/staff`;
const LECTURERS_BASE = `${USERS_BASE}/lecturers`;
const STUDENTS_BASE = `${USERS_BASE}/students`;

// Academics module sub-paths
const ATTENDANCE_BASE = `${ACADEMICS_BASE}/attendance`;
const ENROLLMENT_BASE = `${ACADEMICS_BASE}/enrollments`;
const BINDINGS_BASE = `${ACADEMICS_BASE}/bindings`;
const TERMS_BASE = `${ACADEMICS_BASE}/terms`;

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
  
  // Helper function for route parameters
  routeWithParams,
  
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
  
  // Lecturer endpoints
  LECTURERS_ROUTE: LECTURERS_BASE,
  
  // Student endpoints
  STUDENTS_ROUTE: STUDENTS_BASE,
  
  // 2. Academics Module
  ACADEMICS_BASE_URL: ACADEMICS_BASE,
  
  // Attendance endpoints
  ATTENDANCE_ROUTE: ATTENDANCE_BASE,
  ATTENDANCE_ACTIONS: {
    MARK: `${ATTENDANCE_BASE}/mark-attendance/`,
    START_SESSION: `${ATTENDANCE_BASE}/start-session/`,
    UPDATE_STATUS: (attendanceId: number) => 
      `${ATTENDANCE_BASE}/update-status/${attendanceId}/`
  },
  
  // Enrollment endpoints
  ENROLLMENT_ROUTE: ENROLLMENT_BASE,
  ENROLLMENT_ACTIONS: {
    REFRESH: `${ENROLLMENT_BASE}/refresh-enrollment/`
  },
  
  // Academic Terms
  TERMS_ROUTE: TERMS_BASE,
  
  // Bindings endpoints
  BINDINGS_ROUTE: BINDINGS_BASE,
  
  // 3. College Module
  COLLEGE_BASE_URL: COLLEGE_BASE,
  
  // Classroom endpoints
  CLASSROOMS_ROUTE: CLASSROOMS_BASE,
  
  // Schedule endpoints
  SCHEDULES_ROUTE: SCHEDULES_BASE,
  SCHEDULE_ACTIONS: {
    AUTO_ASSIGN: `${SCHEDULES_BASE}/auto_assign/`,
    AVAILABLE_SLOTS: `${SCHEDULES_BASE}/available_slots/`,
    COURSE_SCHEDULES: `${SCHEDULES_BASE}/course_schedules/`,
    GENERATE: `${SCHEDULES_BASE}/generate/`,
    STUDENT_SCHEDULE: `${SCHEDULES_BASE}/student_schedule/`
  },
  
  // Facilities endpoints
  FACILITIES_ROUTE: FACILITIES_BASE,
  
  // Course endpoints
  COURSES_ROUTE: COURSES_BASE,
  COURSE_ACTIONS: {
    ENROLLMENTS: (courseId: number) => 
      `${COURSES_BASE}/${courseId}/enrollments/`,
    UNENROLL_STUDENT: (courseId: number, enrollmentId: number) =>
      `${COURSES_BASE}/${courseId}/enrollments/${enrollmentId}/`,
    SCHEDULE: (courseId: number) => 
      `${COURSES_BASE}/${courseId}/schedule/`,
    SECTIONS: `${COURSES_BASE}/sections/`
  },
  
  // Department endpoints
  DEPARTMENTS_ROUTE: DEPARTMENTS_BASE,
  
  // Faculty endpoints
  FACULTIES_ROUTE: FACULTIES_BASE,
  
  // 4. Utilities Module
  UTILITIES_BASE_URL: UTILITIES_BASE,
  
  // RFID utilities
  RFID_ACTIONS: {
    ASSIGN: `${UTILITIES_BASE}/assign/`,
    READ: `${UTILITIES_BASE}/read/`,
    WRITE: `${UTILITIES_BASE}/write/`,
    STAFF_LIST: `${UTILITIES_BASE}/staff/`
  },
  RFID_CARDS: {
    BASE: `${UTILITIES_BASE}/cards/`,
    ASSIGNED: `${UTILITIES_BASE}/cards/assigned/`,
    PENDING: `${UTILITIES_BASE}/cards/pending/`,
    ASSIGN_TO_PERSONNEL: (cardId: number) => 
      `${UTILITIES_BASE}/cards/${cardId}/assign_to_personnel/`,
    UPDATE_STATUS: (cardId: number) => 
      `${UTILITIES_BASE}/cards/${cardId}/update_status/`
  },
  
  // 5. API Documentation
  API_SCHEMA: `${API_PREFIX}/schema`,
  SWAGGER_UI: `${API_PREFIX}/schema/swagger-ui`,
  REDOC: `${API_PREFIX}/schema/redoc`
} as const;