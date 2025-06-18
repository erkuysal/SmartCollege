import { defineStore } from 'pinia'
import { getLecturers, getLecturer, createLecturer, updateLecturer, deleteLecturer } from '../api'
import type { Lecturer } from '../api'

interface LecturerFormData {
  first_name: string;
  last_name: string;
  title?: string;
}

export const useLecturersStore = defineStore('lecturers', {
  state: () => ({
    lecturers: [] as Lecturer[],
    error: '',
    isLoading: false,
    totalCount: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false
  }),

  getters: {
    getLecturerById: (state) => {
      return (id: number) => state.lecturers.find(lecturer => lecturer.id === id)
    },

    getLecturerByEmail: (state) => {
      return (email: string) => state.lecturers.find(lecturer => lecturer.email === email)
    },

    getLecturerByUserNumber: (state) => {
      return (userNumber: string) =>
        state.lecturers.find((l) => l.user_number === userNumber)
    }
  },

  actions: {
    async fetchLecturers() {
      this.isLoading = true
      this.error = ''
      try {
        const response = await getLecturers()
        this.lecturers = response.data.results
        this.totalCount = response.data.count
        this.hasNextPage = !!response.data.next
        this.hasPreviousPage = !!response.data.previous
      } catch (e: any) {
        this.error = 'Failed to fetch lecturers'
        console.error('Error fetching lecturers:', e)
      } finally {
        this.isLoading = false
      }
    },

    async addLecturer(data: LecturerFormData) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await createLecturer(data)
        this.lecturers.push(response.data)
        return response.data
      } catch (e: any) {
        this.error = 'Failed to add lecturer'
        console.error('Error adding lecturer:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async updateLecturerData(id: number, data: LecturerFormData) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await updateLecturer(id, data)
        const index = this.lecturers.findIndex(l => l.id === id)
        if (index !== -1) {
          this.lecturers[index] = response.data
        }
        return response.data
      } catch (e: any) {
        this.error = 'Failed to update lecturer'
        console.error('Error updating lecturer:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async removeLecturer(id: number) {
      this.isLoading = true
      this.error = ''
      try {
        await deleteLecturer(id)
        this.lecturers = this.lecturers.filter(l => l.id !== id)
      } catch (e: any) {
        this.error = 'Failed to remove lecturer'
        console.error('Error removing lecturer:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async updateByUserNumber(userNumber: string, data: LecturerFormData) {
      this.isLoading = true
      this.error = ''
      try {
        const lecturer = this.getLecturerByUserNumber(userNumber)
        if (!lecturer) {
          throw new Error(`No lecturer found with user_number=${userNumber}`)
        }
        return await this.updateLecturerData(lecturer.id, data)
      } catch (e: any) {
        this.error = 'Failed to update lecturer'
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
        const lecturer = this.getLecturerByUserNumber(userNumber)
        if (!lecturer) {
          throw new Error(`No lecturer found with user_number=${userNumber}`)
        }
        return await this.removeLecturer(lecturer.id)
      } catch (e: any) {
        this.error = 'Failed to remove lecturer'
        console.error(e)
        throw e
      } finally {
        this.isLoading = false
      }
    }
  }
}) 