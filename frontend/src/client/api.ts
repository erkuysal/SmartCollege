import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: 'http://localhost:8000', // Change if your backend runs elsewhere
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interfaces
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Handle common errors here
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data)
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message)
    }
    return Promise.reject(error)
  }
)

export interface BaseUser {
  id: number;
  user_number: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'student' | 'lecturer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student extends BaseUser {
  student_number: string;
}

export interface Lecturer extends BaseUser {
  lecturer_number: string;
  title: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  description: string;
  instructor: number;
  instructor_name: string;
  semester: string;
  is_active: boolean;
  enrolled_students_count: number;
  created_at: string;
  updated_at: string;
}

export interface RFIDTag {
  id: number;
  tag_id: string;
  user: Student;
  user_id?: number; // For write operations
}

export interface AttendanceSession {
  id: number;
  name: string;
  course: number;  // Course ID
  start_time: string;
  end_time: string | null;
  is_active: boolean;
}

export interface AttendanceRecord {
  id: number;
  student: {
    id: number;
    user_number: string;
    first_name: string;
    last_name: string;
    user_type: string;
  };
  session: number;
  timestamp: string;
}

// --- Students ---
export const getStudents = (params?: { search?: string }) => 
  api.get<{ count: number; next: string | null; previous: string | null; results: Student[] }>('/api/users/students/', { params });
export const getStudent = (id: number) => api.get<Student>(`/api/users/students/${id}/`);
export const createStudent = (data: { first_name: string; last_name: string }) => 
  api.post<Student>('/api/users/students/', data);
export const updateStudent = (id: number, data: Partial<Student>) => 
  api.patch<Student>(`/api/users/students/${id}/`, data);
export const deleteStudent = (id: number) => 
  api.delete(`/api/users/students/${id}/`);

// --- Lecturers ---
export const getLecturers = () => api.get<{ count: number; next: string | null; previous: string | null; results: Lecturer[] }>('/api/users/lecturers/');
export const getLecturer = (id: number) => api.get<Lecturer>(`/api/users/lecturers/${id}/`);
export const createLecturer = (data: { first_name: string; last_name: string; title?: string }) => 
  api.post<Lecturer>('/api/users/lecturers/', data);
export const updateLecturer = (id: number, data: Partial<Lecturer>) => 
  api.patch<Lecturer>(`/api/users/lecturers/${id}/`, data);
export const deleteLecturer = (id: number) => 
  api.delete(`/api/users/lecturers/${id}/`);

// --- Courses ---
export const getCourses = () => api.get<PaginatedResponse<Course>>('/api/courses/');
export const getCourse = (id: number) => api.get<Course>(`/api/courses/${id}/`);
export const createCourse = (data: {
  code: string;
  name: string;
  description: string;
  instructor: number;
  is_active?: boolean;
}) => api.post<Course>('/api/courses/', data);
export const updateCourse = (id: number, data: Partial<Course>) => 
  api.patch<Course>(`/api/courses/${id}/`, data);
export const deleteCourse = (id: number) => 
  api.delete(`/api/courses/${id}/`);

// Course-specific actions
export const enrollStudent = (courseId: number, userNumber: string) =>
  api.post<{ status: string }>(`/api/courses/${courseId}/enroll_student/`, { user_number: userNumber });
export const unenrollStudent = (courseId: number, userNumber: string) =>
  api.post<{ status: string }>(`/api/courses/${courseId}/unenroll_student/`, { user_number: userNumber });
export const getEnrolledStudents = (courseId: number) =>
  api.get<Student[]>(`/api/courses/${courseId}/enrolled_students/`);

// --- Sessions ---
export const getSessions = (params?: { course?: number }) =>
  api.get<{ count: number; next: string | null; previous: string | null; results: AttendanceSession[] }>('/api/sessions/', { params });
export const getSession = (id: number) => api.get<AttendanceSession>(`/api/sessions/${id}/`);
export const createSession = (data: {
  name?: string;
  course: number;
  end_time?: string;
}) => api.post<AttendanceSession>('/api/sessions/', data);
export const updateSession = (id: number, data: Partial<AttendanceSession>) =>
  api.patch<AttendanceSession>(`/api/sessions/${id}/`, data);
export const deleteSession = (id: number) =>
  api.delete(`/api/sessions/${id}/`);
