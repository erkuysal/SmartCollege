import { BaseService, type QueryParams } from '../baseService';
import { API_ROUTES } from '../../config/apiRoutes';
import type { Lecturer, CourseAssignment, LecturerSchedule, Attendance, OfficeHours } from '../../interfaces/users/lecturerInterface';
import type { PaginatedResponse } from '../baseService';
import type { RFIDCard } from '../../interfaces/utilities/RFIDInterface';

export class LecturerService extends BaseService {
  constructor() {
    super(API_ROUTES.LECTURERS_ROUTE);
  }

  /**
   * Get a list of lecturers with optional filtering
   */
  async getLecturers(params?: QueryParams) {
    return this.getList<Lecturer>('', params);
  }

  /**
   * Get a lecturer by ID
   */
  async getLecturerById(id: number) {
    return this.getById<Lecturer>(id);
  }

  /**
   * Create a new lecturer
   */
  async createLecturer(lecturerData: Partial<Lecturer>) {
    return this.create<Lecturer>(lecturerData);
  }

  /**
   * Update a lecturer
   */
  async updateLecturer(id: number, lecturerData: Partial<Lecturer>) {
    return this.patch<Lecturer>(id, lecturerData);
  }

  /**
   * Delete a lecturer
   */
  async deleteLecturer(id: number) {
    return this.delete<Lecturer>(id);
  }

  /**
   * Get assigned courses for a lecturer
   */
  async getAssignedCourses(lecturerId: number) {
    return this.get<PaginatedResponse<CourseAssignment>>(`${lecturerId}/courses`);
  }

  /**
   * Assign a course to a lecturer
   */
  async assignCourse(lecturerId: number, courseId: number) {
    return this.post<CourseAssignment>(API_ROUTES.LECTURER_COURSE_ASSIGN, { 
      lecturer_id: lecturerId, 
      course_id: courseId 
    });
  }

  /**
   * Remove a course assignment from a lecturer
   */
  async removeCourseAssignment(lecturerId: number, assignmentId: number) {
    return this.delete<void>(`${lecturerId}/courses/${assignmentId}`);
  }

  /**
   * Get schedule for a lecturer
   */
  async getLecturerSchedule(lecturerId: number) {
    return this.get<PaginatedResponse<LecturerSchedule>>(`${lecturerId}/schedule`);
  }

  /**
   * Submit attendance for a course
   */
  async submitAttendance(courseId: number, attendanceData: Partial<Attendance>) {
    return this.post<Attendance>(`${API_ROUTES.ATTENDANCE_ROUTE}`, {
      course_id: courseId,
      ...attendanceData
    });
  }

  /**
   * Update attendance status
   */
  async updateAttendance(attendanceId: number, status: string, notes?: string) {
    return this.post<Attendance>(`${API_ROUTES.ATTENDANCE_ROUTE}/${attendanceId}/update-status`, {
      status,
      notes
    });
  }

  /**
   * Get teaching load for a lecturer
   */
  async getTeachingLoad(lecturerId: number) {
    return this.get<{ teaching_load: number }>(`${lecturerId}/teaching-load`);
  }

  /**
   * Get office hours for a lecturer
   */
  async getOfficeHours(lecturerId: number) {
    return this.get<PaginatedResponse<OfficeHours>>(`${lecturerId}/office-hours`);
  }

  /**
   * Update office hours for a lecturer
   */
  async updateOfficeHours(lecturerId: number, officeHoursData: Partial<OfficeHours>[]) {
    return this.post<OfficeHours[]>(`/${lecturerId}/office-hours/update`, officeHoursData);
  }

  /**
   * Get RFID card for a lecturer
   */
  async getLecturerRFIDCard(lecturerId: number) {
    return this.get<RFIDCard>(`${lecturerId}/rfid`);
  }

  /**
   * Assign RFID card to a lecturer
   */
  async assignRFIDCard(lecturerId: number, cardId: string) {
    return this.post<RFIDCard>(`${lecturerId}/rfid`, { card_id: cardId });
  }

  /**
   * Remove RFID card from a lecturer
   */
  async removeRFIDCard(lecturerId: number) {
    return this.delete<void>(`${lecturerId}/rfid`);
  }
}

// Create and export a singleton instance
const lecturerService = new LecturerService();
export default lecturerService; 