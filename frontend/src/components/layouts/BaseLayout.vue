<template>
  <v-layout>
    <SideBar />
    <v-main>
      <!-- App Bar -->
      <v-app-bar
        elevation="1"
        class="app-bar"
      >
        <!-- Breadcrumbs -->
        <v-breadcrumbs
          :items="breadcrumbs"
          class="mx-4"
        >
          <template v-slot:divider>
            <v-icon icon="mdi-chevron-right" size="small" />
          </template>
        </v-breadcrumbs>

        <v-spacer />
        <v-btn
          color="primary"
          prepend-icon="mdi-credit-card-scan"
          @click="handleScanCard"
          :loading="isScanning"
          :disabled="isScanning"
        >
          {{ isScanning ? 'Scanning...' : 'Scan Card' }}
        </v-btn>
      </v-app-bar>

      <!-- Main Content -->
      <v-container class="py-4">
        <!-- Page Content -->
        <router-view v-slot="{ Component }" :key="String(route.params.id || route.fullPath)">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>

    <!-- Notifications Menu -->
    <v-menu
      v-model="showNotifications"
      :close-on-content-click="false"
      location="bottom end"
    >
      <v-card min-width="300">
        <v-card-title class="d-flex align-center">
          Notifications
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showNotifications = false"
          />
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="notification in notifications"
              :key="notification.id"
              :title="notification.title"
              :subtitle="notification.message"
              :prepend-icon="notification.icon"
            />
          </v-list>
        </v-card-text>
      </v-card>
    </v-menu>

    <!-- User Menu -->
    <v-menu
      v-model="showUserMenu"
      :close-on-content-click="false"
      location="bottom end"
    >
      <v-card min-width="200">
        <v-list>
          <v-list-item
            prepend-icon="mdi-account"
            title="Profile"
            @click="navigateToProfile"
          />
          <v-list-item
            prepend-icon="mdi-cog"
            title="Settings"
            @click="navigateToSettings"
          />
          <v-divider />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Logout"
            @click="handleLogout"
          />
        </v-list>
      </v-card>
    </v-menu>

    <!-- Scanning Overlay -->
    <v-overlay
      v-model="isScanning"
      class="align-center justify-center"
      persistent
      scrim="#1b2431"
      scrim-class="opacity-75"
    >
      <div class="scanning-container">
        <div class="scanning-animation">
          <div class="scanning-line"></div>
        </div>
        <v-card
          class="scanning-card pa-6 text-center"
          color="primary"
          width="400"
          elevation="8"
        >
          <v-icon
            icon="mdi-credit-card-scan"
            size="48"
            color="white"
            class="mb-4"
          />
          <div class="text-h5 font-weight-bold text-white mb-2">
            Scanning Card
          </div>
          <div class="text-body-1 text-white mb-4">
            Please hold the card near the reader
          </div>
          <v-progress-circular
            indeterminate
            color="white"
            size="32"
            width="3"
          />
        </v-card>
      </div>
    </v-overlay>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="uiStore.snackbar.show"
      :color="uiStore.snackbar.color"
      :timeout="3000"
      @update:model-value="val => { if (!val) uiStore.hideSnackbar() }"
    >
      {{ uiStore.snackbar.text }}
    </v-snackbar>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import SideBar from './SideBar.vue'
import { getStudents, type Student, getLecturers, type Lecturer, getStudent, getLecturer } from '@/client/api.ts'
import { useRfidStore } from '@/client/stores/rfid.ts'
import { useUIStore } from '@/client/stores/ui.ts'
import { useCoursesStore } from '@/client/stores/courses.ts'

// Types
interface Breadcrumb {
  title: string
  to: RouteLocationRaw
}

interface Notification {
  id: number
  title: string
  message: string
  icon: string
}

interface UserIdentifier {
  type: 'student' | 'lecturer'
  number: string
}