export const endSession = (id: number) =>
  api.post<AttendanceSession>(`/api/sessions/${id}/end_session/`);

// --- Attendance Records ---
export const getAttendanceRecords = (params?: { timestamp_date?: string; session?: number }) => 
  api.get<{ count: number; next: string | null; previous: string | null; results: AttendanceRecord[] }>('/api/records/', { params });
export const getAttendanceRecord = (id: number) => 
  api.get<AttendanceRecord>(`/api/records/${id}/`);
export const createAttendanceRecord = (data: { student_number: string; session_id: number }) =>
  api.post<AttendanceRecord>('/api/records/', data);
export const updateAttendanceRecord = (id: number, data: Partial<AttendanceRecord>) =>
  api.patch<AttendanceRecord>(`/api/records/${id}/`, data);
export const deleteAttendanceRecord = (id: number) =>
  api.delete(`/api/records/${id}/`);

// --- RFID Operations ---
export const getRFIDTags = () => api.get<RFIDTag[]>('/api/rfid/tags/');
export const getRFIDTag = (id: number) => api.get<RFIDTag>(`/api/rfid/tags/${id}/`);
export const createRFIDTag = (data: { tag_id: string; user_id: number }) => 
  api.post<RFIDTag>('/api/rfid/tags/', data);
export const updateRFIDTag = (id: number, data: Partial<RFIDTag>) => 
  api.patch<RFIDTag>(`/api/rfid/tags/${id}/`, data);
export const deleteRFIDTag = (id: number) => 
  api.delete(`/api/rfid/tags/${id}/`);

export const scanRFID = () => 
  api.get<{
    status: string;
    user_number: string;
    uid: string;
    message?: string;
  }>('/api/rfid/read_card/');

export const writeCard = (data: { user_number: string }) =>
  api.post<{ status: string; detail: string }>('/api/rfid/write_card/', data);

export const markAttendance = (data: { session: number; user_number: string; uid: string }) => 
  api.post<{
    status: string;
    user_number: string;
    uid: string;
    session_id: number;
    timestamp: string;
    message: string;
  }>('/api/mark-attendance/', data);


// --- Classrooms ---
export interface Classroom {
  id: number;
  name: string;
}

export const getClassrooms = () =>
  api.get<{ count: number; next: string | null; previous: string | null; results: Classroom[] }>('/api/classrooms/');

export const getClassroom = (id: number) =>
  api.get<Classroom>(`/api/classrooms/${id}/`);

export const createClassroom = (data: { name: string }) =>
  api.post<Classroom>('/api/classrooms/', data);

export const updateClassroom = (id: number, data: Partial<Classroom>) =>
  api.patch<Classroom>(`/api/classrooms/${id}/`, data);

export const deleteClassroom = (id: number) =>
  api.delete(`/api/classrooms/${id}/`);

