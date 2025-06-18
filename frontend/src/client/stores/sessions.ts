import { defineStore } from 'pinia'
import { getSessions, endSession, getAttendanceRecords, createSession, markAttendance } from '../api'
import type { AttendanceSession, AttendanceRecord } from '../api'

export const useSessionsStore = defineStore('sessions', {
  state: () => ({
    sessions: [] as AttendanceSession[],
    sessionAttendance: {} as Record<number, AttendanceRecord[]>,
    error: '',
    isLoading: false
  }),

  getters: {
    activeSessions: (state) => {
      return state.sessions.filter(session => session.is_active)
    },

    endedSessions: (state) => {
      return state.sessions.filter(session => !session.is_active)
    },

    getSessionAttendance: (state) => {
      return (sessionId: number) => state.sessionAttendance[sessionId] || []
    }
  },

  actions: {
    async fetchSessions() {
      this.isLoading = true
      this.error = ''
      try {
        const response = await getSessions()
        this.sessions = response.data.results
        // Fetch attendance for each session
        for (const session of this.sessions) {
          await this.fetchSessionAttendance(session.id)
        }
      } catch (e: any) {
        this.error = 'Failed to fetch sessions'
        console.error('Error fetching sessions:', e)
      } finally {
        this.isLoading = false
      }
    },

    async fetchSessionAttendance(sessionId: number) {
      try {
        const response = await getAttendanceRecords({ session: sessionId })
        this.sessionAttendance[sessionId] = response.data.results
      } catch (e: any) {
        console.error(`Failed to fetch attendance for session ${sessionId}:`, e)
      }
    },

    async startNewSession(data: { course: number; name?: string; end_time?: string }) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await createSession(data)
        this.sessions.unshift(response.data)
        return response.data
      } catch (e: any) {
        this.error = 'Failed to start session'
        console.error('Error starting session:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async endSession(sessionId: number) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await endSession(sessionId)
        const index = this.sessions.findIndex(s => s.id === sessionId)
        if (index !== -1) {
          this.sessions[index] = response.data
        }
        return response.data
      } catch (e: any) {
        this.error = 'Failed to end session'
        console.error('Error ending session:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async recordAttendance(data: {
      sessionId: number
      studentNumber: string
      uid: string
    }) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await markAttendance({ 
          session: data.sessionId,
          user_number: data.studentNumber,
          uid: data.uid
        })
        
        // Update the session attendance records
        await this.fetchSessionAttendance(data.sessionId)
        
        return response.data
      } catch (e: any) {
        this.error = 'Failed to record attendance'
        console.error('Error recording attendance:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async fetchSessionsByCourse(courseId: number) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await getSessions({ course: courseId })
        this.sessions = response.data.results
        // Fetch attendance for each session
        for (const session of this.sessions) {
          await this.fetchSessionAttendance(session.id)
        }
      } catch (e: any) {
        this.error = 'Failed to fetch sessions for course'
        console.error('Error fetching sessions for course:', e)
      } finally {
        this.isLoading = false
      }
    },

    async saveAttendanceRecords(sessionId: number, records: Array<{ student_number: string; uid: string; timestamp: string; message?: string }>) {
      this.isLoading = true
      this.error = ''
      try {
        for (const record of records) {
          await markAttendance({
            session: sessionId,
            user_number: record.student_number,
            uid: record.uid
          })
        }
        await this.fetchSessionAttendance(sessionId)
      } catch (e: any) {
        this.error = 'Failed to save attendance records'
        console.error('Error saving attendance records:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    }
  }
}) 