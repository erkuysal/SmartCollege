import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Semester } from '@/client/api'
import { getSemesters, getSemester, createSemester, updateSemester, deleteSemester } from '@/client/api'

export const useSemestersStore = defineStore('semesters', () => {
  const semesters = ref<Semester[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSemesters() {
    loading.value = true
    error.value = null
    try {
      const response = await getSemesters()
      semesters.value = response.data.results
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch semesters'
      console.error('Error fetching semesters:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchSemester(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await getSemester(id)
      return response.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch semester'
      console.error('Error fetching semester:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function addSemester(data: { 
    academic_year: number; 
    semester_type: 'fall' | 'spring' | 'summer'; 
    start_date: string; 
    end_date: string; 
    registration_start: string; 
    registration_end: string; 
    is_active?: boolean 
  }) {
    loading.value = true
    error.value = null
    try {
      const response = await createSemester(data)
      semesters.value.push(response.data)
      return response.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create semester'
      console.error('Error creating semester:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function editSemester(id: number, data: Partial<Semester>) {
    loading.value = true
    error.value = null
    try {
      const response = await updateSemester(id, data)
      const index = semesters.value.findIndex(s => s.id === id)
      if (index !== -1) {
        semesters.value[index] = response.data
      }
      return response.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update semester'
      console.error('Error updating semester:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function removeSemester(id: number) {
    loading.value = true
    error.value = null
    try {
      await deleteSemester(id)
      semesters.value = semesters.value.filter(s => s.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete semester'
      console.error('Error deleting semester:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    semesters,
    loading,
    error,
    fetchSemesters,
    fetchSemester,
    addSemester,
    editSemester,
    removeSemester
  }
}) 