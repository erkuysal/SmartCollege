<template>
  <v-app>
    <!-- Sidebar Component -->
    <div class="sidebar-wrapper">
      <SideBar :open="drawer" @toggle="drawer = !drawer" />
    </div>
    
    <!-- App Bar -->
    <v-app-bar flat class="px-3 app-bar">
      <v-spacer></v-spacer>
      
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
          ></v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="main-content">
      <v-container fluid class="pa-4 main-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>

    <!-- RFID Scanner Dialog -->
    <v-dialog v-model="rfidScannerOpen" max-width="400">
      <v-card class="border-radius-lg">
        <v-card-title class="bg-primary text-white">
          <v-icon color="white" class="mr-2">mdi-credit-card-scan</v-icon>
          RFID Scanner
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="mb-4">Scan an RFID card to identify a user.</p>
          <div v-if="isScanning" class="scanning-animation mt-4">
            <v-icon>mdi-sync</v-icon>
            <span>Scanning...</span>
          </div>
          <div v-if="scanResult" class="mt-4 pa-3" :class="'error' in scanResult ? 'bg-error-lighten-5' : 'bg-success-lighten-5'">
            <div class="d-flex align-center">
              <v-icon :color="'error' in scanResult ? 'error' : 'success'" class="mr-2">
                {{ 'error' in scanResult ? 'mdi-alert-circle' : 'mdi-check-circle' }}
              </v-icon>
              <strong>{{ 'error' in scanResult ? scanResult.error : 'Card scanned successfully' }}</strong>
            </div>
            <div v-if="!('error' in scanResult) && scanResult.user" class="mt-2">
              <div><strong>Name:</strong> {{ scanResult.user.username }}</div>
              <div><strong>Email:</strong> {{ scanResult.user.email }}</div>
              <div><strong>Role:</strong> {{ scanResult.user_type }}</div>
              <div><strong>User Code:</strong> {{ scanResult.user_code }}</div>
              <div v-if="scanResult.rfid" class="mt-2">
                <div><strong>Card Status:</strong> {{ scanResult.rfid.card_status_display }}</div>
                <div><strong>Last Used:</strong> {{ new Date(scanResult.rfid.last_used_at).toLocaleString() }}</div>
              </div>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/utils/stores/users/authStore';
import { useRFIDStore } from '@/utils/stores/utilities/RFIDStore';
import type { RFIDResponse } from '@/utils/interfaces/utilities/RFIDInterface';
import SideBar from '@/pages/components/SideBar.vue';
import '@/assets/styles/sharedStyles.css';

// Router
const router = useRouter();
const route = useRoute();

// Stores
const authStore = useAuthStore();
const rfidStore = useRFIDStore();

// Navigation drawer state
const drawer = ref(true);
const rail = ref(false);

// Search functionality
const search = ref('');

// RFID scanner
const rfidScannerOpen = ref(false);
const scanResult = ref<RFIDResponse | { error: string } | null>(null);
const isScanning = ref(false);

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

const notificationCount = computed(() => notifications.value.length);

// Layout persistence
const LAYOUT_STATE_KEY = 'dashboard-layout-state';

// Load saved layout state
onMounted(() => {
  const savedState = localStorage.getItem(LAYOUT_STATE_KEY);
  if (savedState) {
    const { drawer: savedDrawer, rail: savedRail } = JSON.parse(savedState);
    drawer.value = savedDrawer;
    rail.value = savedRail;
  }
});

// Save layout state on changes
const saveLayoutState = () => {
  localStorage.setItem(LAYOUT_STATE_KEY, JSON.stringify({
    drawer: drawer.value,
    rail: rail.value
  }));
};

// Watch for changes and save state
watch([drawer, rail], () => {
  saveLayoutState();
});

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
  scanResult.value = null;
  isScanning.value = true;
  handleRFIDScan();
}

async function handleRFIDScan() {
  try {
    const result = await rfidStore.readRFID();
    scanResult.value = result;
    if (result.user && result.user_type) {
      // Navigate to the appropriate user details page based on user_type
      switch (result.user_type) {
        case 'Student':
          router.push(`/dashboard/students/${result.user.id}`);
          break;
        case 'Lecturer':
          router.push(`/dashboard/lecturers/${result.user.id}`);
          break;
        case 'Staff':
          router.push(`/dashboard/staff/${result.user.id}`);
          break;
        case 'Admin':
          router.push(`/dashboard/admins/${result.user.id}`);
          break;
        default:
          console.warn('Unknown user type:', result.user_type);
      }
    }
  } catch (error) {
    console.error('RFID scan error:', error);
    scanResult.value = {
      error: error instanceof Error ? error.message : 'Error scanning RFID card'
    };
  } finally {
    isScanning.value = false;
  }
}

function dismissNotification(index: number) {
  notifications.value.splice(index, 1);
}

function clearAllNotifications() {
  notifications.value = [];
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
.sidebar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
}

.app-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.main-content {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-left: 250px; /* Width of sidebar */
  transition: margin-left 0.3s ease;
}

.main-container {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 64px; /* Space for footer */
  margin-top: 64px; /* Height of app bar */
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .main-content {
    margin-left: 0;
  }

  .main-container {
    padding: 16px;
  }
}

@media (max-width: 600px) {
  .main-container {
    padding: 12px;
  }
}

/* Ensure content is visible on mobile */
:deep(.v-main) {
  padding-top: 0 !important; /* Remove default padding since we're using margin */
}

/* Improve touch scrolling on mobile */
:deep(.v-main__wrap) {
  -webkit-overflow-scrolling: touch;
}

/* Adjust app bar position when sidebar is open on mobile */
:deep(.v-app-bar) {
  left: 250px;
  transition: left 0.3s ease;
}

@media (max-width: 960px) {
  :deep(.v-app-bar) {
    left: 0;
  }
}
</style>
