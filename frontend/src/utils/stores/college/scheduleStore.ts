import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ScheduleService } from '@/utils/services/college/scheduleService';
import type { Schedule, PopulatedSchedule } from '@/utils/interfaces/college/scheduleInterface';

export const useScheduleStore = defineStore('schedule', () => {
  // State
  const schedules = ref<PopulatedSchedule[]>([]);
  const currentSchedule = ref<PopulatedSchedule | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const params = ref({
    id: null as number | null,
    classroom: null as number | null,
    course: null as number | null,
  });

  // Getters
  const getScheduleById = (id: number) => 
    schedules.value.find(schedule => schedule.id === id);
  
  const getSchedulesByClassroom = (classroomId: number) =>
    schedules.value.filter(schedule => schedule.classroom.id === classroomId);
  
  const getSchedulesByCourse = (courseId: number) =>
    schedules.value.filter(schedule => schedule.course.id === courseId);

  // Actions
  async function fetchSchedules(fetchParams?: { id?: number; classroom?: number; course?: number }) {
    if (loading.value || 
        (fetchParams?.id && params.value.id === fetchParams.id) ||
        (fetchParams?.classroom && params.value.classroom === fetchParams.classroom) ||
        (fetchParams?.course && params.value.course === fetchParams.course)) return;
    
    loading.value = true;
    try {
      if (fetchParams?.id) {
        const schedule = await ScheduleService.fetchSchedule(fetchParams.id);
        currentSchedule.value = schedule;
        params.value.id = fetchParams.id;
      } else {
        const fetchedSchedules = await ScheduleService.fetchSchedules({
          classroom: fetchParams?.classroom,
          course: fetchParams?.course,
        });
        schedules.value = fetchedSchedules;
        params.value = {
          id: null,
          classroom: fetchParams?.classroom ?? null,
          course: fetchParams?.course ?? null,
        };
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createSchedule(data: Partial<Schedule>) {
    loading.value = true;
    try {
      const newSchedule = await ScheduleService.createSchedule(data);
      // Fetch the populated version of the schedule
      const populatedSchedule = await ScheduleService.fetchSchedule(newSchedule.id);
      schedules.value.push(populatedSchedule);
      return populatedSchedule;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateSchedule(id: number, data: Partial<Schedule>) {
    loading.value = true;
    try {
      await ScheduleService.updateSchedule(id, data);
      // Fetch the updated populated version
      const updated = await ScheduleService.fetchSchedule(id);
      const index = schedules.value.findIndex(s => s.id === id);
      if (index !== -1) {
        schedules.value[index] = updated;
      }
      if (currentSchedule.value?.id === id) {
        currentSchedule.value = updated;
      }
      return updated;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteSchedule(id: number) {
    loading.value = true;
    try {
      await ScheduleService.deleteSchedule(id);
      schedules.value = schedules.value.filter(s => s.id !== id);
      if (currentSchedule.value?.id === id) {
        currentSchedule.value = null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function resetState() {
    schedules.value = [];
    currentSchedule.value = null;
    loading.value = false;
    error.value = null;
    params.value = {
      id: null,
      classroom: null,
      course: null,
    };
  }

  return {
    // State
    schedules,
    currentSchedule,
    loading,
    error,
    params,
    
    // Getters
    getScheduleById,
    getSchedulesByClassroom,
    getSchedulesByCourse,
    
    // Actions
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    resetState
  };
});
