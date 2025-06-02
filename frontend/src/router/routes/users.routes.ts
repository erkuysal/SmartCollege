import type { RouteRecordRaw } from 'vue-router';

const userRoutes: RouteRecordRaw[] = [
  {
    path: 'base',
    name: 'base',
    component: () => import('@/pages/users/Base.vue'),
    meta: {
      title: 'Base'
    }
  },
  {
    path: 'base/:id',
    name: 'base-details',
    component: () => import('@/pages/users/details/BaseDetails.vue'),
    props: true,
    meta: {
      title: 'Base Details'
    }
  },
  {
    path: 'staff',
    name: 'staff',
    component: () => import('@/pages/users/Staff.vue'),
    meta: {
      title: 'Staff'
    }
  },
  {
    path: 'staff/:id',
    name: 'staff-details',
    component: () => import('@/pages/users/details/StaffDetails.vue'),
    props: true,
    meta: {
      title: 'Staff Details'
    }
  },
  {
    path: 'lecturers',
    name: 'lecturers',
    component: () => import('@/pages/users/Lecturers.vue'),
    meta: {
      title: 'Lecturers'
    }
  },
  {
    path: 'lecturers/:id',
    name: 'lecturer-details',
    component: () => import('@/pages/users/details/LecturerDetails.vue'),
    props: true,
    meta: {
      title: 'Lecturer Details'
    }
  },
  {
    path: 'students',
    name: 'students',
    component: () => import('@/pages/users/Students.vue'),
    meta: {
      title: 'Students'
    }
  },
  {
    path: 'students/:id',
    name: 'student-details',
    component: () => import('@/pages/users/details/StudentDetails.vue'),
    props: true,
    meta: {
      title: 'Student Details'
    }
  }
];

export default userRoutes;
