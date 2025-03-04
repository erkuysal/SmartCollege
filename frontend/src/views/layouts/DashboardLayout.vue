<template>
  <v-app>
    <!-- Sidebar (Navigation Drawer) -->
    <v-navigation-drawer
      v-model="drawer"
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
        nav
        :selected="[selectedIndex]"
        class="sidebar-nav flex-grow-1"
      >
        <v-list-item
          v-for="(item, i) in navItems"
          :key="i"
          :value="i"
          class="sidebar-item"
          :active="selectedIndex === i"
          @click="navigate(item.route)"
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
import { useAuthStore } from '../../utils/stores/users/authStore';
import { useStudentStore } from '../../utils/stores/users/studentStore';
import { useLecturerStore } from '../../utils/stores/users/lecturerStore';
import { useCourseStore } from '../../utils/stores/college/courseStore';
import { useClassroomStore } from '../../utils/stores/college/classroomStore';
import { useScheduleStore } from '../../utils/stores/college/scheduleStore';
import { useFacultyStore } from '../../utils/stores/college/facultyStore';

// Initialize stores
const authStore = useAuthStore();
const studentStore = useStudentStore();
const lecturerStore = useLecturerStore();
const courseStore = useCourseStore();
const classroomStore = useClassroomStore();
const scheduleStore = useScheduleStore();
const facultyStore = useFacultyStore();

// Router setup
const router = useRouter();
const route = useRoute();

// Navigation drawer state
const drawer = ref(true);
const drawerWidth = 260;
const isMobile = ref(window.innerWidth < 960);

// User information from auth store
const userName = computed(() => authStore.userName);
const userRole = computed(() => authStore.userRole);

// Navigation items
const navItems = ref([
  { title: 'Dashboard', icon: 'mdi-view-dashboard', route: '/admin/dashboard' },
  { title: 'Students', icon: 'mdi-account-school', route: '/admin/students' },
  { title: 'Lecturers', icon: 'mdi-teach', route: '/admin/lecturers' },
  { title: 'Courses', icon: 'mdi-book-open-variant', route: '/admin/courses' },
  { title: 'Classrooms', icon: 'mdi-google-classroom', route: '/admin/classrooms' },
  { title: 'Departments', icon: 'mdi-domain', route: '/admin/departments' },
  { title: 'Faculties', icon: 'mdi-office-building', route: '/admin/faculties' },
  { title: 'Attendance', icon: 'mdi-clipboard-check', route: '/admin/attendance' },
  { title: 'Events', icon: 'mdi-calendar-clock', route: '/admin/events' },
  { title: 'Tasks', icon: 'mdi-clipboard-text', route: '/admin/tasks' },
]);

// Computed properties
const selectedIndex = computed(() => {
  return navItems.value.findIndex(item => route.path.startsWith(item.route));
});

const pageTitle = computed(() => {
  const item = navItems.value.find(item => route.path.startsWith(item.route));
  return item ? item.title : 'Dashboard';
});

// Methods
function navigate(route: string) {
  console.log('Navigating to:', route);
  router.push(route);
}

function toggleDrawer() {
  drawer.value = !drawer.value;
}

function logout() {
  authStore.logout();
  router.push('/login');
}

async function handleReadRFID() {
  try {
    // Use the readRFIDCard method from the Pinia studentStore
    const cardId = 'sample-card-id';
    const result = await studentStore.readRFIDCard(cardId);
    
    if (result && result.success) {
      // After getting the card, we would need to fetch the student
      // This is a simplified example - in a real app, you would need to
      // implement a proper flow to get the student from the card ID
      console.log(`RFID card read successfully: ${result.cardId}`);
      
      // For now, just navigate to the students page with the correct path
      router.push('/admin/students');
    }
  } catch (error) {
    console.error("Error handling RFID scan:", error);
  }
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 960;
    if (isMobile.value) {
      drawer.value = false;
    }
  });

  // Fetch initial data
  Promise.all([
    courseStore.fetchCourses(),
    scheduleStore.fetchSchedules(),
    lecturerStore.fetchLecturers(),
    studentStore.fetchStudents(),
    facultyStore.fetchFaculties()
  ]).then(() => {
    console.log('All data loaded successfully');
    // Don't reset stores immediately after fetching data
    // This was causing the data to disappear right after loading
  }).catch(error => {
    console.error('Error loading initial data:', error);
  });
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