// --- Schedules ---
export interface Schedule {
  id: number;
  course: number;
  classroom: number;
  day: string;
  time_slot: number;
  is_active: boolean;
  notes: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export const getSchedules = () =>
  api.get<{ count: number; next: string | null; previous: string | null; results: Schedule[] }>('/api/schedules/');

export const getSchedule = (id: number) =>
  api.get<Schedule>(`/api/schedules/${id}/`);

export const createSchedule = (data: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>) =>
  api.post<Schedule>('/api/schedules/', data);

export const updateSchedule = (id: number, data: Partial<Omit<Schedule, 'id' | 'created_at' | 'updated_at'>>) =>
  api.patch<Schedule>(`/api/schedules/${id}/`, data);

export const deleteSchedule = (id: number) =>
  api.delete(`/api/schedules/${id}/`);

// --- Wallet Module ---
export interface Wallet {
  id: number;
  student: number;
  student_name: string;
  student_number: string;
  balance: number;
}

export interface ActivityType {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MultiplierRule {
  id: number;
  name: string;
  description: string;
  multiplier: number;
  condition_type: 'streak' | 'special_event' | 'time_of_day' | 'location' | 'custom';
  condition_value: any; // JSON field
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  student: number;
  transaction_type: 'earn' | 'spend' | 'adjust' | 'expire';
  activity_type: ActivityType | null;
  points: number;
  multiplier_applied: number;
  multiplier_rule: number | null;
  reference_id: string;
  description: string;
  timestamp: string;
  created_at: string;
}

// Wallet endpoints
export const getWallets = () => 
  api.get<{ count: number; next: string | null; previous: string | null; results: Wallet[] }>('/api/wallet/wallets/');

export const getWallet = (id: number) => 
  api.get<Wallet>(`/api/wallet/wallets/${id}/`);

export const createWallet = (data: { student: number }) => 
  api.post<Wallet>('/api/wallet/wallets/', data);

export const updateWallet = (id: number, data: Partial<Wallet>) => 
  api.patch<Wallet>(`/api/wallet/wallets/${id}/`, data);

export const deleteWallet = (id: number) => 
  api.delete(`/api/wallet/wallets/${id}/`);

// Activity Type endpoints
export const getActivityTypes = () => 
  api.get<{ count: number; next: string | null; previous: string | null; results: ActivityType[] }>('/api/wallet/activity-types/');

export const getActivityType = (id: number) => 
  api.get<ActivityType>(`/api/wallet/activity-types/${id}/`);

export const createActivityType = (data: { 
  name: string; 
  description: string; 
  is_active?: boolean 
}) => api.post<ActivityType>('/api/wallet/activity-types/', data);

export const updateActivityType = (id: number, data: Partial<ActivityType>) => 
  api.patch<ActivityType>(`/api/wallet/activity-types/${id}/`, data);

export const deleteActivityType = (id: number) => 
  api.delete(`/api/wallet/activity-types/${id}/`);

// Multiplier Rule endpoints
export const getMultiplierRules = () => 
  api.get<{ count: number; next: string | null; previous: string | null; results: MultiplierRule[] }>('/api/wallet/multiplier-rules/');

export const getMultiplierRule = (id: number) => 
  api.get<MultiplierRule>(`/api/wallet/multiplier-rules/${id}/`);

export const createMultiplierRule = (data: { 
  name: string;
  description: string;
  multiplier: number;
  condition_type: 'streak' | 'special_event' | 'time_of_day' | 'location' | 'custom';
  condition_value: any;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}) => api.post<MultiplierRule>('/api/wallet/multiplier-rules/', data);

export const updateMultiplierRule = (id: number, data: Partial<MultiplierRule>) => 
  api.patch<MultiplierRule>(`/api/wallet/multiplier-rules/${id}/`, data);

export const deleteMultiplierRule = (id: number) => 
  api.delete(`/api/wallet/multiplier-rules/${id}/`);

// Transaction endpoints
export const getTransactions = (params?: { student?: number; activity_type?: number }) => 
  api.get<{ count: number; next: string | null; previous: string | null; results: Transaction[] }>('/api/wallet/transactions/', { params });

export const getTransaction = (id: number) => 
  api.get<Transaction>(`/api/wallet/transactions/${id}/`);

export const createTransaction = (data: { 
  student: number;
  transaction_type: 'earn' | 'spend' | 'adjust' | 'expire';
  activity_type?: number;
  points: number;
  multiplier_applied?: number;
  multiplier_rule?: number;
  reference_id?: string;
  description?: string;
}) => api.post<Transaction>('/api/wallet/transactions/', data);

export const updateTransaction = (id: number, data: Partial<Transaction>) => 
  api.patch<Transaction>(`/api/wallet/transactions/${id}/`, data);

export const deleteTransaction = (id: number) => 
  api.delete(`/api/wallet/transactions/${id}/`);

// --- Academic Module ---
export interface AcademicYear {
  id: number;
  year: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  duration: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface Semester {
  id: number;
  academic_year: number;
  semester_type: 'fall' | 'spring' | 'summer';
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  is_active: boolean;
  full_name: string;
  registration_period: string;
  is_registration_open: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseOffering {
  id: number;
  course: number;
  semester: number;
  instructor: number;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseRegistration {
  id: number;
  student: number;
  course_offering: number;
  status: 'pending' | 'approved' | 'rejected';
  registration_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ClassSchedule {
  id: number;
  course_offering: number;
  classroom: number;
  day: string;
  time_slot: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  notes?: string;
  recurrence_rule?: string;
  created_at: string;
  updated_at: string;
}

// Academic Year endpoints
export const getAcademicYears = () => 
  api.get<{ count: number; next: string | null; previous: string | null; results: AcademicYear[] }>('/api/academic/academic-years/');

export const getAcademicYear = (id: number) => 
  api.get<AcademicYear>(`/api/academic/academic-years/${id}/`);

export const createAcademicYear = (data: { 
  year: string; 
  start_date: string; 
  end_date: string; 
  is_active?: boolean 
}) => api.post<AcademicYear>('/api/academic/academic-years/', data);

export const updateAcademicYear = (id: number, data: Partial<AcademicYear>) => 
  api.patch<AcademicYear>(`/api/academic/academic-years/${id}/`, data);

export const deleteAcademicYear = (id: number) => 
  api.delete(`/api/academic/academic-years/${id}/`);

// Semester endpoints
export const getSemesters = () => 
  api.get<{ count: number; next: string | null; previous: string | null; results: Semester[] }>('/api/academic/semesters/');

export const getSemester = (id: number) => 
  api.get<Semester>(`/api/academic/semesters/${id}/`);

export const createSemester = (data: { 
  academic_year: number; 
  semester_type: 'fall' | 'spring' | 'summer'; 
  start_date: string; 
  end_date: string; 
  registration_start: string; 
  registration_end: string; 
  is_active?: boolean 
}) => api.post<Semester>('/api/academic/semesters/', data);

export const updateSemester = (id: number, data: Partial<Semester>) => 
  api.patch<Semester>(`/api/academic/semesters/${id}/`, data);

export const deleteSemester = (id: number) => 
  api.delete(`/api/academic/semesters/${id}/`);

// Course Offerings API Functions
export const getCourseOfferings = (params?: { course?: number; semester?: number }) => 
  api.get<PaginatedResponse<CourseOffering>>('/api/academic/offerings/', { params });
export const getCourseOffering = (id: number) => api.get<CourseOffering>(`/api/academic/offerings/${id}/`);
export const createCourseOffering = (data: {
  course: number;
  semester: number;
  instructor: number;
  capacity: number;
  is_active?: boolean;
}) => api.post<CourseOffering>('/api/academic/offerings/', data);
export const updateCourseOffering = (id: number, data: Partial<CourseOffering>) => 
  api.put<CourseOffering>(`/api/academic/offerings/${id}/`, data);
export const deleteCourseOffering = (id: number) => api.delete(`/api/academic/offerings/${id}/`);

// Course Registration API Functions
export const getCourseRegistrations = (params?: { student?: number; course_offering?: number }) => 
  api.get<PaginatedResponse<CourseRegistration>>('/course-registrations/', { params });
export const getCourseRegistration = (id: number) => api.get<CourseRegistration>(`/course-registrations/${id}/`);
export const createCourseRegistration = (data: {
  student: number;
  course_offering: number;
  notes?: string;
}) => api.post<CourseRegistration>('/course-registrations/', data);
export const updateCourseRegistration = (id: number, data: Partial<CourseRegistration>) => 
  api.put<CourseRegistration>(`/course-registrations/${id}/`, data);
export const deleteCourseRegistration = (id: number) => api.delete(`/course-registrations/${id}/`);
export const approveRegistration = (id: number, data?: { notes?: string }) => 
  api.post<CourseRegistration>(`/course-registrations/${id}/approve/`, data);
export const rejectRegistration = (id: number, data: { reason: string }) => 
  api.post<CourseRegistration>(`/course-registrations/${id}/reject/`, data);

// Class Schedule API Functions
export const getClassSchedules = (params?: { course_offering?: number }) => 
  api.get<PaginatedResponse<ClassSchedule>>('/class-schedules/', { params });
export const getClassSchedule = (id: number) => api.get<ClassSchedule>(`/class-schedules/${id}/`);
export const createClassSchedule = (data: {
  course_offering: number;
  classroom: number;
  day: string;
  time_slot: number;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  notes?: string;
  recurrence_rule?: string;
}) => api.post<ClassSchedule>('/class-schedules/', data);
export const updateClassSchedule = (id: number, data: Partial<ClassSchedule>) => 
  api.put<ClassSchedule>(`/class-schedules/${id}/`, data);
export const deleteClassSchedule = (id: number) => api.delete(`/class-schedules/${id}/`);
export const generateSessions = (id: number, data: { start_date: string; end_date: string }) => 
  api.post<ClassSchedule>(`/class-schedules/${id}/generate-sessions/`, data);

export default api; 