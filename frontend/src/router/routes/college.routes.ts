import type { RouteRecordRaw } from 'vue-router';

const collegeRoutes: RouteRecordRaw[] = [
  {
    path: 'classrooms',
    name: 'classrooms',
    component: () => import('@/pages/college/Classrooms.vue'),
    meta: {
      title: 'Classrooms'
    }
  },
  {
    path: 'classrooms/:id',
    name: 'classroom-details',
    component: () => import('@/pages/college/details/ClassroomDetails.vue'),
    props: true,
    meta: {
      title: 'Classroom Details'
    }
  },
  {
    path: 'courses',
    name: 'courses',
    component: () => import('@/pages/college/Courses.vue'),
    meta: {
      title: 'Courses'
    }
  },
  {
    path: 'courses/:id',
    name: 'course-details',
    component: () => import('@/pages/college/details/CourseDetails.vue'),
    props: true,
    meta: {
      title: 'Course Details'
    }
  },
  {
    path: 'departments',
    name: 'departments',
    component: () => import('@/pages/college/Departments.vue'),
    meta: {
      title: 'Departments'
    }
  },
  {
    path: 'departments/:id',
    name: 'department-details',
    component: () => import('@/pages/college/details/DepartmentDetails.vue'),
    props: true,
    meta: {
      title: 'Department Details'
    }
  },
  {
    path: 'facilities',
    name: 'facilities',
    component: () => import('@/pages/college/Facilities.vue'),
    meta: {
      title: 'Facilities'
    }
  },
  {
    path: 'facilities/:id',
    name: 'facility-details',
    component: () => import('@/pages/college/details/FacilityDetails.vue'),
    props: true,
    meta: {
      title: 'Facility Details'
    }
  },
  {
    path: 'faculties',
    name: 'faculties',
    component: () => import('@/pages/college/Faculties.vue'),
    meta: {
      title: 'Faculties'
    }
  },
  {
    path: 'faculties/:id',
    name: 'faculty-details',
    component: () => import('@/pages/college/details/FacultyDetails.vue'),
    props: true,
    meta: {
      title: 'Faculty Details'
    }
  },
  {
    path: 'schedules',
    name: 'schedules',
    component: () => import('@/pages/college/Schedules.vue'),
    meta: {
      title: 'Schedules'
    }
  },
  {
    path: 'schedules/:id',
    name: 'schedule-details',
    component: () => import('@/pages/college/details/ScheduleDetails.vue'),
    props: true,
    meta: {
      title: 'Schedule Details'
    }
  }
];

export default collegeRoutes;
