import { defineStore } from 'pinia'
import { getCourses, getCourse, createCourse, updateCourse, deleteCourse, enrollStudent, unenrollStudent, getEnrolledStudents } from '../api'
import type { Course, Student } from '../api'

interface CourseFormData {
  code: string;
  name: string;
  description: string;
  instructor: number;
  is_active?: boolean;
}

export const useCoursesStore = defineStore('courses', {
  state: () => ({
    courses: [] as Course[],
    enrolledStudents: {} as Record<number, Student[]>,
    error: '',
    isLoading: false,
    totalCount: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false
  }),

  getters: {
    getCourseById: (state) => {
      return (id: number) => state.courses.find(course => course.id === id)
    },

    getCoursesByInstructor: (state) => {
      return (instructorId: number) => state.courses.filter(course => course.instructor === instructorId)
    },

    getEnrolledStudentsForCourse: (state) => {
      return (courseId: number) => state.enrolledStudents[courseId] || []
    }
  },

  actions: {
    setError(errorMessage: string) {
      this.error = errorMessage;
    },

    async fetchCourses() {
      this.isLoading = true
      this.error = ''
      try {
        const response = await getCourses()
        this.courses = response.data.results
        this.totalCount = response.data.count
        this.hasNextPage = !!response.data.next
        this.hasPreviousPage = !!response.data.previous
      } catch (e: any) {
        this.error = 'Failed to fetch courses'
        console.error('Error fetching courses:', e)
      } finally {
        this.isLoading = false
      }
    },

    async addCourse(data: CourseFormData) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await createCourse(data)
        this.courses.push(response.data)
        return response.data
      } catch (e: any) {
        this.error = 'Failed to add course'
        console.error('Error adding course:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async updateCourseData(id: number, data: CourseFormData) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await updateCourse(id, data)
        const index = this.courses.findIndex(c => c.id === id)
        if (index !== -1) {
          this.courses[index] = response.data
        }
        return response.data
      } catch (e: any) {
        this.error = 'Failed to update course'
        console.error('Error updating course:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async removeCourse(id: number) {
      this.isLoading = true
      this.error = ''
      try {
        await deleteCourse(id)
        this.courses = this.courses.filter(c => c.id !== id)
      } catch (e: any) {
        this.error = 'Failed to remove course'
        console.error('Error removing course:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async enrollStudentInCourse(courseId: number, studentNumber: string) {
      this.isLoading = true
      this.error = ''
      try {
        await enrollStudent(courseId, studentNumber)
        await this.fetchEnrolledStudents(courseId)
      } catch (e: any) {
        this.error = 'Failed to enroll student'
        console.error('Error enrolling student:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async unenrollStudentFromCourse(courseId: number, studentNumber: string) {
      this.isLoading = true
      this.error = ''
      try {
        await unenrollStudent(courseId, studentNumber)
        await this.fetchEnrolledStudents(courseId)
      } catch (e: any) {
        this.error = 'Failed to unenroll student'
        console.error('Error unenrolling student:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async fetchEnrolledStudents(courseId: number) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await getEnrolledStudents(courseId)
        this.enrolledStudents[courseId] = response.data
        return response.data
      } catch (e: any) {
        this.error = 'Failed to fetch enrolled students'
        console.error('Error fetching enrolled students:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    }
  }
}) 