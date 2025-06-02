import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import scheduleService from '@/utils/services/college/scheduleService';
import type { Schedule, LegacySchedule, ScheduleFilter } from '@/utils/interfaces/college/scheduleInterface';
import type { PaginatedResponse } from '@/utils/services/baseService';
import logger from '@/utils/logging/logger';

// Create a logger for the schedule store
const storeLogger = logger.createLogger('ScheduleStore');

// Extended response type with fallback indicator
interface ScheduleResponseWithFallback extends PaginatedResponse<Schedule> {
  _useFallback?: boolean;
}

export const useScheduleStore = defineStore('schedule', () => {
  // State
  const schedules = ref<Schedule[]>([]);
  const currentSchedule = ref<Schedule | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const params = ref({
    id: null as number | null,
    classroom: null as number | null,
    section: null as number | null,
    time_slot: null as number | null,
  });
  const usesFallbackData = ref(false);

  // Getters
  const getScheduleById = (id: number) => 
    schedules.value.find(schedule => schedule.id === id);
  
  const getSchedulesByClassroom = (classroomId: number) =>
    schedules.value.filter(schedule => schedule.classroom === classroomId);
  
  const getSchedulesBySection = (sectionId: number) =>
    schedules.value.filter(schedule => schedule.section === sectionId);

  // Actions
  async function fetchSchedules(fetchParams?: { id?: number; classroom?: number; section?: number; time_slot?: number }) {
    if (loading.value || 
        (fetchParams?.id && params.value.id === fetchParams.id) ||
        (fetchParams?.classroom && params.value.classroom === fetchParams.classroom) ||
        (fetchParams?.section && params.value.section === fetchParams.section) ||
        (fetchParams?.time_slot && params.value.time_slot === fetchParams.time_slot)) return;
    
    loading.value = true;
    error.value = null;
    usesFallbackData.value = false;
    
    try {
      if (fetchParams?.id) {
        storeLogger.debug('Fetching schedule by ID', { id: fetchParams.id });
        const schedule = await scheduleService.fetchSchedule(fetchParams.id);
        currentSchedule.value = schedule as Schedule;
        params.value.id = fetchParams.id;
      } else {
        const filterParams: ScheduleFilter = {};
        if (fetchParams?.classroom) filterParams.classroom = fetchParams.classroom;
        if (fetchParams?.section) filterParams.section = fetchParams.section;
        if (fetchParams?.time_slot) filterParams.time_slot = fetchParams.time_slot;
        
        storeLogger.debug('Fetching schedules with filters', { filterParams });
        const response = await scheduleService.fetchSchedules(filterParams) as ScheduleResponseWithFallback;
        
        if (response) {
          schedules.value = response.results as Schedule[];
          
          // If the response is from fallback data, set the flag
          if (response._useFallback) {
            usesFallbackData.value = true;
            storeLogger.info('Using fallback schedule data');
          }
          
          params.value = {
            id: null,
            classroom: fetchParams?.classroom ?? null,
            section: fetchParams?.section ?? null,
            time_slot: fetchParams?.time_slot ?? null
          };
        }
      }
    } catch (err) {
      storeLogger.error('Error fetching schedules', { error: err });
      error.value = err instanceof Error ? err.message : String(err);
      
      // If we have no schedules, set empty array to prevent UI issues
      if (schedules.value.length === 0) {
        schedules.value = [];
      }
    } finally {
      loading.value = false;
    }
  }

  async function createSchedule(data: Partial<Schedule>) {
    loading.value = true;
    error.value = null;
    
    try {
      storeLogger.debug('Creating new schedule', { data });
      const newSchedule = await scheduleService.createSchedule(data);
      
      // Fetch the populated version of the schedule
      const fullSchedule = await scheduleService.fetchSchedule(newSchedule.id);
      schedules.value.push(fullSchedule);
      return fullSchedule;
    } catch (err) {
      storeLogger.error('Error creating schedule', { error: err, data });
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateSchedule(id: number, data: Partial<Schedule>) {
    loading.value = true;
    error.value = null;
    
    try {
      storeLogger.debug('Updating schedule', { id, data });
      await scheduleService.updateSchedule(id, data);
      
      // Fetch the updated populated version
      const updated = await scheduleService.fetchSchedule(id);
      const index = schedules.value.findIndex(s => s.id === id);
      if (index !== -1) {
        schedules.value[index] = updated;
      }
      if (currentSchedule.value?.id === id) {
        currentSchedule.value = updated;
      }
      return updated;
    } catch (err) {
      storeLogger.error('Error updating schedule', { error: err, id, data });
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteSchedule(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      storeLogger.debug('Deleting schedule', { id });
      await scheduleService.deleteSchedule(id);
      schedules.value = schedules.value.filter(s => s.id !== id);
      if (currentSchedule.value?.id === id) {
        currentSchedule.value = null;
      }
    } catch (err) {
      storeLogger.error('Error deleting schedule', { error: err, id });
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
    usesFallbackData.value = false;
    params.value = {
      id: null,
      classroom: null,
      section: null,
      time_slot: null
    };
  }

  return {
    // State
    schedules,
    currentSchedule,
    loading,
    error,
    params,
    usesFallbackData,
    
    // Getters
    getScheduleById,
    getSchedulesByClassroom,
    getSchedulesBySection,
    
    // Actions
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    resetState
  };
});
