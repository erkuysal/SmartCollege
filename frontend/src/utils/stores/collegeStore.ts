import { defineStore } from 'pinia';
import { CollegeService } from '@/utils/services/collegeService';
import type { 
  Classroom, 
  Course, 
  Schedule 
} from '@/utils/interfaces/collegeInterface';

export const useCollegeStore = defineStore('college', {
  state: () => ({
    classrooms: [] as Classroom[],
    courses: [] as Course[],
    schedules: [] as Schedule[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getClassroomById: (state) => (id: number) =>
      state.classrooms.find(classroom => classroom.id === id),

    getCourseById: (state) => (id: number) =>
      state.courses.find(course => course.id === id),

    getScheduleById: (state) => (id: number) =>
      state.schedules.find(schedule => schedule.id === id),

    getSchedulesByClassroom: (state) => (classroomId: number) =>
      state.schedules.filter(schedule => schedule.classroom === classroomId),
  },

  actions: {
    // Classroom actions
    async fetchClassrooms() {
      this.loading = true;
      this.error = null;
      try {
        const response = await CollegeService.getClassrooms();
        this.classrooms = response;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Course actions
    async fetchCourses() {
      this.loading = true;
      this.error = null;
      try {
        const response = await CollegeService.getCourses();
        this.courses = response;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Schedule actions
    async fetchClassroomSchedule(classroomId: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await CollegeService.getClassroomSchedule(classroomId);
        this.schedules = response;
        return response;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async addSchedule(scheduleData: Omit<Schedule, 'id'>) {
      this.loading = true;
      this.error = null;
      try {
        const newSchedule = await CollegeService.addSchedule(scheduleData);
        this.schedules.push(newSchedule);
        return newSchedule;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateSchedule(scheduleId: number, scheduleData: Partial<Schedule>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedSchedule = await CollegeService.updateSchedule(scheduleId, scheduleData);
        const index = this.schedules.findIndex(s => s.id === scheduleId);
        if (index !== -1) {
          this.schedules[index] = updatedSchedule;
        }
        return updatedSchedule;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteSchedule(scheduleId: number) {
      this.loading = true;
      this.error = null;
      try {
        await CollegeService.deleteSchedule(scheduleId);
        this.schedules = this.schedules.filter(s => s.id !== scheduleId);
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Reset state
    resetState() {
      this.classrooms = [];
      this.courses = [];
      this.schedules = [];
      this.loading = false;
      this.error = null;
    }
  }
}); 