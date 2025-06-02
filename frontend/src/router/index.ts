import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import DashboardLayout from '@/pages/components/layouts/DashboardLayout.vue';
import BaseLayout from '@/pages/components/layouts/BaseLayout.vue';

// Import modular routes
import dashboardRoutes from './routes/dashboard.routes';
import userRoutes from './routes/users.routes';
import academicRoutes from './routes/academics.routes';
import collegeRoutes from './routes/college.routes';
import utilityRoutes from './routes/utilities.routes';

// Define base routes
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: BaseLayout,
    children: [
      {
        path: '',
        redirect: { name: 'dashboard' }
      },
      {
        path: 'setup',
        name: 'setup',
        component: () => import('@/pages/CreationSequencer.vue'),
        meta: {
          title: 'System Setup'
        }
      }
    ]
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/pages/Dashboard.vue'),
        meta: {
          title: 'Dashboard'
        }
      },
      // User Management Routes
      {
        path: 'users',
        name: 'users',
        meta: {
          title: 'User Management'
        },
        children: userRoutes
      },
      // Academic Management Routes
      {
        path: 'academics',
        name: 'academics',
        meta: {
          title: 'Academic Management'
        },
        children: academicRoutes
      },
      // College Management Routes
      {
        path: 'college',
        name: 'college',
        meta: {
          title: 'College Management'
        },
        children: collegeRoutes
      },
      // Utility Routes
      {
        path: 'utilities',
        name: 'utilities',
        meta: {
          title: 'Utilities'
        },
        children: utilityRoutes
      }
    ]
  },
  // Not found route
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFound.vue'),
    meta: {
      title: 'Page Not Found'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guards
router.beforeEach((to, from, next) => {
  // Set document title
  document.title = `SmartCollege | ${to.meta.title || 'Page'}`;
  next();
});

export default router; 