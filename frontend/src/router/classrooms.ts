import ClassroomsPage from "@/views/pages/depot/ClassroomsPage.vue";
import ClassroomDetailPage from "@/views/pages/depot/ClassroomDetailPage.vue";

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
]

export default classroomRoutes;
