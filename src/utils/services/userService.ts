import { IStudent } from '@/utils/interfaces/userInterface'
import dispatch from "@/utils/bridge";

const STUDENTS_ENDPOINT = `/students`

class StudentService {
  /**
   * Fetch all students.
   */
  async getAllStudents(): Promise<IStudent[]> {
    const response = await dispatch.get<IStudent[]>(STUDENTS_ENDPOINT + '/')
    return response.data
  }

  /**
   * Get a single student by student_number (the lookup field in your ViewSet).
   * @param studentNumber The student's unique number.
   */
  async getStudentByNumber(studentNumber: string): Promise<IStudent> {
    const response = await dispatch.get<IStudent>(`${STUDENTS_ENDPOINT}/${studentNumber}/`)
    return response.data
  }

  /**
   * Create a new student.
   * In Django, the ID is typically assigned automatically, so you don't send it.
   */
  async createStudent(studentData: Omit<IStudent, 'id'>): Promise<IStudent> {
    const response = await dispatch.post<IStudent>(STUDENTS_ENDPOINT + '/', studentData)
    return response.data
  }

  /**
   * Update an existing student by student_number.
   * Depending on your Django config, you might need a PUT (full update) or PATCH (partial).
   */
  async updateStudent(studentNumber: string, updateData: Partial<IStudent>): Promise<IStudent> {
    const response = await dispatch.patch<IStudent>(
      `${STUDENTS_ENDPOINT}/${studentNumber}/`,
      updateData
    )
    return response.data
  }

  /**
   * Delete a student by student_number.
   */
  async deleteStudent(studentNumber: string): Promise<void> {
    await dispatch.delete(`${STUDENTS_ENDPOINT}/${studentNumber}/`)
  }

  /**
   * Write RFID data to the card for a specific student.
   * POST /students/<student_number>/card/write/
   */
  async writeRFID(studentNumber: string): Promise<{ message: string }> {
    const response = await dispatch.post<{ message: string }>(
      `${STUDENTS_ENDPOINT}/${studentNumber}/card/write/`
    )
    return response.data
  }

  /**
   * Read RFID data from the card and validate it against the DB.
   * GET /students/card/read/
   */
  async readRFID(): Promise<{
    message?: string
    valid?: boolean
    error?: string
  }> {
    const response = await dispatch.get(`${STUDENTS_ENDPOINT}/card/read/`)
    return response.data
  }
}

export default new StudentService()
