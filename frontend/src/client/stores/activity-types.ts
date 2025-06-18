import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ActivityType } from '@/client/api'
import { getActivityTypes, getActivityType, createActivityType, updateActivityType, deleteActivityType } from '@/client/api'

export const useActivityTypesStore = defineStore('activity-types', () => {
  const activityTypes = ref<ActivityType[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchActivityTypes() {
    loading.value = true
    error.value = null
    try {
      const response = await getActivityTypes()
      activityTypes.value = response.data.results
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch activity types'
      console.error('Error fetching activity types:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchActivityType(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await getActivityType(id)
      return response.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch activity type'
      console.error('Error fetching activity type:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function addActivityType(data: { name: string; description: string; is_active?: boolean }) {
    loading.value = true
    error.value = null
    try {
      const response = await createActivityType(data)
      activityTypes.value.push(response.data)
      return response.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create activity type'
      console.error('Error creating activity type:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function editActivityType(id: number, data: Partial<ActivityType>) {
    loading.value = true
    error.value = null
    try {
      const response = await updateActivityType(id, data)
      const index = activityTypes.value.findIndex(at => at.id === id)
      if (index !== -1) {
        activityTypes.value[index] = response.data
      }
      return response.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update activity type'
      console.error('Error updating activity type:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function removeActivityType(id: number) {
    loading.value = true
    error.value = null
    try {
      await deleteActivityType(id)
      activityTypes.value = activityTypes.value.filter(at => at.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete activity type'
      console.error('Error deleting activity type:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    activityTypes,
    loading,
    error,
    fetchActivityTypes,
    fetchActivityType,
    addActivityType,
    editActivityType,
    removeActivityType
  }
}) 