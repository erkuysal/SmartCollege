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
    async listAllStudents() {
      this.loading = true
      this.error = null
      try {
        this.students = await StudentService.listStudents()
        console.log('List All Students')
        console.log(this.students.length)
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetches details of a specific student by student_number
     * and updates the currentStudent state.
     */
    async fetchStudentByNumber(student_number: string) {
      this.loading = true
      this.error = null
      this.currentStudent = null
      try {
        this.currentStudent = await StudentService.getStudent(student_number)
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
      } finally {
        this.loading = false
      }
    },

    /**
     * Creates a new student on the server and adds it to the store's state.
     */
    async addStudent(newStudent: Student) {
      this.loading = true
      this.error = null
      try {
        const created = await StudentService.addStudent(newStudent)
        this.students.push(created)
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
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
        const index = this.students.findIndex((s) => s.student_number === studentNumber)
        if (index !== -1) {
          this.students[index] = updated
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
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
        this.students = this.students.filter((s) => s.student_number !== studentNumber)
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
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
      } finally {
        this.loading = false
      }
    },

    /**
     * Reads RFID data from the card and validates it against the DB.
     */
    async readRFID(): Promise<string | undefined> {
      this.loading = true
      this.error = null
      this.rfidMessage = null
      this.rfidStatus = null
      try {
        const data = await StudentService.readRFID()
        console.log('RFID data read: ', data)

        // Example if backend returns something like:
        // { student_number: "S20250003", message: "RFID read successfully", valid: true }
        const studentNumber = data.student_number

        if (data.message) this.rfidMessage = data.message
        this.rfidStatus = { valid: data.valid, error: data.error }

        return studentNumber
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
      } finally {
        this.loading = false
      }
    },

    async fetchStudents() {
      this.loading = true;
      try {
        const response = await StudentService.getStudents();
        this.students = response;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    resetState() {
      this.students = [];
      this.loading = false;
      this.error = null;
    }
  },
})
