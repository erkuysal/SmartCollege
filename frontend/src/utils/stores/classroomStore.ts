// useCollegeStore.ts
import { defineStore } from 'pinia'

// Import your renamed service functions
import {
  // Classroom
  getClassrooms,
  getClassroom,
  createClassroom,
  updateClassroom,
  deleteClassroom,

  // Lesson
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,

  // Schedule
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,

  // Attendance
  getAttendances,
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from '@/utils/services/classroomService'

import type { Attendance, Classroom, Lesson, Schedule } from '@/utils/interfaces/classroomInterface'

/**
 * Type definition for our store state.
 */
interface CollegeState {
  classrooms: Classroom[]
  lessons: Lesson[]
  schedules: Schedule[]
  attendances: Attendance[]

  isLoading: boolean
  error: string | null
}

/**
 * The main Pinia store for Classroom, Lesson, Schedule, and Attendance.
 */
export const useCollegeStore = defineStore('collegeStore', {
  // STATE
  state: (): CollegeState => ({
    classrooms: [],
    lessons: [],
    schedules: [],
    attendances: [],

    isLoading: false,
    error: null,
  }),

  // GETTERS (Optional - for derived state)
  getters: {
    // Example: find a classroom by ID
    classroomById: (state) => {
      return (id: number) => state.classrooms.find((c) => c.id === id)
    },
  },

  // ACTIONS (CRUD calls + state updates)
  actions: {
    /**
     * ------------------------
     *   CLASSROOM ACTIONS
     * ------------------------
     */
    async fetchClassrooms() {
      try {
        this.isLoading = true
        this.error = null
        this.classrooms = await getClassrooms()
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },
    async fetchClassroom(id: number) {
      try {
        this.isLoading = true
        this.error = null
        return await getClassroom(id)
      } catch (err: any) {
        this.error = err.message
        return null
      } finally {
        this.isLoading = false
      }
    },
    async addClassroom(payload: Omit<Classroom, 'id'>) {
      try {
        this.isLoading = true
        this.error = null
        const newClassroom = await createClassroom(payload)
        this.classrooms.push(newClassroom)
        return newClassroom
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },
    async editClassroom(id: number, payload: Partial<Classroom>) {
      try {
        this.isLoading = true
        this.error = null
        const updated = await updateClassroom(id, payload)
        const idx = this.classrooms.findIndex((c) => c.id === id)
        if (idx !== -1) {
          this.classrooms[idx] = updated
        }
        return updated
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },
    async removeClassroom(id: number) {
      try {
        this.isLoading = true
        this.error = null
        await deleteClassroom(id)
        this.classrooms = this.classrooms.filter((c) => c.id !== id)
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },

    /**
     * ------------------------
     *   LESSON ACTIONS
     * ------------------------
     */
    async fetchLessons() {
      try {
        this.isLoading = true
        this.error = null
        this.lessons = await getLessons()
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },
    async fetchLesson(id: number) {
      try {
        this.isLoading = true
        this.error = null
        return await getLesson(id)
      } catch (err: any) {
        this.error = err.message
        return null
      } finally {
        this.isLoading = false
      }
    },
    async addLesson(payload: Omit<Lesson, 'id'>) {
      try {
        this.isLoading = true
        this.error = null
        const newLesson = await createLesson(payload)
        this.lessons.push(newLesson)
        return newLesson
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },
    async editLesson(id: number, payload: Partial<Lesson>) {
      try {
        this.isLoading = true
        this.error = null
        const updated = await updateLesson(id, payload)
        const idx = this.lessons.findIndex((l) => l.id === id)
        if (idx !== -1) {
          this.lessons[idx] = updated
        }
        return updated
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },
    async removeLesson(id: number) {
      try {
        this.isLoading = true
        this.error = null
        await deleteLesson(id)
        this.lessons = this.lessons.filter((l) => l.id !== id)
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },

    /**
     * ------------------------
     *   SCHEDULE ACTIONS
     * ------------------------
     */
    async fetchSchedules() {
      try {
        this.isLoading = true
        this.error = null
        this.schedules = await getSchedules()
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },
    async fetchSchedule(id: number) {
      try {
        this.isLoading = true
        this.error = null
        return await getSchedule(id)
      } catch (err: any) {
        this.error = err.message
        return null
      } finally {
        this.isLoading = false
      }
    },
    async addSchedule(payload: Omit<Schedule, 'id'>) {
      try {
        this.isLoading = true
        this.error = null
        const newSchedule = await createSchedule(payload)
        this.schedules.push(newSchedule)
        return newSchedule
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },
    async editSchedule(id: number, payload: Partial<Schedule>) {
      try {
        this.isLoading = true
        this.error = null
        const updated = await updateSchedule(id, payload)
        const idx = this.schedules.findIndex((s) => s.id === id)
        if (idx !== -1) {
          this.schedules[idx] = updated
        }
        return updated
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },
    async removeSchedule(id: number) {
      try {
        this.isLoading = true
        this.error = null
        await deleteSchedule(id)
        this.schedules = this.schedules.filter((s) => s.id !== id)
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },

    /**
     * ------------------------
     *   ATTENDANCE ACTIONS
     * ------------------------
     */
    async fetchAttendances() {
      try {
        this.isLoading = true
        this.error = null
        this.attendances = await getAttendances()
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },
    async fetchAttendance(id: number) {
      try {
        this.isLoading = true
        this.error = null
        return await getAttendance(id)
      } catch (err: any) {
        this.error = err.message
        return null
      } finally {
        this.isLoading = false
      }
    },
    async addAttendance(payload: Omit<Attendance, 'id'>) {
      try {
        this.isLoading = true
        this.error = null
        const newRecord = await createAttendance(payload)
        this.attendances.push(newRecord)
        return newRecord
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },
    async editAttendance(id: number, payload: Partial<Attendance>) {
      try {
        this.isLoading = true
        this.error = null
        const updated = await updateAttendance(id, payload)
        const idx = this.attendances.findIndex((a) => a.id === id)
        if (idx !== -1) {
          this.attendances[idx] = updated
        }
        return updated
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },
    async removeAttendance(id: number) {
      try {
        this.isLoading = true
        this.error = null
        await deleteAttendance(id)
        this.attendances = this.attendances.filter((a) => a.id !== id)
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },
  },
})
