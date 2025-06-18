import { defineStore } from 'pinia'
import { getClassrooms, getClassroom, createClassroom as apiCreateClassroom, updateClassroom as apiUpdateClassroom, deleteClassroom as apiDeleteClassroom, type Classroom } from '../api'

export const useClassroomsStore = defineStore('classrooms', {
  state: () => ({
    classrooms: [] as Classroom[],
    isLoading: false,
    error: '' as string | null,
  }),

  getters: {
    getClassroomById: (state) => (id: number) => state.classrooms.find(c => c.id === id),
  },

  actions: {
    async fetchClassrooms() {
      this.isLoading = true
      this.error = ''
      try {
        const response = await getClassrooms()
        this.classrooms = response.data.results
        return this.classrooms
      } catch (err) {
        this.error = 'Failed to fetch classrooms'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async fetchClassroom(id: number) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await getClassroom(id)
        return response.data
      } catch (err) {
        this.error = 'Failed to fetch classroom'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async createClassroom(data: { name: string }) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await apiCreateClassroom(data)
        this.classrooms.push(response.data)
        return response.data
      } catch (err) {
        this.error = 'Failed to create classroom'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async updateClassroom(id: number, updates: Partial<Classroom>) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await apiUpdateClassroom(id, updates)
        const index = this.classrooms.findIndex(c => c.id === id)
        if (index !== -1) {
          this.classrooms[index] = response.data
        }
        return response.data
      } catch (err) {
        this.error = 'Failed to update classroom'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async deleteClassroom(id: number) {
      this.isLoading = true
      this.error = ''
      try {
        await apiDeleteClassroom(id)
        const index = this.classrooms.findIndex(c => c.id === id)
        if (index !== -1) {
          this.classrooms.splice(index, 1)
        }
      } catch (err) {
        this.error = 'Failed to delete classroom'
        throw err
      } finally {
        this.isLoading = false
      }
    }
  }
}) 