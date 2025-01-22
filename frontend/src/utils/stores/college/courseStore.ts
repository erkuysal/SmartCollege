import { defineStore } from 'pinia';
import { CourseService } from '@/utils/services/college/courseService';
import type { Course, PopulatedCourse, Enrollment, PopulatedEnrollment } from '@/utils/interfaces/college/courseInterface';

export const useCourseStore = defineStore('course', {
  state: () => ({
    courses: [] as Course[],
    currentCourse: null as PopulatedCourse | null,
    enrollments: [] as PopulatedEnrollment[],
    loading: false,
    error: null as string | null,
    params: {
      id: null as number | null,
      student: null as number | null,
      course: null as number | null,
    },
  }),

  getters: {
    getCourseById: (state) => (id: number) =>
      state.courses.find(course => course.id === id),
    
    getEnrollmentsByCourse: (state) => (courseId: number) =>
      state.enrollments.filter(enrollment => enrollment.course.id === courseId),
    
    getEnrollmentsByStudent: (state) => (studentId: number) =>
      state.enrollments.filter(enrollment => enrollment.student.id === studentId),
  },

  actions: {
    async fetchCourses(params?: { id?: number }) {
      if (this.loading || (params?.id && this.params.id === params.id)) return;
      
      this.loading = true;
      try {
        const response = await CourseService.fetchCourses(params?.id);
        if (params?.id) {
          this.currentCourse = Array.isArray(response) ? null : response;
          this.params.id = params.id;
        } else {
          this.courses = Array.isArray(response) ? response : [response];
          this.params.id = null;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createCourse(data: Partial<Course>) {
      if (this.loading) return;
      
      this.loading = true;
      try {
        const newCourse = await CourseService.createCourse(data);
        this.courses.push(newCourse);
        return newCourse;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateCourse(id: number, data: Partial<Course>) {
      if (this.loading) return;
      
      this.loading = true;
      try {
        const updated = await CourseService.updateCourse(id, data);
        const index = this.courses.findIndex(c => c.id === id);
        if (index !== -1) {
          this.courses[index] = updated;
        }
        if (this.currentCourse?.id === id) {
          this.currentCourse = { ...this.currentCourse, ...updated };
        }
        return updated;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteCourse(id: number) {
      if (this.loading) return;
      
      this.loading = true;
      try {
        await CourseService.deleteCourse(id);
        this.courses = this.courses.filter(c => c.id !== id);
        if (this.currentCourse?.id === id) {
          this.currentCourse = null;
          this.params.id = null;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchEnrollments(params?: { course?: number; student?: number }) {
      if (this.loading || 
          (params?.course && this.params.course === params.course) ||
          (params?.student && this.params.student === params.student)) return;
      
      this.loading = true;
      try {
        this.enrollments = await CourseService.fetchEnrollments(params);
        this.params = {
          ...this.params,
          course: params?.course ?? null,
          student: params?.student ?? null,
        };
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createEnrollment(data: { student: number; course: number }) {
      if (this.loading) return;
      
      this.loading = true;
      try {
        const newEnrollment = await CourseService.createEnrollment(data);
        await this.fetchEnrollments(); // Refresh enrollments to get populated data
        return newEnrollment;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteEnrollment(id: number) {
      if (this.loading) return;
      
      this.loading = true;
      try {
        await CourseService.deleteEnrollment(id);
        this.enrollments = this.enrollments.filter(e => e.id !== id);
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    resetState() {
      this.courses = [];
      this.currentCourse = null;
      this.enrollments = [];
      this.loading = false;
      this.error = null;
      this.params = {
        id: null,
        student: null,
        course: null,
      };
    }
  }
});
