import { defineStore } from 'pinia';
import { ClassroomService } from '@/utils/services/college/classroomService';
import type { Classroom } from '@/utils/interfaces/college/classroomInterface';
import type { Schedule } from '@/utils/interfaces/college/scheduleInterface';

export const useClassroomStore = defineStore('classroom', {
  state: () => ({
    classrooms: [] as Classroom[],
    currentClassroom: null as Classroom | null,
    classroomSchedules: new Map<number, Schedule[]>(),
    loading: false,
    error: null as string | null,
    params: {
      id: null as number | null,
      scheduleDate: null as string | null,
    },
  }),

  getters: {
    getClassroomById: (state) => (id: number) =>
      state.classrooms.find(classroom => classroom.id === id),
    
    getSchedulesForClassroom: (state) => (classroomId: number) =>
      state.classroomSchedules.get(classroomId) || [],
  },

  actions: {
    async fetchClassrooms(id?: number) {
      if (this.loading || (id && this.params.id === id)) return;
      
      this.loading = true;
      try {
        const response = await ClassroomService.fetchClassrooms(id);
        if (id) {
          this.currentClassroom = Array.isArray(response) ? null : response;
          this.params.id = id;
        } else {
          this.classrooms = Array.isArray(response) ? response : [response];
          this.params.id = null;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createClassroom(data: Omit<Classroom, 'id'>) {
      if (this.loading) return;
      
      this.loading = true;
      try {
        const newClassroom = await ClassroomService.createClassroom(data);
        this.classrooms.push(newClassroom);
        return newClassroom;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateClassroom(id: number, data: Partial<Classroom>) {
      if (this.loading) return;
      
      this.loading = true;
      try {
        const updated = await ClassroomService.updateClassroom(id, data);
        const index = this.classrooms.findIndex(c => c.id === id);
        if (index !== -1) {
          this.classrooms[index] = updated;
        }
        if (this.currentClassroom?.id === id) {
          this.currentClassroom = updated;
        }
        return updated;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteClassroom(id: number) {
      if (this.loading) return;
      
      this.loading = true;
      try {
        await ClassroomService.deleteClassroom(id);
        this.classrooms = this.classrooms.filter(c => c.id !== id);
        if (this.currentClassroom?.id === id) {
          this.currentClassroom = null;
          this.params.id = null;
        }
        this.classroomSchedules.delete(id);
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchClassroomSchedules(classroomId: number) {
      if (this.loading || this.classroomSchedules.has(classroomId)) return;
      
      this.loading = true;
      try {
        const schedules = await ClassroomService.fetchClassroomSchedules(classroomId);
        this.classroomSchedules.set(classroomId, schedules);
        return schedules;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async checkAvailability(classroomId: number, date: string) {
      if (this.loading || 
          (this.params.id === classroomId && this.params.scheduleDate === date)) return;
      
      this.loading = true;
      try {
        const result = await ClassroomService.checkAvailability(classroomId, date);
        this.params.id = classroomId;
        this.params.scheduleDate = date;
        return result;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    resetState() {
      this.classrooms = [];
      this.currentClassroom = null;
      this.classroomSchedules.clear();
      this.loading = false;
      this.error = null;
      this.params = {
        id: null,
        scheduleDate: null,
      };
    }
  }
});
