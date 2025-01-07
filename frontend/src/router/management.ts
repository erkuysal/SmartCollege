// Layouts
import ManagementLayout from "@/views/layouts/ManagementLayout.vue";

// Pages
import AddStudentPage from "@/views/pages/AddStudentPage.vue";
import ListStudentPage from "@/views/pages/ListStudentPage.vue";

const managementRoutes = [
  {
    path: '',
    name: 'management',
    component: ManagementLayout,
    children: [
      {
        path: '/student/add',
        name: 'addStudent',
        component: AddStudentPage,
      },
      {
        path: '/students',
        name: 'listStudents',
        component: ListStudentPage,
      },
    ],
  },
]

export default managementRoutes;
