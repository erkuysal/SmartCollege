import { defineStore } from 'pinia'
import studentService from '@/utils/services/userService'
import { IStudent } from '@/utils/interfaces/userInterface'

interface StudentState {
  students: IStudent[]
  selectedStudent: IStudent | null
  isLoading: boolean
  error: string | null
}

export const useStudentStore = defineStore('student', {
  state: (): StudentState => ({
    students: [],
    selectedStudent: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    // Example getter: get a student by number
    getStudentByNumber: (state) => {
      return (studentNumber: string) =>
        state.students.find((s) => s.student_number === studentNumber)
    },
  },

  actions: {
    /**
     * Fetch all students from the API and store them in state.
     */
    async fetchAllStudents() {
      this.isLoading = true
      this.error = null
      try {
        const data = await studentService.getAllStudents()
        this.students = data
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch students.'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch a single student by student_number and store it in selectedStudent.
     */
    async fetchStudent(studentNumber: string) {
      this.isLoading = true
      this.error = null
      try {
        const data = await studentService.getStudentByNumber(studentNumber)
        this.selectedStudent = data
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch the student.'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Create a new student via the API, then add it to the state.
     */
    async createStudent(studentData: Omit<IStudent, 'id'>) {
      this.isLoading = true
      this.error = null
      try {
        const newStudent = await studentService.createStudent(studentData)
        this.students.push(newStudent)
        return newStudent
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : 'Failed to create student.'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update an existing student by student_number.
     */
    async updateStudent(studentNumber: string, updateData: Partial<IStudent>) {
      this.isLoading = true
      this.error = null
      try {
        const updatedStudent = await studentService.updateStudent(studentNumber, updateData)

        // Update the local state
        const index = this.students.findIndex(
          (student) => student.student_number === studentNumber
        )
        if (index !== -1) {
          this.students[index] = updatedStudent
        }

        // If selected student was the same, update that too
        if (this.selectedStudent?.student_number === studentNumber) {
          this.selectedStudent = updatedStudent
        }

        return updatedStudent
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : 'Failed to update student.'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Delete a student by student_number from the API and local state.
     */
    async deleteStudent(studentNumber: string) {
      this.isLoading = true
      this.error = null
      try {
        await studentService.deleteStudent(studentNumber)
        this.students = this.students.filter(
          (student) => student.student_number !== studentNumber
        )

        // If the deleted student was selected
        if (this.selectedStudent?.student_number === studentNumber) {
          this.selectedStudent = null
        }
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : 'Failed to delete student.'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Write RFID data for a specific student.
     */
    async writeRFID(studentNumber: string) {
      this.isLoading = true
      this.error = null
      try {
        const response = await studentService.writeRFID(studentNumber)
        return response
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : 'Failed to write RFID.'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Read RFID data from the card and validate it against the DB.
     */
    async readRFID() {
      this.isLoading = true
      this.error = null
      try {
        const response = await studentService.readRFID()
        return response
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : 'Failed to read RFID.'
      } finally {
        this.isLoading = false
      }
    },
  },
})
