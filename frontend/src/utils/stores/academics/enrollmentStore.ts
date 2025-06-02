import { defineStore } from 'pinia';
import { ref } from 'vue';
import { enrollmentService, type Enrollment, type CreateEnrollmentData } from '@/utils/services/academics/enrollmentService';

export const useEnrollmentStore = defineStore('enrollment', () => {
  const items = ref<Enrollment[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchEnrollments(params?: { student?: number; section?: number }) {
    loading.value = true;
    error.value = null;
    try {
      items.value = await enrollmentService.getEnrollments(params);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch enrollments';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createEnrollment(data: CreateEnrollmentData) {
    loading.value = true;
    error.value = null;
    try {
      const newEnrollment = await enrollmentService.createEnrollment(data);
      items.value.push(newEnrollment);
      return newEnrollment;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create enrollment';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateEnrollment(id: number, data: Partial<CreateEnrollmentData>) {
    loading.value = true;
    error.value = null;
    try {
      const updatedEnrollment = await enrollmentService.updateEnrollment(id, data);
      const index = items.value.findIndex(enrollment => enrollment.id === id);
      if (index !== -1) {
        items.value[index] = updatedEnrollment;
      }
      return updatedEnrollment;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update enrollment';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteEnrollment(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await enrollmentService.deleteEnrollment(id);
      items.value = items.value.filter(enrollment => enrollment.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete enrollment';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    items,
    loading,
    error,
    fetchEnrollments,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment
  };
}); 