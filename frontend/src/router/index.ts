import { createRouter, createWebHistory } from 'vue-router';
import type { Router } from 'vue-router';
import BaseLayout from '@/components/layouts/BaseLayout.vue';
import {
  userRoutes,
  academicRoutes,
  attendanceRoutes,
  infrastructureRoutes,
  walletRoutes
} from './routes';
import OverviewView from '@/views/OverviewView.vue';

const routes = [
  {
    path: '/',
    component: BaseLayout,
    children: [
      { path: '', redirect: '/overview' },
      { path: 'overview', component: OverviewView },
      ...attendanceRoutes,
      ...userRoutes,
      ...academicRoutes,
      ...infrastructureRoutes,
      ...walletRoutes
    ],
  },
];

const router: Router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
