import dispatch from "@/utils/dispatcher";
import { API_ROUTES } from "@/utils/config/apiRoutes";
import type { Teacher } from "@/utils/interfaces/users/studentInterface";

const { USERS_BASE_URL, TEACHERS_ROUTE } = API_ROUTES;

export const TeacherService = {
  /**
   * Creates a new teacher.
   * @param newTeacher - The teacher data to create
   * @returns A Promise resolving to the created Teacher
   */
  async addTeacher(newTeacher: Teacher): Promise<Teacher> {
    try {
      const response = await dispatch.post<Teacher>(`${USERS_BASE_URL}/${TEACHERS_ROUTE}/`, newTeacher);
      return response.data;
    } catch (error) {
      console.error("Error creating teacher:", error);
      throw error;
    }
  },

  /**
   * Fetches all teachers.
   * @returns A Promise resolving to an array of Teachers
   */
  async listTeachers(): Promise<Teacher[]> {
    try {
      const response = await dispatch.get<Teacher[]>(`${USERS_BASE_URL}/${TEACHERS_ROUTE}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching teachers:", error);
      throw error;
    }
  },

  /**
   * Fetches details of a specific teacher.
   * @param id - The teacher ID to fetch
   * @returns A Promise resolving to the Teacher object
   */
  async getTeacher(id: number): Promise<Teacher> {
    try {
      const response = await dispatch.get<Teacher>(
        `${USERS_BASE_URL}/${TEACHERS_ROUTE}/${id}/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching teacher ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing teacher.
   * @param id - The teacher ID to update
   * @param updateData - The data to update
   */
  async updateTeacher(
    id: number,
    updateData: Partial<Teacher>
  ): Promise<Teacher> {
    try {
      const response = await dispatch.patch<Teacher>(
        `${USERS_BASE_URL}/${TEACHERS_ROUTE}/${id}/`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating teacher ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a teacher.
   * @param id - The teacher ID to delete
   */
  async deleteTeacher(id: number): Promise<void> {
    try {
      await dispatch.delete(`${USERS_BASE_URL}/${TEACHERS_ROUTE}/${id}/`);
    } catch (error) {
      console.error(`Error deleting teacher ${id}:`, error);
      throw error;
    }
  }
};
