import dispatch from "@/utils/dispatcher";
import type { 
  Course, 
  Classroom, 
  Schedule, 
  Attendance,
  Enrollment 
} from "@/utils/interfaces/collegeInterface";
import { API_ROUTES } from "@/utils/config/apiRoutes";

const { 
  COLLEGE_BASE_URL, 
  CLASSROOMS_ROUTE, 
  COURSES_ROUTE, 
  SCHEDULES_ROUTE, 
  ATTENDANCES_ROUTE,
  ENROLLMENTS_ROUTE 
} = API_ROUTES;

export const CollegeService = {
  /**
   * ------------------
   *  CLASSROOM ENDPOINTS
   * ------------------
   */
  async getClassrooms(): Promise<Classroom[]> {
    try {
      const response = await dispatch.get<Classroom[]>(`${COLLEGE_BASE_URL}/${CLASSROOMS_ROUTE}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching classrooms:", error);
      throw error;
    }
  },

  async getClassroom(id: number): Promise<Classroom> {
    try {
      const response = await dispatch.get<Classroom>(`${COLLEGE_BASE_URL}/${CLASSROOMS_ROUTE}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching classroom ${id}:`, error);
      throw error;
    }
  },

  async createClassroom(data: Omit<Classroom, 'id'>): Promise<Classroom> {
    try {
      const response = await dispatch.post<Classroom>(`${COLLEGE_BASE_URL}/${CLASSROOMS_ROUTE}/`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating classroom:", error);
      throw error;
    }
  },

  async updateClassroom(id: number, data: Partial<Classroom>): Promise<Classroom> {
    try {
      const response = await dispatch.patch<Classroom>(`${COLLEGE_BASE_URL}/${CLASSROOMS_ROUTE}/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating classroom ${id}:`, error);
      throw error;
    }
  },

  async deleteClassroom(id: number): Promise<void> {
    try {
      await dispatch.delete(`${COLLEGE_BASE_URL}/${CLASSROOMS_ROUTE}/${id}/`);
    } catch (error) {
      console.error(`Error deleting classroom ${id}:`, error);
      throw error;
    }
  },

  /**
   * ------------------
   *  COURSE ENDPOINTS
   * ------------------
   */
  async getCourses(): Promise<Course[]> {
    try {
      const response = await dispatch.get<Course[]>(`${COLLEGE_BASE_URL}/${COURSES_ROUTE}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  async getCourse(id: number): Promise<Course> {
    try {
      const response = await dispatch.get<Course>(`${COLLEGE_BASE_URL}/${COURSES_ROUTE}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error);
      throw error;
    }
  },

  async createCourse(data: Omit<Course, 'id'>): Promise<Course> {
    try {
      const response = await dispatch.post<Course>(`${COLLEGE_BASE_URL}/${COURSES_ROUTE}/`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  },

  async updateCourse(id: number, data: Partial<Course>): Promise<Course> {
    try {
      const response = await dispatch.patch<Course>(`${COLLEGE_BASE_URL}/${COURSES_ROUTE}/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating course ${id}:`, error);
      throw error;
    }
  },

  async deleteCourse(id: number): Promise<void> {
    try {
      await dispatch.delete(`${COLLEGE_BASE_URL}/${COURSES_ROUTE}/${id}/`);
    } catch (error) {
      console.error(`Error deleting course ${id}:`, error);
      throw error;
    }
  },

  /**
   * ------------------
   *  SCHEDULE ENDPOINTS
   * ------------------
   */
  async getSchedules(): Promise<Schedule[]> {
    try {
      const response = await dispatch.get<Schedule[]>(`${COLLEGE_BASE_URL}/${SCHEDULES_ROUTE}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching schedules:", error);
      throw error;
    }
  },

  async getSchedule(id: number): Promise<Schedule> {
    try {
      const response = await dispatch.get<Schedule>(`${COLLEGE_BASE_URL}/${SCHEDULES_ROUTE}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching schedule ${id}:`, error);
      throw error;
    }
  },

  async createSchedule(data: Omit<Schedule, 'id'>): Promise<Schedule> {
    try {
      const response = await dispatch.post<Schedule>(`${COLLEGE_BASE_URL}/${SCHEDULES_ROUTE}/`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating schedule:", error);
      throw error;
    }
  },

  async updateSchedule(id: number, data: Partial<Schedule>): Promise<Schedule> {
    try {
      const response = await dispatch.patch<Schedule>(`${COLLEGE_BASE_URL}/${SCHEDULES_ROUTE}/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating schedule ${id}:`, error);
      throw error;
    }
  },

  async deleteSchedule(id: number): Promise<void> {
    try {
      await dispatch.delete(`${COLLEGE_BASE_URL}/schedules/${id}/`);
    } catch (error) {
      console.error(`Error deleting schedule ${id}:`, error);
      throw error;
    }
  },

  /**
   * ------------------
   *  ATTENDANCE ENDPOINTS
   * ------------------
   */
  async getAttendances(): Promise<Attendance[]> {
    try {
      const response = await dispatch.get<Attendance[]>(`${COLLEGE_BASE_URL}/${ATTENDANCES_ROUTE}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching attendances:", error);
      throw error;
    }
  },

  async getAttendance(id: number): Promise<Attendance> {
    try {
      const response = await dispatch.get<Attendance>(`${COLLEGE_BASE_URL}/${ATTENDANCES_ROUTE}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance ${id}:`, error);
      throw error;
    }
  },

  async createAttendance(data: Omit<Attendance, 'id'>): Promise<Attendance> {
    try {
      const response = await dispatch.post<Attendance>(`${COLLEGE_BASE_URL}/${ATTENDANCES_ROUTE}/`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating attendance:", error);
      throw error;
    }
  },

  async updateAttendance(id: number, data: Partial<Attendance>): Promise<Attendance> {
    try {
      const response = await dispatch.patch<Attendance>(`${COLLEGE_BASE_URL}/${ATTENDANCES_ROUTE}/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating attendance ${id}:`, error);
      throw error;
    }
  },

  async deleteAttendance(id: number): Promise<void> {
    try {
      await dispatch.delete(`${COLLEGE_BASE_URL}/attendances/${id}/`);
    } catch (error) {
      console.error(`Error deleting attendance ${id}:`, error);
      throw error;
    }
  },

  // Get schedules for a specific classroom
  async getClassroomSchedule(classroomId: number): Promise<Schedule[]> {
    try {
      const response = await dispatch.get<Schedule[]>(
        `${COLLEGE_BASE_URL}/${CLASSROOMS_ROUTE}/${classroomId}/schedule/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching schedule for classroom ${classroomId}:`, error);
      throw error;
    }
  },

  // Add a new schedule
  async addSchedule(scheduleData: Omit<Schedule, 'id'>): Promise<Schedule> {
    try {
      const response = await dispatch.post<Schedule>(
        `${COLLEGE_BASE_URL}/${SCHEDULES_ROUTE}/`,
        scheduleData
      );
      return response.data;
    } catch (error) {
      console.error('Error adding schedule:', error);
      throw error;
    }
  },

  // Update a schedule
  async updateSchedule(
    scheduleId: number,
    scheduleData: Partial<Schedule>
  ): Promise<Schedule> {
    try {
      const response = await dispatch.patch<Schedule>(
        `${COLLEGE_BASE_URL}/${SCHEDULES_ROUTE}/${scheduleId}/`,
        scheduleData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating schedule ${scheduleId}:`, error);
      throw error;
    }
  },

  // Delete a schedule
  async deleteSchedule(scheduleId: number): Promise<void> {
    try {
      await dispatch.delete(
        `${COLLEGE_BASE_URL}/${SCHEDULES_ROUTE}/${scheduleId}/`
      );
    } catch (error) {
      console.error(`Error deleting schedule ${scheduleId}:`, error);
      throw error;
    }
  },

  /**
   * ------------------
   *  ENROLLMENT ENDPOINTS
   * ------------------
   */
  async getEnrollments(): Promise<Enrollment[]> {
    try {
      const response = await dispatch.get<Enrollment[]>(`${COLLEGE_BASE_URL}/${ENROLLMENTS_ROUTE}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      throw error;
    }
  },

  async getEnrollment(id: number): Promise<Enrollment> {
    try {
      const response = await dispatch.get<Enrollment>(`${COLLEGE_BASE_URL}/${ENROLLMENTS_ROUTE}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching enrollment ${id}:`, error);
      throw error;
    }
  },

  async createEnrollment(data: { student: number; course: number }): Promise<Enrollment> {
    try {
      const response = await dispatch.post<Enrollment>(`${COLLEGE_BASE_URL}/${ENROLLMENTS_ROUTE}/`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating enrollment:", error);
      throw error;
    }
  },

  async updateEnrollment(id: number, data: Partial<Enrollment>): Promise<Enrollment> {
    try {
      const response = await dispatch.patch<Enrollment>(`${COLLEGE_BASE_URL}/${ENROLLMENTS_ROUTE}/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating enrollment ${id}:`, error);
      throw error;
    }
  },

  async deleteEnrollment(id: number): Promise<void> {
    try {
      await dispatch.delete(`${COLLEGE_BASE_URL}/${ENROLLMENTS_ROUTE}/${id}/`);
    } catch (error) {
      console.error(`Error deleting enrollment ${id}:`, error);
      throw error;
    }
  },

  // Helper methods for specific enrollment scenarios
  async getStudentEnrollments(studentId: number): Promise<Enrollment[]> {
    try {
      const response = await dispatch.get<Enrollment[]>(
        `${COLLEGE_BASE_URL}/${ENROLLMENTS_ROUTE}/?student=${studentId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching enrollments for student ${studentId}:`, error);
      throw error;
    }
  },

  async getCourseEnrollments(courseId: number): Promise<Enrollment[]> {
    try {
      const response = await dispatch.get<Enrollment[]>(
        `${COLLEGE_BASE_URL}/${ENROLLMENTS_ROUTE}/?course=${courseId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching enrollments for course ${courseId}:`, error);
      throw error;
    }
  },
}; 