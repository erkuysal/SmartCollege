import dispatch from '@/utils/dispatcher'
import type {
  Classroom,
  Lesson,
  Schedule,
  Attendance
} from '@/utils/interfaces/classroomInterface'

const CLR_BASE_URL = "classes"

/**
 * ------------------
 *  CLASSROOM ENDPOINTS
 * ------------------
 *
 * Because your router uses:
 *    router.register(r'', ClassroomViewSet, basename='classroom')
 * The endpoints for Classroom are:
 *    GET /      -> list classrooms
 *    POST /     -> create a classroom
 *    GET /<id>/ -> retrieve single classroom
 *    PATCH/PUT /<id>/ -> update
 *    DELETE /<id>/ -> remove
 */

// GET all Classrooms
export async function getClassrooms(): Promise<Classroom[]> {
  const response = await dispatch.get(`${CLR_BASE_URL}/`)
  return response.data
}

// GET single Classroom
export async function getClassroom(id: number): Promise<Classroom> {
  const response= await dispatch.get(`${CLR_BASE_URL}/${id}/`)
  return response.data
}

// CREATE new Classroom
export async function createClassroom(data: Omit<Classroom, 'id'>): Promise<Classroom> {
  const response = await dispatch.post(`${CLR_BASE_URL}/`, data)
  return response.data
}

// UPDATE existing Classroom
export async function updateClassroom(id: number, data: Partial<Classroom>): Promise<Classroom> {
  const response = await dispatch.patch(`${CLR_BASE_URL}/${id}/`, data)
  return response.data
}

// DELETE a Classroom
export async function deleteClassroom(id: number): Promise<void> {
  await dispatch.delete(`${CLR_BASE_URL}/${id}/`)
}

/**
 * ------------------
 *  LESSON ENDPOINTS
 * ------------------
 *
 * The router uses:
 *    router.register(r'lecture', LessonViewSet, basename='lesson')
 *
 * So the endpoints are:
 *    GET /lecture/
 *    POST /lecture/
 *    GET /lecture/<id>/
 *    PATCH/PUT /lecture/<id>/
 *    DELETE /lecture/<id>/
 */

// GET all Lessons
export async function getLessons(): Promise<Lesson[]> {
  const response = await dispatch.get(`${CLR_BASE_URL}/lecture/`)
  return response.data
}

// GET single Lesson
export async function getLesson(id: number): Promise<Lesson> {
  const response = await dispatch.get(`${CLR_BASE_URL}/lecture/${id}/`)
  return response.data
}

// CREATE new Lesson
export async function createLesson(data: Omit<Lesson, 'id'>): Promise<Lesson> {
  const response = await dispatch.post(`${CLR_BASE_URL}/lecture/`, data)
  return response.data
}

// UPDATE a Lesson
export async function updateLesson(id: number, data: Partial<Lesson>): Promise<Lesson> {
  const response = await dispatch.patch(`${CLR_BASE_URL}/lecture/${id}/`, data)
  return response.data
}

// DELETE a Lesson
export async function deleteLesson(id: number): Promise<void> {
  await dispatch.delete(`${CLR_BASE_URL}/lecture/${id}/`)
}

/**
 * ------------------
 *  SCHEDULE ENDPOINTS
 * ------------------
 *
 * The router uses:
 *    router.register(r'schedule', ScheduleViewSet, basename='schedule')
 *
 * So the endpoints are:
 *    GET /schedule/
 *    POST /schedule/
 *    GET /schedule/<id>/
 *    PATCH/PUT /schedule/<id>/
 *    DELETE /schedule/<id>/
 */

// GET all Schedules
export async function getSchedules(): Promise<Schedule[]> {
  const response = await dispatch.get(`${CLR_BASE_URL}/schedule/`)
  return response.data
}

// GET single Schedule
export async function getSchedule(id: number): Promise<Schedule> {
  const response = await dispatch.get(`${CLR_BASE_URL}/schedule/${id}/`)
  return response.data
}

// CREATE new Schedule
export async function createSchedule(data: Omit<Schedule, 'id'>): Promise<Schedule> {
  const response = await dispatch.post(`${CLR_BASE_URL}/schedule/`, data)
  return response.data
}

// UPDATE a Schedule
export async function updateSchedule(id: number, data: Partial<Schedule>): Promise<Schedule> {
  const response = await dispatch.patch(`${CLR_BASE_URL}/schedule/${id}/`, data)
  return response.data
}

// DELETE a Schedule
export async function deleteSchedule(id: number): Promise<void> {
  await dispatch.delete(`${CLR_BASE_URL}/schedule/${id}/`)
}

/**
 * ------------------
 *  ATTENDANCE ENDPOINTS
 * ------------------
 *
 * The router uses:
 *    router.register(r'attendance', AttendanceViewSet, basename='attendance')
 *
 * So the endpoints are:
 *    GET /attendance/
 *    POST /attendance/
 *    GET /attendance/<id>/
 *    PATCH/PUT /attendance/<id>/
 *    DELETE /attendance/<id>/
 */

// GET all Attendance records
export async function getAttendances(): Promise<Attendance[]> {
  const response = await dispatch.get(`${CLR_BASE_URL}/attendance/`)
  return response.data
}

// GET single Attendance
export async function getAttendance(id: number): Promise<Attendance> {
  const response= await dispatch.get(`${CLR_BASE_URL}/attendance/${id}/`)
  return response.data
}

// CREATE new Attendance
export async function createAttendance(data: Omit<Attendance, 'id'>): Promise<Attendance> {
  const response = await dispatch.post(`${CLR_BASE_URL}/attendance/`, data)
  return response.data
}

// UPDATE an Attendance record
export async function updateAttendance(id: number, data: Partial<Attendance>): Promise<Attendance> {
  const response = await dispatch.patch(`${CLR_BASE_URL}/attendance/${id}/`, data)
  return response.data
}

// DELETE an Attendance record
export async function deleteAttendance(id: number): Promise<void> {
  await dispatch.delete(`${CLR_BASE_URL}/attendance/${id}/`)
}
