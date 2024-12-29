import { createRouter, createWebHistory } from 'vue-router';

// route Imports
import managementRoutes from '@/router/management'

// Routes
const routes = [
  ...managementRoutes,
];

// Route Configurations
const router = createRouter({
  history: createWebHistory(),
  routes,
});



export default router;