// State
const showNotifications = ref(false)
const showUserMenu = ref(false)
const isScanning = ref(false)
const currentUserIdentifier = ref<UserIdentifier | null>(null)

// Stores
const coursesStore = useCoursesStore()

// Mock notifications - replace with actual data
const notifications = ref<Notification[]>([
  {
    id: 1,
    title: 'New Attendance Record',
    message: 'John Doe marked present in Session 1',
    icon: 'mdi-check-circle'
  },
  {
    id: 2,
    title: 'Session Started',
    message: 'Session 2 has started',
    icon: 'mdi-play-circle'
  }
])

// Computed
const route = useRoute()
const router = useRouter()
const rfidStore = useRfidStore()
const uiStore = useUIStore()

// Watch for route changes to fetch user identifier when needed
watch(() => route.params.id, async (newId) => {
  if (newId) {
    try {
      if (route.path.startsWith('/students/')) {
        const response = await getStudent(Number(newId))
        currentUserIdentifier.value = {
          type: 'student',
          number: response.data.student_number
        }
      } else if (route.path.startsWith('/lecturers/')) {
        const response = await getLecturer(Number(newId))
        currentUserIdentifier.value = {
          type: 'lecturer',
          number: response.data.lecturer_number
        }
      }
    } catch (err) {
      currentUserIdentifier.value = null
    }
  } else {
    currentUserIdentifier.value = null
  }
}, { immediate: true })

const breadcrumbs = computed<Breadcrumb[]>(() => {
  const paths = route.path.split('/').filter(Boolean)
  const result = [
    { title: 'Home', to: '/' },
  ]

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    const isUserDetails = (path === 'students' || path === 'lecturers') &&
                         paths[i + 1] &&
                         !isNaN(Number(paths[i + 1]))
    const isCourseDetails = path === 'courses' &&
                          paths[i + 1] &&
                          !isNaN(Number(paths[i + 1]))

    if (isUserDetails) {
      // For user details, we'll show the user number in the breadcrumb
      result.push({
        title: path.charAt(0).toUpperCase() + path.slice(1),
        to: `/${path}`
      })
      // Add the user number if available
      if (currentUserIdentifier.value) {
        result.push({
          title: currentUserIdentifier.value.number,
          to: route.fullPath
        })
      }
      break
    } else if (isCourseDetails) {
      // For course details, we'll show the course name in the breadcrumb
      result.push({
        title: path.charAt(0).toUpperCase() + path.slice(1),
        to: `/${path}`
      })
      // Add the course name if available
      const courseId = Number(paths[i + 1])
      const course = coursesStore.getCourseById(courseId)
      if (course) {
        result.push({
          title: course.name,
          to: route.fullPath
        })
      }
      break
    } else {
      result.push({
        title: path.charAt(0).toUpperCase() + path.slice(1),
        to: '/' + paths.slice(0, i + 1).join('/')
      })
    }
  }

  return result
})

// Methods
const navigateToProfile = () => {
  router.push('/profile')
  showUserMenu.value = false
}

const navigateToSettings = () => {
  router.push('/settings')
  showUserMenu.value = false
}

const handleLogout = () => {
  // Implement logout logic
  showUserMenu.value = false
}

// Helper: Find user by card number
function findUserByCard(users: any[], number: string) {
  return users.find(u => u.user_number === number)
}

// Helper: Lookup all users by card
async function lookupAllUsersByCard(number: string) {
  const [students, lecturers] = await Promise.all([getStudents(), getLecturers()])
  return [
    ...students.data.results.map((u: any) => ({ ...u, type: 'student' })),
    ...lecturers.data.results.map((u: any) => ({ ...u, type: 'lecturer' }))
  ]
}

// Helper: Promise timeout
function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
  let timer: any
  return Promise.race([
    promise,
    new Promise<T>((_, rej) => {
      timer = setTimeout(() => rej(new Error(timeoutMessage)), ms)
    })
  ]).finally(() => clearTimeout(timer))
}

