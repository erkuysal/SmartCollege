import dispatch from '@/utils/dispatcher';
import type { Course, Enrollment, PopulatedCourse, PopulatedEnrollment } from '@/utils/interfaces/college/courseInterface';
import { API_ROUTES } from '@/utils/config/apiRoutes';

const { COLLEGE_BASE_URL, COURSES_ROUTE, ENROLLMENTS_ROUTE } = API_ROUTES;

export const CourseService = {
  /**
   * Fetches all courses or a specific course by ID
   * @param id - Optional course ID to fetch
   * @returns Promise resolving to Course[] or PopulatedCourse
   */
  async fetchCourses(id?: number): Promise<Course[] | PopulatedCourse> {
    try {
      if (id) {
        const response = await dispatch.get<PopulatedCourse>(
          `${COLLEGE_BASE_URL}/${COURSES_ROUTE}/${id}/`
        );
        return response.data;
      } else {
        const response = await dispatch.get<Course[]>(`${COLLEGE_BASE_URL}/${COURSES_ROUTE}/`);
        return response.data;
      }
    } catch (error) {
      console.error(`Error fetching ${id ? `course ${id}` : 'courses'}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new course
   * @param data - The course data to create
   * @returns Promise resolving to the created Course
   */
  async createCourse(data: Partial<Course>): Promise<Course> {
    try {
      const response = await dispatch.post<Course>(`${COLLEGE_BASE_URL}/${COURSES_ROUTE}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  /**
   * Updates an existing course
   * @param id - The ID of the course to update
   * @param data - The updated course data
   * @returns Promise resolving to the updated Course
   */
  async updateCourse(id: number, data: Partial<Course>): Promise<Course> {
    try {
      const response = await dispatch.patch<Course>(
        `${COLLEGE_BASE_URL}/${COURSES_ROUTE}/${id}/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating course ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a course
   * @param id - The ID of the course to delete
   */
  async deleteCourse(id: number): Promise<void> {
    try {
      await dispatch.delete(`${COLLEGE_BASE_URL}/${COURSES_ROUTE}/${id}/`);
    } catch (error) {
      console.error(`Error deleting course ${id}:`, error);
      throw error;
    }
  },

  /**
   * Fetches enrollments with optional filtering parameters
   * @param params - Optional parameters for filtering enrollments
   * @returns Promise resolving to array of PopulatedEnrollment objects
   */
  async fetchEnrollments(params?: { course?: number; student?: number }): Promise<PopulatedEnrollment[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.course) queryParams.append('course', params.course.toString());
      if (params?.student) queryParams.append('student', params.student.toString());

      const url = `${COLLEGE_BASE_URL}/${ENROLLMENTS_ROUTE}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await dispatch.get<PopulatedEnrollment[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }
  },

  /**
   * Creates a new enrollment
   * @param data - The enrollment data to create
   * @returns Promise resolving to the created Enrollment
   */
  async createEnrollment(data: { student: number; course: number }): Promise<Enrollment> {
    try {
      const response = await dispatch.post<Enrollment>(
        `${COLLEGE_BASE_URL}/${ENROLLMENTS_ROUTE}/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error creating enrollment:', error);
      throw error;
    }
  },

  /**
   * Deletes an enrollment
   * @param id - The ID of the enrollment to delete
   */
  async deleteEnrollment(id: number): Promise<void> {
    try {
      await dispatch.delete(`${COLLEGE_BASE_URL}/${ENROLLMENTS_ROUTE}/${id}/`);
    } catch (error) {
      console.error(`Error deleting enrollment ${id}:`, error);
      throw error;
    }
  }
};
