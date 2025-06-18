import { defineStore } from 'pinia'
import { getStudents, getStudent, createStudent, updateStudent, deleteStudent } from '../api'
import type { Student } from '../api'

export const useStudentsStore = defineStore('students', {
  state: () => ({
    students: [] as Student[],
    error: '',
    isLoading: false,
    totalCount: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false
  }),

  getters: {
    getStudentById: (state) => {
      return (id: number) => state.students.find((student: Student) => student.id === id)
    },

    getStudentByUserNumber: (state) => {
      return (userNumber: string) => state.students.find((student: Student) => student.user_number === userNumber)
    }
  },

  actions: {
    async fetchStudents(params?: { search?: string }) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await getStudents(params)
        this.students = response.data.results
        this.totalCount = response.data.count
        this.hasNextPage = !!response.data.next
        this.hasPreviousPage = !!response.data.previous
      } catch (e: any) {
        this.error = 'Failed to fetch students'
        console.error('Error fetching students:', e)
      } finally {
        this.isLoading = false
      }
    },

    async addStudent(data: Omit<Student, 'id'>) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await createStudent(data)
        this.students.push(response.data)
        return response.data
      } catch (e: any) {
        this.error = 'Failed to add student'
        console.error('Error adding student:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async updateStudentData(id: number, data: Partial<Student>) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await updateStudent(id, data)
        const index = this.students.findIndex((s: Student) => s.id === id)
        if (index !== -1) {
          this.students[index] = response.data
        }
        return response.data
      } catch (e: any) {
        this.error = 'Failed to update student'
        console.error('Error updating student:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async removeStudent(id: number) {
      this.isLoading = true
      this.error = ''
      try {
        await deleteStudent(id)
        this.students = this.students.filter((s: Student) => s.id !== id)
      } catch (e: any) {
        this.error = 'Failed to remove student'
        console.error('Error removing student:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async updateByUserNumber(userNumber: string, data: Partial<Student>) {
      this.isLoading = true
      this.error = ''
      try {
        const student = this.getStudentByUserNumber(userNumber)
        if (!student) {
          throw new Error(`No student found with user_number=${userNumber}`)
        }
        return await this.updateStudentData(student.id, data)
      } catch (e: any) {
        this.error = 'Failed to update student'
        console.error(e)
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async removeByUserNumber(userNumber: string) {
      this.isLoading = true
      this.error = ''
      try {
        const student = this.getStudentByUserNumber(userNumber)
        if (!student) {
          throw new Error(`No student found with user_number=${userNumber}`)
        }
        return await this.removeStudent(student.id)
      } catch (e: any) {
        this.error = 'Failed to remove student'
        console.error(e)
        throw e
      } finally {
        this.isLoading = false
      }
    }
  }
}) 