// Layouts
import ManagementLayout from "@/views/layouts/ManagementLayout.vue";

// Pages
import AddStudentPage from "@/views/pages/AddStudentPage.vue";
import ListStudentPage from "@/views/pages/ListStudentPage.vue";
import StudentInfoPage from "@/views/pages/StudentInfoPage.vue";


// Utils
import {useStudentStore} from "@/utils/stores/studentStore";

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
]

export default managementRoutes;
