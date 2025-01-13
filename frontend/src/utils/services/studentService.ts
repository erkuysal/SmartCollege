import dispatch from "@/utils/dispatcher";
import type { Student } from "@/utils/interfaces/studentInterface";

const STUDENTS_BASE_URL = "students/";

export const StudentService = {
  /**
   * Creates a new student.
   * @param newStudent - The student data to create
   * @returns A Promise resolving to the created Student
   */
  async addStudent(newStudent: Student): Promise<Student> {
    try {
      const response = await dispatch.post<Student>(`${STUDENTS_BASE_URL}`, newStudent);
      return response.data;
    } catch (error) {
      console.error("Error creating student:", error);
      throw error;
    }
  },

  /**
   * Fetches all students.
   * @returns A Promise resolving to an array of Students
   */
  async listStudents(): Promise<Student[]> {
    try {
      const response = await dispatch.get<Student[]>(`${STUDENTS_BASE_URL}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  },

  /**
   * Fetches details of a specific student by student_number.
   * @param student_number - The student number to fetch
   * @returns A Promise resolving to the Student object
   */
  async getStudent(student_number: string): Promise<Student> {
    try {
      const response = await dispatch.get<Student>(
        `${STUDENTS_BASE_URL}${student_number}/`
      )
      return response.data
    } catch (error) {
      console.error(`Error fetching student ${student_number}:`, error)
      throw error
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
        `${STUDENTS_BASE_URL}${studentNumber}/`,
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
      await dispatch.delete(`${STUDENTS_BASE_URL}${studentNumber}/`);
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
        `${STUDENTS_BASE_URL}${studentNumber}/card/write/`
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
      const response = await dispatch.get(`${STUDENTS_BASE_URL}card/read/`);
      return response.data;
    } catch (error) {
      console.error("Error reading RFID from card:", error);
      throw error;
    }
  },
};
