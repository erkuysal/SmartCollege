import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AcademicYear } from '@/client/api'
import { getAcademicYears, getAcademicYear, createAcademicYear, updateAcademicYear, deleteAcademicYear } from '@/client/api'

export const useAcademicYearsStore = defineStore('academic-years', () => {
  const academicYears = ref<AcademicYear[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAcademicYears() {
    loading.value = true
    error.value = null
    try {
      const response = await getAcademicYears()
      academicYears.value = response.data.results
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch academic years'
      console.error('Error fetching academic years:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchAcademicYear(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await getAcademicYear(id)
      return response.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch academic year'
      console.error('Error fetching academic year:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function addAcademicYear(data: { 
    year: string; 
    start_date: string; 
    end_date: string; 
    is_active?: boolean 
  }) {
    loading.value = true
    error.value = null
    try {
      const response = await createAcademicYear(data)
      academicYears.value.push(response.data)
      return response.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create academic year'
      console.error('Error creating academic year:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function editAcademicYear(id: number, data: Partial<AcademicYear>) {
    loading.value = true
    error.value = null
    try {
      const response = await updateAcademicYear(id, data)
      const index = academicYears.value.findIndex(ay => ay.id === id)
      if (index !== -1) {
        academicYears.value[index] = response.data
      }
      return response.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update academic year'
      console.error('Error updating academic year:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function removeAcademicYear(id: number) {
    loading.value = true
    error.value = null
    try {
      await deleteAcademicYear(id)
      academicYears.value = academicYears.value.filter(ay => ay.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete academic year'
      console.error('Error deleting academic year:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    academicYears,
    loading,
    error,
    fetchAcademicYears,
    fetchAcademicYear,
    addAcademicYear,
    editAcademicYear,
    removeAcademicYear
  }
}) 