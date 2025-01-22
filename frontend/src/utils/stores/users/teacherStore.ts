import { defineStore } from 'pinia';
import type { Teacher, TeacherState } from '@/utils/interfaces/users/teacherInterface';
import { TeacherService } from '@/utils/services/users/teacherService';

export const useTeacherStore = defineStore('teacherStore', {
  state: (): TeacherState => ({
    teachers: [],
    isLoading: false,
    error: null
  }),

  getters: {
    teacherById: (state) => {
      return (id: number) => state.teachers.find(
        (teacher) => teacher.id === id
      );
    }
  },

  actions: {
    async fetchTeachers() {
      try {
        this.isLoading = true;
        this.error = null;
        this.teachers = await TeacherService.listTeachers();
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchTeacher(id: number) {
      try {
        this.isLoading = true;
        this.error = null;
        return await TeacherService.getTeacher(id);
      } catch (err: any) {
        this.error = err.message;
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async addTeacher(teacher: Omit<Teacher, 'id'>) {
      try {
        this.isLoading = true;
        this.error = null;
        const newTeacher = await TeacherService.addTeacher(teacher);
        this.teachers.push(newTeacher);
        return newTeacher;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async updateTeacher(id: number, data: Partial<Teacher>) {
      try {
        this.isLoading = true;
        this.error = null;
        const updated = await TeacherService.updateTeacher(id, data);
        const idx = this.teachers.findIndex(t => t.id === id);
        if (idx !== -1) {
          this.teachers[idx] = updated;
        }
        return updated;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async removeTeacher(id: number) {
      try {
        this.isLoading = true;
        this.error = null;
        await TeacherService.deleteTeacher(id);
        this.teachers = this.teachers.filter(t => t.id !== id);
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    }
  }
});
