import { defineStore } from 'pinia';
import type { Classroom, Schedule, Course, Teacher } from '@/utils/interfaces/collegeInterface';
import { DAY_OF_WEEK } from '@/utils/interfaces/collegeInterface';
import dispatch from "@/utils/dispatcher";
import { API_ROUTES } from "@/utils/config/apiRoutes";
import { CollegeService } from "@/utils/services/collegeService";

const { 
  COLLEGE_BASE_URL, 
  CLASSROOMS_ROUTE, 
  COURSES_ROUTE, 
  SCHEDULES_ROUTE,
  TEACHERS_ROUTE 
} = API_ROUTES;

export const useCollegeStore = defineStore('college', {
  state: () => ({
    classrooms: [] as Classroom[],
    schedules: [] as Schedule[],
    courses: [] as Course[],
    teachers: [] as Teacher[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    // Classroom getters
    getClassroomById: (state) => (id: number) => 
      state.classrooms.find(classroom => classroom.id === id),

    // Schedule getters
    getSchedulesByClassroom: (state) => (classroomId: number) =>
      state.schedules.filter(schedule => schedule.classroom === classroomId)
        .sort((a, b) => {
          if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
          return a.start_time.localeCompare(b.start_time);
        }),

    // Course getters
    getCourseById: (state) => (id: number) =>
      state.courses.find(course => course.id === id),

    // Teacher getters
    getTeacherById: (state) => (id: number) =>
      state.teachers.find(teacher => teacher.id === id),

    // Helper getters
    getDayName: () => (day: DAY_OF_WEEK): string => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return days[day];
    },

    formatTime: () => (time: string): string => {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    },

    getCourseName: (state) => (courseId: number): string => {
      const course = state.courses.find(c => c.id === courseId);
      return course?.title || 'Unknown Course';
    },

    getTeacherName: (state) => (teacherId: number): string => {
      const teacher = state.teachers.find(t => t.id === teacherId);
      return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown Teacher';
    },

    getCourseWithTeacher: (state) => (courseId: number) => {
      const course = state.courses.find(c => c.id === courseId);
      if (!course) return null;
      
      const teacher = state.teachers.find(t => t.id === course.teacher);
      return {
        ...course,
        teacher: teacher || null
      };
    },
  },

  actions: {
    // Classroom actions
    async fetchClassrooms() {
      this.loading = true;
      this.error = null;
      try {
        const data = await CollegeService.getClassrooms();
        this.classrooms = data;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
      } finally {
        this.loading = false;
      }
    },

    async createClassroom(classroom: Omit<Classroom, 'id'>) {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch('/api/classrooms/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(classroom)
        });
        const newClassroom = await response.json();
        this.classrooms.push(newClassroom);
        return newClassroom;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateClassroom(id: number, classroom: Omit<Classroom, 'id'>) {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`/api/classrooms/${id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(classroom)
        });
        const updatedClassroom = await response.json();
        const index = this.classrooms.findIndex(c => c.id === id);
        if (index !== -1) {
          this.classrooms[index] = updatedClassroom;
        }
        return updatedClassroom;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteClassroom(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await fetch(`/api/classrooms/${id}/`, { method: 'DELETE' });
        this.classrooms = this.classrooms.filter(c => c.id !== id);
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Schedule actions
    async fetchSchedules() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch('/api/schedules/');
        this.schedules = await response.json();
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
      } finally {
        this.loading = false;
      }
    },

    // Course actions
    async fetchCourses() {
      this.loading = true;
      this.error = null;
      try {
        const data = await CollegeService.getCourses();
        console.log('Fetched courses:', data); // Debug log
        this.courses = data;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        console.error('Error fetching courses:', err); // Debug log
      } finally {
        this.loading = false;
      }
    },

    // Teacher actions
    async fetchTeachers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await dispatch.get(`/${TEACHERS_ROUTE}/`);
        this.teachers = response.data;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
      } finally {
        this.loading = false;
      }
    },

    // Initialize all data
    async initializeData() {
      await Promise.all([
        this.fetchClassrooms(),
        this.fetchSchedules(),
        this.fetchCourses(),
        this.fetchTeachers()
      ]);
    },

    async createCourse(courseData: Omit<Course, 'id'>) {
      this.loading = true;
      this.error = null;
      try {
        const newCourse = await CollegeService.createCourse(courseData);
        this.courses.push(newCourse);
        return newCourse;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateCourse(id: number, courseData: Omit<Course, 'id'>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedCourse = await CollegeService.updateCourse(id, courseData);
        const index = this.courses.findIndex(c => c.id === id);
        if (index !== -1) {
          this.courses[index] = updatedCourse;
        }
        return updatedCourse;
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteCourse(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await CollegeService.deleteCourse(id);
        this.courses = this.courses.filter(c => c.id !== id);
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
}); 