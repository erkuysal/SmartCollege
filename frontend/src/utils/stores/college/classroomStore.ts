import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ClassroomService } from '@/utils/services/college/classroomService';
import type { Classroom } from '@/utils/interfaces/college/classroomInterface';
import type { Schedule } from '@/utils/interfaces/college/scheduleInterface';

export const useClassroomStore = defineStore('classroom', () => {
  // State
  const classrooms = ref<Classroom[]>([]);
  const currentClassroom = ref<Classroom | null>(null);
  const classroomSchedules = ref(new Map<number, Schedule[]>());
  const loading = ref(false);
  const error = ref<string | null>(null);
  const params = ref({
    id: null as number | null,
    scheduleDate: null as string | null,
  });

  // Getters
  const getClassroomById = (id: number) =>
    classrooms.value.find(classroom => classroom.id === id);
  
  const getSchedulesForClassroom = (classroomId: number) =>
    classroomSchedules.value.get(classroomId) || [];

  // Actions
  async function fetchClassrooms(id?: number) {
    if (loading.value || (id && params.value.id === id)) return;
    
    loading.value = true;
    try {
      const response = await ClassroomService.fetchClassrooms(id);
      if (id) {
        currentClassroom.value = Array.isArray(response) ? null : response;
        params.value.id = id;
      } else {
        classrooms.value = Array.isArray(response) ? response : [response];
        params.value.id = null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createClassroom(data: Partial<Omit<Classroom, 'id'>>) {
    if (loading.value) return;
    loading.value = true;
    try {
      // Cast to Omit<Classroom, 'id'> for the service, but only send required fields
      const newClassroom = await ClassroomService.createClassroom(data as Omit<Classroom, 'id'>);
      classrooms.value.push(newClassroom);
      return newClassroom;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateClassroom(id: number, data: Partial<Classroom>) {
    if (loading.value) return;
    
    loading.value = true;
    try {
      const updated = await ClassroomService.updateClassroom(id, data);
      const index = classrooms.value.findIndex(c => c.id === id);
      if (index !== -1) {
        classrooms.value[index] = updated;
      }
      if (currentClassroom.value?.id === id) {
        currentClassroom.value = updated;
      }
      return updated;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteClassroom(id: number) {
    if (loading.value) return;
    
    loading.value = true;
    try {
      await ClassroomService.deleteClassroom(id);
      classrooms.value = classrooms.value.filter(c => c.id !== id);
      if (currentClassroom.value?.id === id) {
        currentClassroom.value = null;
        params.value.id = null;
      }
      classroomSchedules.value.delete(id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchClassroomSchedules(classroomId: number) {
    if (loading.value || classroomSchedules.value.has(classroomId)) return;
    
    loading.value = true;
    try {
      const schedules = await ClassroomService.fetchClassroomSchedules(classroomId);
      classroomSchedules.value.set(classroomId, schedules);
      return schedules;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function checkAvailability(classroomId: number, date: string) {
    if (loading.value || 
        (params.value.id === classroomId && params.value.scheduleDate === date)) return;
    
    loading.value = true;
    try {
      const result = await ClassroomService.checkAvailability(classroomId, date);
      params.value.id = classroomId;
      params.value.scheduleDate = date;
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function resetState() {
    classrooms.value = [];
    currentClassroom.value = null;
    classroomSchedules.value.clear();
    loading.value = false;
    error.value = null;
    params.value = {
      id: null,
      scheduleDate: null,
    };
  }

  return {
    // State
    classrooms,
    currentClassroom,
    classroomSchedules,
    loading,
    error,
    params,
    
    // Getters
    getClassroomById,
    getSchedulesForClassroom,
    
    // Actions
    fetchClassrooms,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    fetchClassroomSchedules,
    checkAvailability,
    resetState
  };
});
