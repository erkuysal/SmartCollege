// Layout
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";

// Parent Pages
import DashboardView from '@/views/pages/management/DashboardView.vue'
import StudentsView from '@/views/pages/management/users/StudentsView.vue'
import LecturersView from '../views/pages/management/users/LecturersView.vue'
import CoursesView from '@/views/pages/management/college/CoursesView.vue'
import ClassroomsView from '@/views/pages/management/college/ClassroomsView.vue'
import DepartmentsView from '@/views/pages/management/college/DepartmentsView.vue'
import FacultiesView from '@/views/pages/management/college/FacultiesView.vue'
import TasksView from '@/views/pages/management/TasksView.vue'
import AttendanceView from '@/views/pages/management/college/AttendanceView.vue'

// --------- Child Pages -----
// -- Actions --
import AddStudent from "@/views/pages/actions/AddStudent.vue";
import EditLecturer from "@/views/pages/actions/EditLecturer.vue";
import AddFaculty from "@/views/pages/actions/AddFaculty.vue";
import EditFaculty from "@/views/pages/actions/EditFaculty.vue";

// -- Details --
import ClassroomDetails from "@/views/pages/details/ClassroomSchedule.vue";
import CourseDetails from "@/views/pages/details/CourseDetails.vue";
import LecturerDetails from "@/views/pages/details/LecturerDetails.vue";


// Optional: If you have a login or public pages, import them here
// import LoginView from '@/views/LoginView.vue'

import type { RouteRecordRaw } from 'vue-router';

const dashboardRoutes: RouteRecordRaw[] = [
  // Example: if you have a public login
  // { path: '/login', name: 'login', component: LoginView },

  {
    path: '/admin',
    component: DashboardLayout,  // The parent layout
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardView,
      },
      {
        path: 'students',
        name: 'students',
        component: StudentsView,
        children: [
          {
            path: 'add',
            name: 'addStudent',
            component: AddStudent,
          },
          {
            path: ':id/edit',
            name: 'editStudent',
            component: () => import('@/views/pages/actions/EditStudent.vue'),
            props: true
          },
        ],
      },
      {
        path: 'lecturers',
        children: [
          {
            path: '',  // Empty path for the lecturers list
            name: 'lecturers',
            component: LecturersView,
          },
          {
            path: ':id/details',
            name: 'lecturer-details',
            component: LecturerDetails,
            props: true
          },
          {
            path: ':id/edit',
            name: 'edit-lecturer',
            component: EditLecturer,
            props: true
          },
        ],
      },
      {
        path: 'courses',
        children: [
          {
            path: '',  // Empty path for the courses list
            name: 'courses',
            component: CoursesView,
          },
          {
            path: ':id/details',
            name: 'course-details',
            component: CourseDetails,
            props: true
          },
        ],
      },
      {
        path: 'classrooms',
        name: 'classrooms',
        component: ClassroomsView,
        children: [
          {
            path: ':id/details',
            name: 'classroom-details',
            component: ClassroomDetails,
            props: true
          },
        ],
      },
      {
        path: 'departments',
        children: [
          {
            path: '',
            name: 'departments',
            component: DepartmentsView,
          },
          {
            path: 'add',
            name: 'add-department',
            component: () => import('@/views/pages/actions/AddDepartment.vue'),
          },
          {
            path: 'edit/:id',
            name: 'edit-department',
            component: () => import('@/views/pages/actions/EditDepartment.vue'),
            props: true
          },
        ],
      },
      {
        path: 'faculties',
        children: [
          {
            path: '',
            name: 'faculties',
            component: FacultiesView,
          },
          {
            path: 'add',
            name: 'add-faculty',
            component: AddFaculty,
          },
          {
            path: 'edit/:id',
            name: 'edit-faculty',
            component: EditFaculty,
            props: true
          },
        ],
      },
      {
        path: 'tasks',
        name: 'tasks',
        component: TasksView,
      },
      {
        path: 'attendance',
        name: 'attendance',
        component: AttendanceView,
      },
      {
        path: 'events',
        name: 'events',
        component: AttendanceView,
      },

      // Example: If user goes directly to /admin, redirect to /admin/dashboard
      {
        path: '',
        redirect: { name: 'dashboard' },
      },
    ],
  },

  // Catch-all route (optional)
  // { path: '/:pathMatch(.*)*', redirect: '/admin' },
]

export default dashboardRoutes;
