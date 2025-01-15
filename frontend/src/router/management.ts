// Layouts
import ManagementLayout from "@/views/layouts/ManagementLayout.vue";

// Pages
import AddStudentPage from "@/views/pages/depot/AddStudentPage.vue";
import ListStudentPage from "@/views/pages/depot/ListStudentPage.vue";
import StudentInfoPage from "@/views/pages/depot/StudentInfoPage.vue";


// Utils
import {useStudentStore} from "@/utils/stores/studentStore";
import development from "@/views/development.vue";

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
      {
        path: '/students/:student_number',
        name: 'studentInfo',
        component: StudentInfoPage,
        props: true,
      },
    ],
  },

  {
    path: '/development',
    name: 'development',
    component: development,
  },
]

export default managementRoutes;
