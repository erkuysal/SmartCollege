// Layouts
import ManagementLayout from "@/views/layouts/ManagementLayout.vue";

// Pages
import AddStudentPage from "@/views/pages/AddStudentPage.vue";

const managementRoutes = [
  {
    path: '',
    name: 'management',
    component: ManagementLayout,
    children: [
      {
        path: '/student/add',
        name: 'managementAdd',
        component: AddStudentPage,
      },
      // {},
    ],
  },
]

export default managementRoutes;
