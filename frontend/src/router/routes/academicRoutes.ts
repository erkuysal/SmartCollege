import type { RouteRecordRaw } from 'vue-router';
import CoursesView from '@/views/academics/CoursesView.vue';
import CourseDetailsView from '@/views/academics/CourseDetailsView.vue';
import SchedulesView from '@/views/academics/SchedulesView.vue';
import ScheduleDetailsView from '@/views/academics/ScheduleDetailsView.vue';
import CourseOfferingsView from '@/views/academics/CourseOfferingsView.vue';
import AcademicManagementView from '@/views/academics/AcademicManagementView.vue';

export const academicRoutes: RouteRecordRaw[] = [
  // Course routes
  { path: 'courses', component: CoursesView },
  { path: 'courses/:id', component: CourseDetailsView },

  // Schedule routes
  { path: 'schedules', component: SchedulesView },
  { path: 'schedules/:id', component: ScheduleDetailsView },

  // Course Offering routes
  { path: 'course-offerings', component: CourseOfferingsView },

  // Academic Settings routes
  { path: 'academic-settings', component: AcademicManagementView }
];
