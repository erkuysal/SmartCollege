<template>
  <v-app>
    <!-- Sidebar (Navigation Drawer) -->
    <v-navigation-drawer
      v-model="drawerOpen"
      app
      :temporary="isMobile"
      :permanent="!isMobile"
      :width="drawerWidth"
      class="college-dark text-white"
    >
      <!-- User Info at the Top -->
      <div class="d-flex align-center px-4 py-4">
        <v-avatar size="48" class="mr-3">
          <img src="https://i.pravatar.cc/50?img=13" alt="User Avatar" />
        </v-avatar>
        <div>
          <div class="font-weight-medium">{{ userName }}</div>
          <div class="text-caption text-grey-lighten-3">{{ userRole }}</div>
        </div>
      </div>

      <v-divider class="my-2"></v-divider>

      <v-list
        lines="one"
        density="comfortable"
        select-strategy="single"
        :selected="[selectedIndex]"
        class="sidebar-nav flex-grow-1"
      >
        <v-list-item
          v-for="(item, i) in navItems"
          :key="i"
          :value="i"
          class="sidebar-item"
          :active="selectedIndex === i"
          @click="navigateTo(i)"
        >
          <div class="d-flex align-center" style="gap: 8px;">
            <v-icon>{{ item.icon }}</v-icon>
            <span>{{ item.title }}</span>
          </div>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Top App Bar -->
    <v-app-bar
      color="white"
      elevation="1"
      app
      height="60"
    >
      <v-app-bar-nav-icon
        class="mr-3"
        @click.stop="toggleDrawer"
      />
      <v-toolbar-title class="text-h6">{{ pageTitle }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- RFID Scan Button -->
      <v-btn icon @click="handleReadRFID">
        <v-icon>mdi-credit-card-scan</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>mdi-bell-outline</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>mdi-cog-outline</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <router-view />
    </v-main>

    <v-footer
      class="college-dark text-center px-4"
      height="40"
      app
    >
      <span class="text-white text-caption mx-auto">
        © {{ new Date().getFullYear() }} MyCollege. All rights reserved.
      </span>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useStudentStore } from "@/utils/stores/users/studentStore";
import { useTeacherStore } from "@/utils/stores/users/teacherStore";
import { useCollegeStore } from "@/utils/stores/collegeStore";

// Store instances
const studentStore = useStudentStore();
const teacherStore = useTeacherStore();
const collegeStore = useCollegeStore();

// Router
const router = useRouter();
const route = useRoute();

// Drawer state
const drawerOpen = ref(true);
const drawerWidth = 260;

// Mobile detection
const { smAndDown } = useDisplay();
const isMobile = computed(() => smAndDown.value);

// User info (should come from auth store in real app)
const userName = ref('John Smith');
const userRole = ref('Administrator');

// Navigation items
const navItems = [
  { title: 'Dashboard',   icon: 'mdi-view-dashboard',     route: '/admin/dashboard' },
  { title: 'Students',    icon: 'mdi-account-multiple',   route: '/admin/students' },
  { title: 'Staff',       icon: 'mdi-account-tie',        route: '/admin/staff' },
  { title: 'Courses',     icon: 'mdi-book-education',     route: '/admin/courses' },
  { title: 'Classrooms',  icon: 'mdi-door-closed',        route: '/admin/classrooms' },
  { title: 'Schedules',   icon: 'mdi-calendar-clock',     route: '/admin/schedules' },
  { title: 'Attendance',  icon: 'mdi-clipboard-check',    route: '/admin/attendance' },
];

// Update selectedIndex to be computed based on current route
const selectedIndex = computed(() => {
  const currentRoute = route.path;
  return navItems.findIndex(item => item.route === currentRoute);
});

// Computed page title based on current route
const pageTitle = computed(() => {
  const currentRoute = route.path;
  const currentNav = navItems.find(item => item.route === currentRoute);
  return currentNav?.title || 'Dashboard';
});

// Methods
function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value;
}

function navigateTo(i: number) {
  router.push(navItems[i].route);
}

async function handleReadRFID() {
  try {
    const student_number = await studentStore.readRFID();
    if (student_number) {
      console.log("Scanned student number:", student_number);
      await router.push({
        name: "studentInfo",
        params: { student_number },
      });
    }
  } catch (err) {
    console.error("Error reading RFID:", err);
  }
}

// Initial data loading
onMounted(async () => {
  try {
    await Promise.all([
      collegeStore.fetchClassrooms(),
      collegeStore.fetchCourses(),
    //collegeStore.fetchSchedules(),
      teacherStore.fetchTeachers(),
      studentStore.listAllStudents()
    ]);
  } catch (error) {
    console.error('Error loading initial data:', error);
  }
});
</script>

<style scoped>
.college-dark {
  background-color: #25303B !important;
}

.v-list-item-title {
  color: #fff;
}

.v-list-item--active {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.v-list-item--active .v-icon {
  color: #fff !important;
}

.text-grey-lighten-3 {
  color: rgba(255, 255, 255, 0.6) !important;
}

.sidebar-item {
  transition: background-color 0.2s ease;
}

.v-list-item--active {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.v-list-item--active .v-icon,
.v-list-item--active span {
  color: #fff !important;
}
</style>
