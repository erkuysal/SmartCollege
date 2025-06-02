<template>
  <div>
    <!-- Hamburger button for mobile -->
    <button class="sidebar-toggle" @click="$emit('toggle')" v-if="isMobile">
      <span class="icon">☰</span>
    </button>
    <aside :class="['sidebar', { open: open, mobile: isMobile }]">
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-item">
          <span class="icon">📊</span>
          <span class="text">Dashboard</span>
        </router-link>
        
        <div class="nav-section">
          <h3 class="section-title">User Management</h3>
          <router-link to="/dashboard/users/base" class="nav-item">
            <span class="icon">👥</span>
            <span class="text">Base Users</span>
          </router-link>
          <router-link to="/dashboard/users/staff" class="nav-item">
            <span class="icon">👨‍💼</span>
            <span class="text">Staff</span>
          </router-link>
          <router-link to="/dashboard/users/lecturers" class="nav-item">
            <span class="icon">👨‍🏫</span>
            <span class="text">Lecturers</span>
          </router-link>
          <router-link to="/dashboard/users/students" class="nav-item">
            <span class="icon">👨‍🎓</span>
            <span class="text">Students</span>
          </router-link>
        </div>

        <div class="nav-section">
          <h3 class="section-title">Academic</h3>
          <router-link to="/dashboard/academics/attendance" class="nav-item">
            <span class="icon">📝</span>
            <span class="text">Attendance</span>
          </router-link>
          <router-link to="/dashboard/academics/enrollments" class="nav-item">
            <span class="icon">📚</span>
            <span class="text">Enrollments</span>
          </router-link>
          <router-link to="/dashboard/academics/terms" class="nav-item">
            <span class="icon">📅</span>
            <span class="text">Terms</span>
          </router-link>
        </div>

        <div class="nav-section">
          <h3 class="section-title">College</h3>
          <router-link to="/dashboard/college/departments" class="nav-item">
            <span class="icon">🏛️</span>
            <span class="text">Departments</span>
          </router-link>
          <router-link to="/dashboard/college/courses" class="nav-item">
            <span class="icon">📖</span>
            <span class="text">Courses</span>
          </router-link>
          <router-link to="/dashboard/college/classrooms" class="nav-item">
            <span class="icon">🏫</span>
            <span class="text">Classrooms</span>
          </router-link>
        </div>
      </nav>
    </aside>
    <!-- Overlay for mobile when sidebar is open -->
    <div v-if="isMobile && open" class="sidebar-overlay" @click="$emit('toggle')"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
const props = defineProps<{ open: boolean }>();
const emit = defineEmits(['toggle']);

const isMobile = ref(false);

function handleResize() {
  isMobile.value = window.innerWidth < 960;
}

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
  padding: 1rem;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  transition: transform 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}
.sidebar.mobile {
  transform: translateX(-100%);
}
.sidebar.mobile.open {
  transform: translateX(0);
}
.sidebar:not(.mobile) {
  transform: translateX(0);
}
.sidebar-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1100;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 0.75rem;
  font-size: 1.5rem;
  cursor: pointer;
  display: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
@media (max-width: 959px) {
  .sidebar-toggle {
    display: block;
  }
  .sidebar {
    width: 250px;
    transform: translateX(-100%);
    height: 100vh;
    overflow: hidden; /* Prevent double scrollbars */
  }
  .sidebar.open {
    transform: translateX(0);
  }
}
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}
.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 64px; /* Space for app bar */
  overflow-y: auto;
  flex: 1;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}
.nav-section {
  margin-top: 1.5rem;
}
.section-title {
  font-size: 0.875rem;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
  text-decoration: none;
  color: #e5e7eb;
  transition: background-color 0.2s;
}
.nav-item:hover {
  background-color: #2d2d2d;
}
.nav-item.router-link-active {
  background-color: #3b82f6;
  color: white;
}
.icon {
  font-size: 1.25rem;
}
.text {
  font-size: 0.875rem;
}
/* Ensure sidebar is above other content */
:deep(.v-navigation-drawer) {
  z-index: 1000;
}
</style> 