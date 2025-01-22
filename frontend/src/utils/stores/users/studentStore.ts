import { defineStore } from 'pinia'
import { StudentService } from '@/utils/services/users/studentService'
import type { Student } from '@/utils/interfaces/users/studentInterface'

export const useStudentStore = defineStore('student', {
  // ========== State ==========
  state: () => ({
    students: [] as Student[],
    currentStudent: null as Student | null,
    loading: false,
    error: null as string | null,

    // RFID-related state
    rfidMessage: null as string | null,
    rfidStatus: null as { valid?: boolean; error?: string } | null,
  }),

  // ========== Getters ==========
  getters: {
    /**
     * Returns the number of students in the store.
     */
    totalStudents: (state) => state.students.length,
    studentById: (state) => (id: number) =>
      state.students.find(student => student.student_number === id.toString()),
  },

  // ========== Actions ==========
  actions: {
    /**
     * Fetches all students from the server and updates the state.
     */
    async fetchStudents(studentNumber?: string) {
      this.loading = true
      this.error = null
      try {
        const response = await StudentService.getStudents(studentNumber)
        if (Array.isArray(response)) {
          this.students = response
        } else {
          this.currentStudent = response
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
      } finally {
        this.loading = false
      }
    },

    /**
     * Creates a new student on the server and adds it to the store's state.
     */
    async addStudent(newStudent: Omit<Student, 'student_number' | 'id'>) {
      this.loading = true
      this.error = null
      try {
        const created = await StudentService.addStudent(newStudent)
        this.students.push(created)
        return created
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Updates an existing student on the server, then updates it in the store's state.
     */
    async updateStudent(studentNumber: string, updateData: Partial<Student>) {
      this.loading = true
      this.error = null
      try {
        const updated = await StudentService.updateStudent(studentNumber, updateData)
        const index = this.students.findIndex(s => s.student_number === studentNumber)
        if (index !== -1) {
          this.students[index] = updated
        }
        if (this.currentStudent?.student_number === studentNumber) {
          this.currentStudent = updated
        }
        return updated
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Deletes an existing student on the server, then removes it from the store's state.
     */
    async deleteStudent(studentNumber: string) {
      this.loading = true
      this.error = null
      try {
        await StudentService.deleteStudent(studentNumber)
        this.students = this.students.filter(s => s.student_number !== studentNumber)
        if (this.currentStudent?.student_number === studentNumber) {
          this.currentStudent = null
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Writes RFID data for a specific student.
     */
    async writeRFID(studentNumber: string) {
      this.loading = true
      this.error = null
      this.rfidMessage = null
      try {
        const response = await StudentService.writeRFID(studentNumber)
        this.rfidMessage = response.message
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Reads RFID data from the card and validates it against the DB.
     */
    async readRFID() {
      this.loading = true
      this.error = null
      this.rfidMessage = null
      this.rfidStatus = null
      try {
        const response = await StudentService.readRFID()
        if (response.message) this.rfidMessage = response.message
        this.rfidStatus = { valid: response.valid, error: response.error }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    resetState() {
      this.students = []
      this.currentStudent = null
      this.loading = false
      this.error = null
      this.rfidMessage = null
      this.rfidStatus = null
    }
  },
})
