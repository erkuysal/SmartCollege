import { BaseService, type QueryParams } from '../baseService';
import { API_ROUTES } from '../../config/apiRoutes';
import type { 
  Attendance, 
  AttendanceSession,
  PopulatedAttendance,
  PopulatedAttendanceSession
} from '../../interfaces/college/attendanceInterface';
import type { PaginatedResponse } from '../baseService';

export class AttendanceService extends BaseService {
  constructor() {
    super(API_ROUTES.ATTENDANCE_ROUTE);
  }

  /**
   * Get a list of attendance sessions with optional filtering
   */
  async getAttendanceSessions(params?: QueryParams) {
    return this.getList<AttendanceSession>('/sessions', params);
  }

  /**
   * Get an attendance session by ID
   */
  async getAttendanceSessionById(id: number) {
    return this.getById<PopulatedAttendanceSession>(`/sessions/${id}`);
  }

  /**
   * Create a new attendance session
   */
  async createAttendanceSession(sessionData: Partial<AttendanceSession>) {
    return this.post<AttendanceSession>('/sessions', sessionData);
  }

  /**
   * Update an attendance session
   */
  async updateAttendanceSession(id: number, sessionData: Partial<AttendanceSession>) {
    return this.patch<AttendanceSession>(`/sessions/${id}`, sessionData);
  }

  /**
   * Close an attendance session
   */
  async closeAttendanceSession(id: number) {
    return this.post<AttendanceSession>(`/sessions/${id}/close`, {});
  }

  /**
   * Delete an attendance session
   */
  async deleteAttendanceSession(id: number) {
    return this.delete<void>(`/sessions/${id}`);
  }

  /**
   * Get individual attendance entries
   */
  async getAttendanceEntries(params?: QueryParams) {
    return this.get<PaginatedResponse<PopulatedAttendance>>('/entries', params);
  }

  /**
   * Create an individual attendance entry
   */
  async createAttendanceEntry(entryData: Partial<Attendance>) {
    return this.post<Attendance>('/entries', entryData);
  }

  /**
   * Update an individual attendance entry
   */
  async updateAttendanceEntry(id: number, entryData: Partial<Attendance>) {
    return this.patch<Attendance>(`/entries/${id}`, entryData);
  }

  /**
   * Delete an individual attendance entry
   */
  async deleteAttendanceEntry(id: number) {
    return this.delete<void>(`/entries/${id}`);
  }

  /**
   * Get daily attendance report
   */
  async getDailyAttendanceReport(date: string, courseId?: number) {
    return this.get<PaginatedResponse<PopulatedAttendanceSession>>(
      API_ROUTES.ATTENDANCE_REPORTS.DAILY,
      { date, course_id: courseId }
    );
  }

  /**
   * Get monthly attendance report
   */
  async getMonthlyAttendanceReport(year: number, month: number, courseId?: number) {
    return this.get<{
      total_days: number;
      attendance_days: number;
      attendance_percentage: number;
      sessions: PopulatedAttendanceSession[];
    }>(
      API_ROUTES.ATTENDANCE_REPORTS.MONTHLY,
      { year, month, course_id: courseId }
    );
  }

  /**
   * Get course attendance report
   */
  async getCourseAttendanceReport(courseId: number, startDate?: string, endDate?: string) {
    return this.get<{
      course_id: number;
      course_name: string;
      total_students: number;
      attendance_percentage: number;
      sessions: PopulatedAttendanceSession[];
    }>(
      API_ROUTES.ATTENDANCE_REPORTS.COURSE,
      { start_date: startDate, end_date: endDate }
    );
  }
}

// Create and export a singleton instance
const attendanceService = new AttendanceService();
export default attendanceService;
