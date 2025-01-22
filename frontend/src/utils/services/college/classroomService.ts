import dispatch from '@/utils/dispatcher';
import type { Classroom } from '@/utils/interfaces/college/classroomInterface';
import type { Schedule } from '@/utils/interfaces/college/scheduleInterface';
import { API_ROUTES } from '@/utils/config/apiRoutes';

const { COLLEGE_BASE_URL, CLASSROOMS_ROUTE } = API_ROUTES;

export const ClassroomService = {
  /**
   * Fetches all classrooms or a specific classroom by ID
   * @param id - Optional classroom ID to fetch
   * @returns Promise resolving to a Classroom or array of Classrooms
   */
  async fetchClassrooms(id?: number): Promise<Classroom | Classroom[]> {
    try {
      if (id) {
        const response = await dispatch.get<Classroom>(
          `${COLLEGE_BASE_URL}/${CLASSROOMS_ROUTE}/${id}/`
        );
        return response.data;
      } else {
        const response = await dispatch.get<Classroom[]>(`${COLLEGE_BASE_URL}/${CLASSROOMS_ROUTE}/`);
        return response.data;
      }
    } catch (error) {
      console.error(`Error fetching ${id ? `classroom ${id}` : 'classrooms'}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new classroom
   * @param data - The classroom data to create
   * @returns Promise resolving to the created Classroom
   */
  async createClassroom(data: Omit<Classroom, 'id'>): Promise<Classroom> {
    try {
      const response = await dispatch.post<Classroom>(
        `${COLLEGE_BASE_URL}/${CLASSROOMS_ROUTE}/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error creating classroom:', error);
      throw error;
    }
  },

  /**
   * Updates an existing classroom
   * @param id - The ID of the classroom to update
   * @param data - The updated classroom data
   * @returns Promise resolving to the updated Classroom
   */
  async updateClassroom(id: number, data: Partial<Classroom>): Promise<Classroom> {
    try {
      const response = await dispatch.patch<Classroom>(
        `${COLLEGE_BASE_URL}/${CLASSROOMS_ROUTE}/${id}/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating classroom ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a classroom
   * @param id - The ID of the classroom to delete
   */
  async deleteClassroom(id: number): Promise<void> {
    try {
      await dispatch.delete(`${COLLEGE_BASE_URL}/${CLASSROOMS_ROUTE}/${id}/`);
    } catch (error) {
      console.error(`Error deleting classroom ${id}:`, error);
      throw error;
    }
  },

  /**
   * Fetches schedules for a specific classroom
   * @param classroomId - The ID of the classroom
   * @returns Promise resolving to array of Schedules
   */
  async fetchClassroomSchedules(classroomId: number): Promise<Schedule[]> {
    try {
      const response = await dispatch.get<Schedule[]>(
        `${COLLEGE_BASE_URL}/${CLASSROOMS_ROUTE}/${classroomId}/schedule/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching schedules for classroom ${classroomId}:`, error);
      throw error;
    }
  },

  /**
   * Checks classroom availability for a specific date
   * @param classroomId - The ID of the classroom
   * @param date - The date to check availability for
   * @returns Promise resolving to boolean indicating availability
   */
  async checkAvailability(classroomId: number, date: string): Promise<boolean> {
    try {
      const response = await dispatch.get<{ available: boolean }>(
        `${COLLEGE_BASE_URL}/${CLASSROOMS_ROUTE}/${classroomId}/availability/?date=${date}`
      );
      return response.data.available;
    } catch (error) {
      console.error(`Error checking availability for classroom ${classroomId}:`, error);
      throw error;
    }
  }
};
