import dispatch from "@/utils/dispatcher";
import type { 
  Course, 
  Classroom, 
  Schedule, 
  Attendance 
} from "@/utils/interfaces/collegeInterface";
import { API_ROUTES } from "@/utils/config/apiRoutes";

const { 
  COLLEGE_BASE_URL, 
  CLASSROOMS_ROUTE, 
  COURSES_ROUTE, 
  SCHEDULES_ROUTE, 
  ATTENDANCES_ROUTE 
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
  }
}; 