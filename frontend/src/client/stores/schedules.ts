import { defineStore } from 'pinia'
import { getSchedules, getSchedule, createSchedule as apiCreateSchedule, updateSchedule as apiUpdateSchedule, deleteSchedule as apiDeleteSchedule, type Schedule } from '../api'

export const useSchedulesStore = defineStore('schedules', {
  state: () => ({
    schedules: [] as Schedule[],
    isLoading: false,
    error: '' as string | null,
  }),

  getters: {
    getScheduleById: (state) => (id: number) => state.schedules.find(s => s.id === id),
    getSchedulesByCourse: (state) => (courseId: number) => 
      state.schedules.filter(s => s.course === courseId),
    getSchedulesByClassroom: (state) => (classroomId: number) => 
      state.schedules.filter(s => s.classroom === classroomId)
  },

  actions: {
    async fetchSchedules() {
      this.isLoading = true
      this.error = ''
      try {
        const response = await getSchedules()
        this.schedules = response.data.results
        return this.schedules
      } catch (err) {
        this.error = 'Failed to fetch schedules'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async fetchSchedule(id: number) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await getSchedule(id)
        return response.data
      } catch (err) {
        this.error = 'Failed to fetch schedule'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async createSchedule(schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await apiCreateSchedule(schedule)
        this.schedules.push(response.data)
        return response.data
      } catch (err) {
        this.error = 'Failed to create schedule'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async updateSchedule(id: number, updates: Partial<Omit<Schedule, 'id' | 'created_at' | 'updated_at'>>) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await apiUpdateSchedule(id, updates)
        const index = this.schedules.findIndex(s => s.id === id)
        if (index !== -1) {
          this.schedules[index] = response.data
        }
        return response.data
      } catch (err) {
        this.error = 'Failed to update schedule'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async deleteSchedule(id: number) {
      this.isLoading = true
      this.error = ''
      try {
        await apiDeleteSchedule(id)
        const index = this.schedules.findIndex(s => s.id === id)
        if (index !== -1) {
          this.schedules.splice(index, 1)
        }
      } catch (err) {
        this.error = 'Failed to delete schedule'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async checkConflicts(params: {
      course?: number;
      classroom?: number;
      day?: string;
      time_slot?: number;
    }) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await getSchedules()
        const conflicts = response.data.results.filter(schedule => {
          if (params.course && schedule.course !== params.course) return false;
          if (params.classroom && schedule.classroom !== params.classroom) return false;
          if (params.day && schedule.day !== params.day) return false;
          if (params.time_slot && schedule.time_slot !== params.time_slot) return false;
          return true;
        });
        return conflicts;
      } catch (err) {
        this.error = 'Failed to check schedule conflicts'
        throw err
      } finally {
        this.isLoading = false
      }
    }
  }
}) 