import type { RouteRecordRaw } from 'vue-router';

const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: 'overview',
    name: 'dashboard-overview',
    component: () => import('@/pages/Dashboard.vue'),
    meta: {
      title: 'Dashboard'
    }
  }
];

export default dashboardRoutes; 