import { BaseService, type QueryParams } from '../baseService';
import { API_ROUTES } from '../../config/apiRoutes';
import type { Course, CourseSchedule, CourseEnrollment, PopulatedCourse } from '../../interfaces/college/courseInterface';
import type { PaginatedResponse } from '../baseService';

export class CourseService extends BaseService {
  constructor() {
    super(API_ROUTES.COURSES_ROUTE);
  }

  /**
   * Get a list of courses with optional filtering
   */
  async getCourses(params?: QueryParams) {
    return this.getList<Course>('', params);
  }

  /**
   * Get a course by ID
   */
  async getCourseById(id: number) {
    return this.getById<Course>(id);
  }

  /**
   * Get a populated course by ID (with related data)
   */
  async getPopulatedCourse(id: number) {
    return this.get<PopulatedCourse>(`${id}/details`);
  }

  /**
   * Create a new course
   */
  async createCourse(courseData: Partial<Course>) {
    return this.create<Course>(courseData);
  }

  /**
   * Update a course
   */
  async updateCourse(id: number, courseData: Partial<Course>) {
    return this.patch<Course>(id, courseData);
  }

  /**
   * Delete a course
   */
  async deleteCourse(id: number) {
    return this.delete<Course>(id);
  }

  /**
   * Get schedule for a course
   */
  async getCourseSchedule(courseId: number) {
    const url = API_ROUTES.COURSE_SCHEDULE.replace('{id}', courseId.toString());
    return this.get<PaginatedResponse<CourseSchedule>>(url);
  }

  /**
   * Update schedule for a course
   */
  async updateCourseSchedule(courseId: number, scheduleData: Partial<CourseSchedule>[]) {
    const url = API_ROUTES.COURSE_SCHEDULE.replace('{id}', courseId.toString());
    return this.patch<CourseSchedule[]>(url, scheduleData);
  }

  /**
   * Get enrollments for a course
   */
  async getCourseEnrollments(courseId: number) {
    return this.get<PaginatedResponse<CourseEnrollment>>(`${courseId}/enrollments`);
  }

  /**
   * Add a student to a course
   */
  async enrollStudent(courseId: number, studentId: number) {
    return this.post<CourseEnrollment>(`${courseId}/enrollments`, { student_id: studentId });
  }

  /**
   * Remove a student from a course
   */
  async unenrollStudent(courseId: number, enrollmentId: number) {
    return this.delete<void>(`${courseId}/enrollments/${enrollmentId}`);
  }

  /**
   * Get courses by department
   */
  async getCoursesByDepartment(departmentId: number) {
    return this.getList<Course>('', { department: departmentId });
  }

  /**
   * Get courses by lecturer
   */
  async getCoursesByLecturer(lecturerId: number) {
    return this.getList<Course>('', { lecturer: lecturerId });
  }

  /**
   * Get active courses for the current semester
   */
  async getActiveCourses(semester?: string) {
    return this.getList<Course>('', { 
      is_active: true,
      semester: semester || 'current'
    });
  }
}

// Create and export a singleton instance
const courseService = new CourseService();
export default courseService;
