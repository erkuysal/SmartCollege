import ClassroomsPage from "@/views/pages/ClassroomsPage.vue";
import ClassroomDetailPage from "@/views/pages/ClassroomDetailPage.vue";
import development from "@/views/development.vue";

const classroomRoutes = [
  {
    path: '/classrooms',
    name: 'Classrooms',
    component: ClassroomsPage,
  },
  {
    path: '/classrooms/:id',
    name: 'ClassroomDetail',
    component: ClassroomDetailPage,
    props: true,
  },
  {
    path: '/development',
    name: 'development',
    component: development,
  },
]

export default classroomRoutes;
