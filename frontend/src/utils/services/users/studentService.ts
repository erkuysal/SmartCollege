import dispatch from "@/utils/dispatcher";
import type { Student } from "@/utils/interfaces/users/studentInterface";
import { API_ROUTES } from "@/utils/config/apiRoutes";

const { USERS_BASE_URL, STUDENTS_ROUTE } = API_ROUTES;

export const StudentService = {
  /**
   * Fetches details of a specific student or all students.
   * @param studentNumber - The student number to fetch (optional)
   * @returns A Promise resolving to the Student object or an array of Students
   */
  async getStudents(studentNumber?: string): Promise<Student | Student[]> {
    try {
      if (studentNumber) {
        // Fetch a specific student
        const response = await dispatch.get<Student>(
          `${USERS_BASE_URL}/${STUDENTS_ROUTE}/${studentNumber}/`
        );
        return response.data;
      } else {
        // Fetch all students
        const response = await dispatch.get<Student[]>(`${USERS_BASE_URL}/${STUDENTS_ROUTE}/`);
        return response.data;
      }
    } catch (error) {
      console.error(`Error fetching ${studentNumber ? `student ${studentNumber}` : "students"}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new student.
   * @param newStudent - The student data to create
   * @returns A Promise resolving to the created Student
   */
  async addStudent(newStudent: Omit<Student, 'student_number' | 'id'>): Promise<Student> {
    try {
      const response = await dispatch.post<Student>(`${USERS_BASE_URL}/${STUDENTS_ROUTE}/`, newStudent);
      return response.data;
    } catch (error) {
      console.error("Error creating student:", error);
      throw error;
    }
  },

  /**
   * Update an existing student by student_number.
   * Depending on your Django config, you might need a PUT (full update) or PATCH (partial).
   */
  async updateStudent(
    studentNumber: string,
    updateData: Partial<Student>
  ): Promise<Student> {
    try {
      const response = await dispatch.patch<Student>(
        `${USERS_BASE_URL}/${STUDENTS_ROUTE}${studentNumber}/`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating student ${studentNumber}:`, error);
      throw error;
    }
  },

  /**
   * Delete a student by student_number.
   */
  async deleteStudent(studentNumber: string): Promise<void> {
    try {
      await dispatch.delete(`${USERS_BASE_URL}/${STUDENTS_ROUTE}${studentNumber}/`);
    } catch (error) {
      console.error(`Error deleting student ${studentNumber}:`, error);
      throw error;
    }
  },

  /**
   * Write RFID data to the card for a specific student.
   * POST /students/<student_number>/card/write/
   */
  async writeRFID(studentNumber: string): Promise<{ message: string }> {
    try {
      const response = await dispatch.post<{ message: string }>(
        `${USERS_BASE_URL}/${STUDENTS_ROUTE}${studentNumber}/card/write/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error writing RFID for student ${studentNumber}:`, error);
      throw error;
    }
  },

  /**
   * Read RFID data from the card and validate it against the DB.
   * GET /students/card/read/
   */
  async readRFID(): Promise<{
    message?: string;
    valid?: boolean;
    error?: string;
  }> {
    try {
      const response = await dispatch.get(`${USERS_BASE_URL}/${STUDENTS_ROUTE}card/read/`);
      return response.data;
    } catch (error) {
      console.error("Error reading RFID from card:", error);
      throw error;
    }
  },
};
