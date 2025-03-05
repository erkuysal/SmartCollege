<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      theme="dark"
      class="sidebar-background"
      width="260"
      :rail-width="56"
    >
      <!-- App Logo and Title -->
      <div class="d-flex align-center pa-4" :class="{ 'justify-center': rail }">
        <v-avatar
          color="white"
          :size="rail ? 32 : 36"
          :class="rail ? '' : 'mr-3'"
        >
          <v-icon color="primary" :size="rail ? 20 : 24">mdi-school</v-icon>
        </v-avatar>
        <h1 v-if="!rail" class="text-h6 font-weight-bold text-white mb-0">Smart College</h1>
      </div>

      <v-divider class="border-opacity-25"></v-divider>

      <!-- Navigation Menu -->
      <v-list nav density="compact" class="mt-2 pa-0">
        <v-list-subheader v-if="!rail" class="text-white text-opacity-75 px-3">MAIN NAVIGATION</v-list-subheader>
        
        <v-list-item
          v-for="(item, i) in navigationItems"
          :key="i"
          :to="item.to"
          :value="item.title"
          :prepend-icon="item.icon"
          :title="rail ? '' : item.title"
          active-color="primary"
          rounded="lg"
          class="mb-1"
          :class="rail ? 'justify-center' : 'px-3'"
          min-height="48"
        >
          <template v-slot:append v-if="!rail && item.badge">
            <v-chip size="x-small" :color="item.badgeColor || 'primary'" class="ml-2">
              {{ item.badge }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>

      <!-- Management Section -->
      <template v-if="hasManagementAccess">
        <v-divider class="border-opacity-25 mx-4 my-2"></v-divider>
        
        <v-list-subheader v-if="!rail" class="text-white text-opacity-75 px-3">MANAGEMENT</v-list-subheader>
        
        <v-list nav density="compact" class="pa-0">
          <v-list-group value="management">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-cog"
                :title="rail ? '' : 'Management'"
                rounded="lg"
                class="mb-1"
                :class="rail ? 'justify-center' : 'px-3'"
                min-height="48"
              ></v-list-item>
            </template>

            <v-list-item
              v-for="(item, i) in managementItems"
              :key="i"
              :to="item.to"
              :value="item.title"
              :prepend-icon="item.icon"
              :title="rail ? '' : item.title"
              rounded="lg"
              class="mb-1"
              :class="rail ? 'justify-center' : 'px-3'"
              min-height="48"
            ></v-list-item>
          </v-list-group>
        </v-list>
      </template>

      <!-- Bottom Actions -->
      <template v-slot:append>
        <div class="d-flex justify-center py-4">
          <!-- Collapse Button (icon only) -->
          <v-btn
            variant="text"
            icon
            size="small"
            @click.stop="rail = !rail"
            color="white"
          >
            <v-icon>{{ rail ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar flat class="px-3">
      <v-spacer></v-spacer>
      
      <!-- Search -->
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Search..."
        hide-details
        density="compact"
        variant="outlined"
        class="mx-4"
        style="max-width: 300px;"
        @keydown.enter="performSearch"
        clearable
      ></v-text-field>
      
      <!-- Notifications -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            class="mr-2"
          >
            <v-badge
              color="error"
              :content="notificationCount"
              :model-value="notificationCount > 0"
            >
              <v-icon>mdi-bell</v-icon>
            </v-badge>
          </v-btn>
        </template>
        <v-list width="320">
          <v-list-subheader>Notifications</v-list-subheader>
          <v-list-item
            v-for="(notification, index) in notifications"
            :key="index"
            :title="notification.title"
            :subtitle="notification.message"
            lines="two"
          >
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal">
                <v-icon>{{ notification.icon }}</v-icon>
              </v-avatar>
            </template>
            <template v-slot:append>
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                @click.stop="dismissNotification(index)"
              ></v-btn>
            </template>
          </v-list-item>
          <v-divider v-if="notifications.length > 0"></v-divider>
          <v-list-item v-if="notifications.length === 0">
            <v-list-item-title class="text-center">No new notifications</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="notifications.length > 0">
            <v-btn
              block
              variant="text"
              @click="clearAllNotifications"
            >
              Clear All
            </v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
      
      <!-- RFID Scanner -->
      <v-btn
        icon
        class="mr-2"
        @click="toggleRFIDScanner"
      >
        <v-icon>mdi-credit-card-scan</v-icon>
      </v-btn>
      
      <!-- User Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            class="text-none"
            variant="text"
          >
            <v-avatar size="32" color="primary" class="mr-2">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
            <span class="d-none d-sm-inline">{{ userFullName }}</span>
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list width="200">
          <v-list-item
            prepend-icon="mdi-account-circle"
            title="My Profile"
            @click="navigateTo('/profile')"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-cog"
            title="Settings"
            @click="navigateTo('/settings')"
          ></v-list-item>
          <v-divider></v-divider>
          <v-list-item
            prepend-icon="mdi-logout"
            title="Logout"
            @click="logout"
          ></v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <router-view />
    </v-main>

    <!-- RFID Scanner Dialog -->
    <v-dialog v-model="rfidScannerOpen" max-width="400">
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon color="white" class="mr-2">mdi-credit-card-scan</v-icon>
          RFID Scanner
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="mb-4">Scan an RFID card to identify a user.</p>
          <v-text-field
            v-model="rfidInput"
            label="RFID Card ID"
            autofocus
            @keydown.enter="handleRFIDScan"
            prepend-inner-icon="mdi-identifier"
            hint="Enter or scan RFID card ID"
            persistent-hint
          ></v-text-field>
          <div v-if="scanResult" class="mt-4 pa-3" :class="scanResult.success ? 'bg-success-lighten-5' : 'bg-error-lighten-5'">
            <div class="d-flex align-center">
              <v-icon :color="scanResult.success ? 'success' : 'error'" class="mr-2">
                {{ scanResult.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>
              <strong>{{ scanResult.message }}</strong>
            </div>
            <div v-if="scanResult.user" class="mt-2">
              <div><strong>Name:</strong> {{ scanResult.user.first_name }} {{ scanResult.user.last_name }}</div>
              <div><strong>Role:</strong> {{ scanResult.user.role }}</div>
              <div><strong>ID:</strong> {{ scanResult.user.id }}</div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="rfidScannerOpen = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Footer -->
    <v-footer app class="d-flex flex-column">
      <div class="px-4 py-2 text-center w-100">
        <span class="text-caption text-medium-emphasis">
          &copy; {{ new Date().getFullYear() }} Smart College Management System
        </span>
      </div>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../utils/stores/users/authStore';
import { useStudentStore } from '../../utils/stores/users/studentStore';

// Router
const router = useRouter();

// Stores
const authStore = useAuthStore();
const rfidStore = {
  scanRFID: async (cardId: string) => {
    console.log('Scanning RFID card:', cardId);
    // Mock implementation until the real store is available
    return {
      user: {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        role: 'Student'
      }
    };
  }
};

// Navigation drawer state
const drawer = ref(true);
const rail = ref(false);

// Search functionality
const search = ref('');

// RFID scanner
const rfidScannerOpen = ref(false);
const rfidInput = ref('');
const scanResult = ref<any>(null);

// Notifications
const notifications = ref([
  {
    title: 'New Course Added',
    message: 'Introduction to Computer Science has been added to the catalog',
    icon: 'mdi-book-plus'
  },
  {
    title: 'Attendance Alert',
    message: 'John Doe has missed 3 consecutive classes',
    icon: 'mdi-alert'
  }
]);

// Computed properties
const userFullName = computed(() => {
  const user = authStore.user;
  if (!user) return 'Guest User';
  return `${user.first_name} ${user.last_name}`;
});

const userRole = computed(() => {
  const user = authStore.user;
  if (!user) return 'Guest';
  return user.role || 'User';
});

const notificationCount = computed(() => notifications.value.length);

const hasManagementAccess = computed(() => {
  const user = authStore.user;
  if (!user) return false;
  return ['admin', 'staff'].includes(user.role);
});

// Navigation items
const navigationItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/admin/dashboard' },
  { title: 'Students', icon: 'mdi-account-school', to: '/admin/students' },
  { title: 'Lecturers', icon: 'mdi-account-tie', to: '/admin/lecturers' },
  { title: 'Courses', icon: 'mdi-book-open-variant', to: '/admin/courses', badge: 'New', badgeColor: 'success' },
  { title: 'Classrooms', icon: 'mdi-google-classroom', to: '/admin/classrooms' },
  { title: 'Departments', icon: 'mdi-domain', to: '/admin/departments' },
  { title: 'Faculties', icon: 'mdi-office-building', to: '/admin/faculties' },
  { title: 'Attendance', icon: 'mdi-calendar-check', to: '/admin/attendance' },
  { title: 'Timetable', icon: 'mdi-calendar-clock', to: '/admin/timetable' },
  { title: 'Grades', icon: 'mdi-chart-line', to: '/admin/grades' },
];

// Management items
const managementItems = [
  { title: 'Users', icon: 'mdi-account-group', to: '/admin/management/users' },
  { title: 'Courses', icon: 'mdi-book-multiple', to: '/admin/management/college/courses' },
  { title: 'Departments', icon: 'mdi-domain', to: '/admin/management/college/departments' },
  { title: 'Settings', icon: 'mdi-cog', to: '/admin/management/settings' },
];

// Methods
function navigateTo(path: string) {
  router.push(path);
}

function performSearch() {
  if (!search.value) return;
  
  console.log('Searching for:', search.value);
  // Implement global search functionality
  
  search.value = '';
}

function toggleRFIDScanner() {
  rfidScannerOpen.value = true;
  rfidInput.value = '';
  scanResult.value = null;
  
  // Focus the input field after dialog opens
  setTimeout(() => {
    const inputElement = document.querySelector('.v-dialog--active input');
    if (inputElement) {
      (inputElement as HTMLInputElement).focus();
    }
  }, 300);
}

async function handleRFIDScan() {
  if (!rfidInput.value) return;
  
  try {
    const result = await rfidStore.scanRFID(rfidInput.value);
    
    if (result && result.user) {
      scanResult.value = {
        success: true,
        message: 'User identified successfully',
        user: result.user
      };
    } else {
      scanResult.value = {
        success: false,
        message: 'No user found with this RFID card'
      };
    }
  } catch (error) {
    console.error('RFID scan error:', error);
    scanResult.value = {
      success: false,
      message: 'Error scanning RFID card'
    };
  }
}

function dismissNotification(index: number) {
  notifications.value.splice(index, 1);
}

function clearAllNotifications() {
  notifications.value = [];
}

async function logout() {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Lifecycle hooks
onMounted(() => {
  // Check screen size and adjust drawer accordingly
  const handleResize = () => {
    if (window.innerWidth < 960) {
      rail.value = true;
    }
  };
  
  window.addEventListener('resize', handleResize);
  handleResize(); // Initial check
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
});
</script>

<style scoped>
.sidebar-background {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

.v-list-item--active {
  font-weight: 600;
}

.v-navigation-drawer :deep(.v-list-item__prepend) {
  opacity: 1 !important;
}

.v-navigation-drawer :deep(.v-list-item--active) {
  background-color: rgba(255, 255, 255, 0.15);
}

.v-navigation-drawer :deep(.v-list-item:hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

.v-navigation-drawer.v-navigation-drawer--rail :deep(.v-list-item) {
  justify-content: center;
  padding-inline: 0;
}

.v-navigation-drawer.v-navigation-drawer--rail :deep(.v-list-item__prepend) {
  margin-inline-end: 0;
}

.v-navigation-drawer.v-navigation-drawer--rail :deep(.v-icon) {
  margin-inline: auto;
}

.v-navigation-drawer.v-navigation-drawer--rail {
  overflow: visible;
}
</style>
