import type { RouteRecordRaw } from 'vue-router';

const academicRoutes: RouteRecordRaw[] = [
  {
    path: 'attendance',
    name: 'attendance',
    component: () => import('@/pages/academics/Attendance.vue'),
    meta: {
      title: 'Attendance'
    }
  },
  {
    path: 'attendance/:id',
    name: 'attendance-details',
    component: () => import('@/pages/academics/details/AttendanceDetails.vue'),
    props: true,
    meta: {
      title: 'Attendance Details'
    }
  },
  {
    path: 'bindings',
    name: 'bindings',
    component: () => import('@/pages/academics/Bindings.vue'),
    meta: {
      title: 'Bindings'
    }
  },
  {
    path: 'bindings/:id',
    name: 'binding-details',
    component: () => import('@/pages/academics/details/BindingDetails.vue'),
    props: true,
    meta: {
      title: 'Binding Details'
    }
  },
  {
    path: 'enrollments',
    name: 'enrollments',
    component: () => import('@/pages/academics/Enrollments.vue'),
    meta: {
      title: 'Enrollments'
    }
  },
  {
    path: 'enrollments/:id',
    name: 'enrollment-details',
    component: () => import('@/pages/academics/details/EnrollmentDetails.vue'),
    props: true,
    meta: {
      title: 'Enrollment Details'
    }
  },
  {
    path: 'terms',
    name: 'terms',
    component: () => import('@/pages/academics/Terms.vue'),
    meta: {
      title: 'Terms'
    }
  },
  {
    path: 'terms/:id',
    name: 'term-details',
    component: () => import('@/pages/academics/details/TermDetails.vue'),
    props: true,
    meta: {
      title: 'Term Details'
    }
  }
];

export default academicRoutes;
