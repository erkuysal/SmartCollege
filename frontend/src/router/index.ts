import { createRouter, createWebHistory } from 'vue-router';

// route Imports
import managementRoutes from '@/router/management'
import classroomRoutes from "@/router/classrooms";

// Routes
const routes = [
  ...managementRoutes,
  ...classroomRoutes,
];

// Route Configurations
const router = createRouter({
  history: createWebHistory(),
  routes,
});



export default router;
