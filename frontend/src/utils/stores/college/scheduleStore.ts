import { defineStore } from 'pinia';
import { ScheduleService } from '@/utils/services/college/scheduleService';
import type { Schedule, PopulatedSchedule } from '@/utils/interfaces/college/scheduleInterface';

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    schedules: [] as PopulatedSchedule[],
    currentSchedule: null as PopulatedSchedule | null,
    loading: false,
    error: null as string | null,
    params: {
      id: null as number | null,
      classroom: null as number | null,
      course: null as number | null,
    },
  }),

  getters: {
    getScheduleById: (state) => (id: number) =>
      state.schedules.find(schedule => schedule.id === id),
    
    getSchedulesByClassroom: (state) => (classroomId: number) =>
      state.schedules.filter(schedule => schedule.classroom.id === classroomId),
    
    getSchedulesByCourse: (state) => (courseId: number) =>
      state.schedules.filter(schedule => schedule.course.id === courseId),
  },

  actions: {
    async fetchSchedules(params?: { id?: number; classroom?: number; course?: number }) {
      if (this.loading || 
          (params?.id && this.params.id === params.id) ||
          (params?.classroom && this.params.classroom === params.classroom) ||
          (params?.course && this.params.course === params.course)) return;
      
      this.loading = true;
      try {
        if (params?.id) {
          const schedule = await ScheduleService.fetchSchedule(params.id);
          this.currentSchedule = schedule;
          this.params.id = params.id;
        } else {
          const schedules = await ScheduleService.fetchSchedules({
            classroom: params?.classroom,
            course: params?.course,
          });
          this.schedules = schedules;
          this.params = {
            id: null,
            classroom: params?.classroom ?? null,
            course: params?.course ?? null,
          };
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createSchedule(data: Partial<Schedule>) {
      this.loading = true;
      try {
        const newSchedule = await ScheduleService.createSchedule(data);
        // Fetch the populated version of the schedule
        const populatedSchedule = await ScheduleService.fetchSchedule(newSchedule.id);
        this.schedules.push(populatedSchedule);
        return populatedSchedule;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateSchedule(id: number, data: Partial<Schedule>) {
      this.loading = true;
      try {
        await ScheduleService.updateSchedule(id, data);
        // Fetch the updated populated version
        const updated = await ScheduleService.fetchSchedule(id);
        const index = this.schedules.findIndex(s => s.id === id);
        if (index !== -1) {
          this.schedules[index] = updated;
        }
        if (this.currentSchedule?.id === id) {
          this.currentSchedule = updated;
        }
        return updated;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteSchedule(id: number) {
      this.loading = true;
      try {
        await ScheduleService.deleteSchedule(id);
        this.schedules = this.schedules.filter(s => s.id !== id);
        if (this.currentSchedule?.id === id) {
          this.currentSchedule = null;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    resetState() {
      this.schedules = [];
      this.currentSchedule = null;
      this.loading = false;
      this.error = null;
      this.params = {
        id: null,
        classroom: null,
        course: null,
      };
    }
  }
});
