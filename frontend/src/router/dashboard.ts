// Layout
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";

// Parent Pages
import DashboardView from '@/views/pages/DashboardView.vue'
import StudentsView from '@/views/pages/StudentsView.vue'
import StaffView from '@/views/pages/StaffView.vue'
import CoursesView from '@/views/pages/CoursesView.vue'
import ClassroomsView from '@/views/pages/ClassroomsView.vue'
import DepartmentsView from '@/views/pages/DepartmentsView.vue'
import TasksView from '@/views/pages/TasksView.vue'
import EventsView from '@/views/pages/EventsView.vue'

// --------- Child Pages -----
// -- Actions --
import AddStudent from "@/views/pages/actions/AddStudent.vue";

// -- Details --
import ClassroomDetails from "@/views/pages/details/ClassroomDetails.vue";


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
        name: 'courses',
        component: CoursesView,
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
