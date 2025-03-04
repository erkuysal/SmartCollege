import { BaseService, type QueryParams } from '../baseService';
import { API_ROUTES } from '../../config/apiRoutes';
import type { Student, StudentAttendance, StudentGrade, EnrolledCourse } from '../../interfaces/users/studentInterface';
import type { PaginatedResponse } from '../baseService';
import type { RFIDCard } from '../../interfaces/utilities/RFIDInterface';

export class StudentService extends BaseService {
  constructor() {
    super(API_ROUTES.STUDENTS_ROUTE);
  }

  /**
   * Get a list of students with optional filtering
   */
  async getStudents(params?: QueryParams) {
    return this.getList<Student>('', params);
  }

  /**
   * Get a student by ID
   */
  async getStudentById(id: number) {
    return this.getById<Student>(id);
  }

  /**
   * Create a new student
   */
  async createStudent(studentData: Partial<Student>) {
    return this.create<Student>(studentData);
  }

  /**
   * Update a student
   */
  async updateStudent(id: number, studentData: Partial<Student>) {
    return this.patch<Student>(id, studentData);
  }

  /**
   * Delete a student
   */
  async deleteStudent(id: number) {
    return this.delete<Student>(id);
  }

  /**
   * Get courses for a student
   */
  async getStudentCourses(studentId: number) {
    return this.get<PaginatedResponse<EnrolledCourse>>(`${studentId}/courses`);
  }

  /**
   * Get grades for a student
   */
  async getStudentGrades(studentId: number) {
    return this.get<PaginatedResponse<StudentGrade>>(`${studentId}/grades`);
  }

  /**
   * Get attendance records for a student
   */
  async getStudentAttendance(studentId: number) {
    return this.get<PaginatedResponse<StudentAttendance>>(`${studentId}/attendance`);
  }

  /**
   * Enroll a student in a course
   */
  async enrollStudentInCourse(studentId: number, courseId: number) {
    return this.post<EnrolledCourse>(`${studentId}/courses`, { course_id: courseId });
  }

  /**
   * Drop a course for a student
   */
  async dropCourse(studentId: number, enrollmentId: number) {
    return this.delete<void>(`${studentId}/courses/${enrollmentId}`);
  }

  /**
   * Get RFID card for a student
   */
  async getStudentRFIDCard(studentId: number) {
    return this.get<RFIDCard>(`${studentId}/rfid`);
  }

  /**
   * Assign RFID card to a student
   */
  async assignRFIDCard(studentId: number, cardId: string) {
    return this.post<RFIDCard>(`${studentId}/rfid`, { card_id: cardId });
  }

  /**
   * Remove RFID card from a student
   */
  async removeRFIDCard(studentId: number) {
    return this.delete<void>(`${studentId}/rfid`);
  }
}

// Create and export a singleton instance
const studentService = new StudentService();
export default studentService;
