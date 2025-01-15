import { createRouter, createWebHistory } from 'vue-router';

// route Imports
// import managementRoutes from '@/router/management'
// import classroomRoutes from "@/router/classrooms";
import dashboardRoutes from "@/router/dashboard";

// Routes
const routes = [
  // ...managementRoutes,
  // ...classroomRoutes,
  ...dashboardRoutes,
];

// Route Configurations
const router = createRouter({
  history: createWebHistory(),
  routes,
});



export default router;