const handleScanCard = async () => {
  isScanning.value = true
  uiStore.setLoading && uiStore.setLoading(true)
  rfidStore.resetState()
  try {
    // Add timeout for hardware read
    const { student_number: number } = await withTimeout(rfidStore.scanRFID(), 8000, 'RFID read timed out') || {}
    if (!number) throw new Error('No card data received')

    const allUsers = await lookupAllUsersByCard(number)
    const user = findUserByCard(allUsers, number)
    if (!user) throw new Error('No user found with this card')

    await router.push(`/${user.type}s/${user.id}`)
    uiStore.showSnackbar && uiStore.showSnackbar(`Found ${user.type}: ${user.first_name} ${user.last_name}`)
  } catch (err: any) {
    uiStore.showError && uiStore.showError(err.message || 'Failed to scan card')
  } finally {
    isScanning.value = false
    uiStore.setLoading && uiStore.setLoading(false)
  }
}
</script>

<style lang="scss" scoped>
@use '../../styles/theme/index' as theme;

.app-bar {
  border-bottom: 1px solid theme.$theme-border-light;
  background: theme.$theme-surface-1 !important;
}

.app-bar :deep(.v-breadcrumbs) {
  padding: 0;
}

.app-bar :deep(.v-breadcrumbs-item) {
  font-size: theme.$font-size-sm;
  color: theme.$theme-text-secondary !important;
}

.app-bar :deep(.v-breadcrumbs-item--active) {
  color: theme.$theme-text-primary !important;
}

.app-bar :deep(.v-icon) {
  color: theme.$theme-text-secondary !important;
}

.app-bar :deep(.v-btn) {
  text-transform: none !important;
  font-weight: theme.$font-weight-medium !important;
  letter-spacing: -0.2px !important;
  font-size: theme.$font-size-sm !important;
}

:deep(.v-main) {
  background-color: theme.$theme-surface-0;
}

:deep(.v-menu .v-card) {
  background-color: theme.$theme-surface-1 !important;
  border-radius: theme.$border-radius-lg !important;
  box-shadow: 0 8px 32px theme.$theme-shadow-color !important;
}

:deep(.v-menu .v-card-title) {
  color: theme.$theme-text-primary !important;
  font-size: theme.$font-size-lg !important;
  font-weight: theme.$font-weight-semibold !important;
  letter-spacing: -0.5px !important;
}

:deep(.v-menu .v-list) {
  background-color: theme.$theme-surface-1 !important;
  padding: theme.$spacing-sm !important;
}

:deep(.v-menu .v-list-item) {
  color: theme.$theme-text-primary !important;
  border-radius: theme.$border-radius-md !important;
  margin-bottom: theme.$spacing-xs !important;
}

:deep(.v-menu .v-list-item:hover) {
  background-color: theme.$theme-surface-2 !important;
}

:deep(.v-menu .v-list-item-title) {
  font-size: theme.$font-size-sm !important;
  font-weight: theme.$font-weight-medium !important;
}

:deep(.v-menu .v-divider) {
  border-color: theme.$theme-border-light !important;
  margin: theme.$spacing-xs 0 !important;
}

:deep(.v-menu .v-icon) {
  color: theme.$theme-text-secondary !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: all theme.$theme-transition-normal;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .v-container {
    padding: theme.$spacing-lg;
  }
  .app-bar :deep(.v-breadcrumbs) {
    display: none;
  }
}

.scanning-container {
  position: relative;
  width: 400px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scanning-animation {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: theme.$border-radius-lg;
}

.scanning-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, theme.$theme-primary, transparent);
  animation: scan 2s linear infinite;
  box-shadow: 0 0 8px theme.$theme-primary;
}

@keyframes scan {
  0% {
    top: 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

.scanning-card {
  position: relative;
  z-index: 1;
  background: rgba(33, 150, 243, 0.95) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
