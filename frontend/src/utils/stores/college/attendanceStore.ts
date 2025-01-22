import { defineStore } from 'pinia';
import { AttendanceService } from '@/utils/services/college/attendanceService';
import type { Attendance, PopulatedAttendance } from '@/utils/interfaces/college/attendanceInterface';

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    attendances: [] as PopulatedAttendance[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getAttendanceById: (state) => (id: number) =>
      state.attendances.find(attendance => attendance.id === id),
    
    getAttendancesBySchedule: (state) => (scheduleId: number) =>
      state.attendances.filter(attendance => attendance.schedule.id === scheduleId),
    
    getAttendancesByStudent: (state) => (studentId: number) =>
      state.attendances.filter(attendance => attendance.student.id === studentId),
    
    getAttendancesByDate: (state) => (date: string) =>
      state.attendances.filter(attendance => attendance.attendance_date === date),
  },

  actions: {
    async fetchAttendances(params?: { 
      schedule?: number; 
      student?: number;
      date?: string;
    }) {
      this.loading = true;
      try {
        this.attendances = await AttendanceService.fetchAttendances(params);
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createAttendance(data: Partial<Attendance>) {
      this.loading = true;
      try {
        const newAttendance = await AttendanceService.createAttendance(data);
        // Refresh attendances to get populated data
        await this.fetchAttendances();
        return newAttendance;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateAttendance(id: number, data: Partial<Attendance>) {
      this.loading = true;
      try {
        await AttendanceService.updateAttendance(id, data);
        // Refresh attendances to get populated data
        await this.fetchAttendances();
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteAttendance(id: number) {
      this.loading = true;
      try {
        await AttendanceService.deleteAttendance(id);
        this.attendances = this.attendances.filter(a => a.id !== id);
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async bulkCreateAttendance(data: Partial<Attendance>[]) {
      this.loading = true;
      try {
        const newAttendances = await AttendanceService.bulkCreateAttendance(data);
        // Refresh attendances to get populated data
        await this.fetchAttendances();
        return newAttendances;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    resetState() {
      this.attendances = [];
      this.loading = false;
      this.error = null;
    }
  }
});
