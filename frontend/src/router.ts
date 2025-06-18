import { createRouter, createWebHistory } from 'vue-router';
import BaseLayout from './components/layouts/BaseLayout.vue';
import SessionsView from './views/attendance/SessionsView.vue';
import StudentsView from './views/users/StudentsView.vue';
import AttendanceView from './views/attendance/AttendanceView.vue';
import StudentDetailsView from './views/users/StudentDetailsView.vue';
import RFIDTestView from './views/rfid/RFIDTestView.vue';
import CoursesView from './views/academics/CoursesView.vue';
import LecturersView from './views/users/LecturersView.vue';
import CourseDetailsView from './views/academics/CourseDetailsView.vue';
import LecturerDetailsView from './views/users/LecturerDetailsView.vue';
import SchedulesView from './views/academics/SchedulesView.vue';
import ScheduleDetailsView from './views/academics/ScheduleDetailsView.vue';
import ClassroomsView from './views/academics/ClassroomsView.vue';
import OverviewView from './views/OverviewView.vue';
import { useLecturersStore } from '@/client/stores/lecturers';
import { useStudentsStore } from '@/client/stores/students';
import type { RouteLocationNormalized, RouteLocationNormalizedLoaded, NavigationGuardNext } from 'vue-router';

// Dummy component for redirect-only routes
const Dummy = { render() { return null } };

const routes = [
  {
    path: '/',
    component: BaseLayout,
    children: [
      { path: '', redirect: '/overview' },
      { path: 'overview', component: OverviewView },
      { path: 'sessions', component: SessionsView },
      { path: 'students', component: StudentsView },
      { path: 'attendance', component: AttendanceView },
      { path: 'rfid-test', component: RFIDTestView },
      { path: 'courses', component: CoursesView },
      { path: 'courses/:id', component: CourseDetailsView },
      { path: 'lecturers', component: LecturersView },
      // Numeric-only path: redirects to slug
      {
        path: 'lecturers/:id(\\d+)',
        component: Dummy,
        beforeEnter: async (
          to: RouteLocationNormalized,
          from: RouteLocationNormalizedLoaded,
          next: NavigationGuardNext
        ) => {
          const store = useLecturersStore();
          if (!store.lecturers.length) {
            await store.fetchLecturers();
          }
          const id = Number(to.params.id);
          const lec = store.getLecturerById(id);
          if (lec) {
            next({ name: 'LecturerBySlug', params: { user_number: lec.user_number } });
          } else {
            next(false); // No NotFound route, so cancel navigation
          }
        }
      },
      // Slug route
      {
        path: 'lecturers/:user_number',
        name: 'LecturerBySlug',
        component: LecturerDetailsView
      },
      { path: 'schedules', component: SchedulesView },
      { path: 'schedules/:id', component: ScheduleDetailsView },
      { path: 'classrooms', component: ClassroomsView },
      // Numeric-only path: redirects to slug for students
      {
        path: 'students/:id(\\d+)',
        component: Dummy,
        beforeEnter: async (
          to: RouteLocationNormalized,
          from: RouteLocationNormalizedLoaded,
          next: NavigationGuardNext
        ) => {
          const store = useStudentsStore();
          if (!store.students.length) {
            await store.fetchStudents();
          }
          const id = Number(to.params.id);
          const student = store.getStudentById(id);
          if (student) {
            next({ name: 'StudentBySlug', params: { user_number: student.user_number } });
          } else {
            next(false); // or handle not found as you wish
          }
        }
      },
      // Slug route for students
      {
        path: 'students/:user_number',
        name: 'StudentBySlug',
        component: StudentDetailsView
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
