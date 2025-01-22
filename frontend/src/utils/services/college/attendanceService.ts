import dispatch from '@/utils/dispatcher';
import type { Attendance, PopulatedAttendance } from '@/utils/interfaces/college/attendanceInterface';
import { API_ROUTES } from '@/utils/config/apiRoutes';

const { COLLEGE_BASE_URL, ATTENDANCES_ROUTE } = API_ROUTES;

export const AttendanceService = {
  /**
   * Fetches attendances with optional filtering parameters
   * @param params - Optional parameters for filtering attendances
   * @returns Promise resolving to an array of PopulatedAttendance objects
   */
  async fetchAttendances(params?: { 
    schedule?: number; 
    student?: number;
    date?: string;
  }): Promise<PopulatedAttendance[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.schedule) queryParams.append('schedule', params.schedule.toString());
      if (params?.student) queryParams.append('student', params.student.toString());
      if (params?.date) queryParams.append('date', params.date);

      const url = `${COLLEGE_BASE_URL}/${ATTENDANCES_ROUTE}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await dispatch.get<PopulatedAttendance[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendances:', error);
      throw error;
    }
  },

  /**
   * Creates a new attendance record
   * @param data - The attendance data to create
   * @returns Promise resolving to the created Attendance
   */
  async createAttendance(data: Partial<Attendance>): Promise<Attendance> {
    try {
      const response = await dispatch.post<Attendance>(
        `${COLLEGE_BASE_URL}/${ATTENDANCES_ROUTE}/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error creating attendance:', error);
      throw error;
    }
  },

  /**
   * Updates an existing attendance record
   * @param id - The ID of the attendance to update
   * @param data - The updated attendance data
   * @returns Promise resolving to the updated Attendance
   */
  async updateAttendance(id: number, data: Partial<Attendance>): Promise<Attendance> {
    try {
      const response = await dispatch.patch<Attendance>(
        `${COLLEGE_BASE_URL}/${ATTENDANCES_ROUTE}/${id}/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating attendance ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deletes an attendance record
   * @param id - The ID of the attendance to delete
   */
  async deleteAttendance(id: number): Promise<void> {
    try {
      await dispatch.delete(`${COLLEGE_BASE_URL}/${ATTENDANCES_ROUTE}/${id}/`);
    } catch (error) {
      console.error(`Error deleting attendance ${id}:`, error);
      throw error;
    }
  },

  /**
   * Creates multiple attendance records in bulk
   * @param data - Array of attendance data to create
   * @returns Promise resolving to array of created Attendances
   */
  async bulkCreateAttendance(data: Partial<Attendance>[]): Promise<Attendance[]> {
    try {
      const response = await dispatch.post<Attendance[]>(
        `${COLLEGE_BASE_URL}/${ATTENDANCES_ROUTE}/bulk/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error bulk creating attendances:', error);
      throw error;
    }
  }
};
