// Layout
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";

// Parent Pages
import DashboardView from '@/views/pages/management/DashboardView.vue'
import StudentsView from '@/views/pages/management/StudentsView.vue'
import StaffView from '@/views/pages/management/StaffView.vue'
import CoursesView from '@/views/pages/management/CoursesView.vue'
import ClassroomsView from '@/views/pages/management/ClassroomsView.vue'
import DepartmentsView from '@/views/pages/management/DepartmentsView.vue'
import TasksView from '@/views/pages/management/TasksView.vue'
import EventsView from '@/views/pages/management/AttendanceView.vue'

// --------- Child Pages -----
// -- Actions --
import AddStudent from "@/views/pages/actions/AddStudent.vue";

// -- Details --
import ClassroomDetails from "@/views/pages/details/ClassroomSchedule.vue";
import CourseDetails from "@/views/pages/details/CourseDetails.vue";


// Optional: If you have a login or public pages, import them here
// import LoginView from '@/views/LoginView.vue'

const dashboardRoutes = [
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
        ],
      },
      {
        path: 'staff',
        name: 'staff',
        component: StaffView,
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
        name: 'departments',
        component: DepartmentsView,
      },
      {
        path: 'tasks',
        name: 'tasks',
        component: TasksView,
      },
      {
        path: 'events',
        name: 'events',
        component: EventsView,
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
