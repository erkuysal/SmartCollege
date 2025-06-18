import type { RouteRecordRaw } from 'vue-router';
import { useLecturersStore } from '@/client/stores/lecturers';
import { useStudentsStore } from '@/client/stores/students';
import LecturersView from '@/views/users/LecturersView.vue';
import LecturerDetailsView from '@/views/users/LecturerDetailsView.vue';
import StudentsView from '@/views/users/StudentsView.vue';
import StudentDetailsView from '@/views/users/StudentDetailsView.vue';

// Dummy component for redirect-only routes
const Dummy = { render() { return null } };

export const userRoutes: RouteRecordRaw[] = [
  // Lecturer routes
  { path: 'lecturers', component: LecturersView },
  {
    path: 'lecturers/:id(\\d+)',
    component: Dummy,
    beforeEnter: async (to, from, next) => {
      const store = useLecturersStore();
      if (!store.lecturers.length) {
        await store.fetchLecturers();
      }
      const id = Number(to.params.id);
      const lec = store.getLecturerById(id);
      if (lec) {
        next({ name: 'LecturerBySlug', params: { user_number: lec.user_number } });
      } else {
        next(false);
      }
    }
  },
  {
    path: 'lecturers/:user_number',
    name: 'LecturerBySlug',
    component: LecturerDetailsView
  },

  // Student routes
  { path: 'students', component: StudentsView },
  {
    path: 'students/:id(\\d+)',
    component: Dummy,
    beforeEnter: async (to, from, next) => {
      const store = useStudentsStore();
      if (!store.students.length) {
        await store.fetchStudents();
      }
      const id = Number(to.params.id);
      const student = store.getStudentById(id);
      if (student) {
        next({ name: 'StudentBySlug', params: { user_number: student.user_number } });
      } else {
        next(false);
      }
    }
  },
  {
    path: 'students/:user_number',
    name: 'StudentBySlug',
    component: StudentDetailsView
  }
];
