import dispatch from '@/utils/apiClient';
import type { Schedule, PopulatedSchedule } from '@/utils/interfaces/college/scheduleInterface';
import { API_ROUTES } from '@/utils/config/apiRoutes';

const { COLLEGE_BASE_URL, SCHEDULES_ROUTE } = API_ROUTES;

export const ScheduleService = {
  /**
   * Fetches schedules with optional filtering parameters
   * @param params - Optional parameters for filtering schedules
   * @returns Promise resolving to array of PopulatedSchedule objects
   */
  async fetchSchedules(params?: { classroom?: number; course?: number }): Promise<PopulatedSchedule[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.classroom) queryParams.append('classroom', params.classroom.toString());
      if (params?.course) queryParams.append('course', params.course.toString());

      const queryString = queryParams.toString();
      console.log('COLLEGE_BASE_URL:', COLLEGE_BASE_URL);
      console.log('SCHEDULES_ROUTE:', SCHEDULES_ROUTE);
      
      const url = `${COLLEGE_BASE_URL}${SCHEDULES_ROUTE}${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching schedules from URL:', url);
      const response = await dispatch.get<PopulatedSchedule[]>(url);
      console.log('Schedule response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  },

  /**
   * Fetches a specific schedule by ID
   * @param id - The ID of the schedule to fetch
   * @returns Promise resolving to PopulatedSchedule
   */
  async fetchSchedule(id: number): Promise<PopulatedSchedule> {
    try {
      const response = await dispatch.get<PopulatedSchedule>(
        `${COLLEGE_BASE_URL}${SCHEDULES_ROUTE}/${id}/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching schedule ${id}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new schedule
   * @param data - The schedule data to create
   * @returns Promise resolving to the created Schedule
   */
  async createSchedule(data: Partial<Schedule>): Promise<Schedule> {
    try {
      const response = await dispatch.post<Schedule>(
        `${COLLEGE_BASE_URL}${SCHEDULES_ROUTE}/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },

  /**
   * Updates an existing schedule
   * @param id - The ID of the schedule to update
   * @param data - The updated schedule data
   * @returns Promise resolving to the updated Schedule
   */
  async updateSchedule(id: number, data: Partial<Schedule>): Promise<Schedule> {
    try {
      const response = await dispatch.patch<Schedule>(
        `${COLLEGE_BASE_URL}${SCHEDULES_ROUTE}/${id}/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating schedule ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a schedule
   * @param id - The ID of the schedule to delete
   */
  async deleteSchedule(id: number): Promise<void> {
    try {
      await dispatch.delete(`${COLLEGE_BASE_URL}${SCHEDULES_ROUTE}/${id}/`);
    } catch (error) {
      console.error(`Error deleting schedule ${id}:`, error);
      throw error;
    }
  }
};
