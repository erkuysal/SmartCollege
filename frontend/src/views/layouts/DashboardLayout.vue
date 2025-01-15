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
        v-model:selected="selectedIndex"
        class="sidebar-nav flex-grow-1"
      >
        <v-list-item
          v-for="(item, i) in navItems"
          :key="i"
          :value="i"
        class="sidebar-item"
        @click="navigateTo(i)"
        >
        <!-- Icon + Title on the same line, horizontally -->
        <div class="d-flex align-center" style="gap: 8px;">
          <v-icon>{{ item.icon }}</v-icon>
          <span>{{ item.title }}</span>
        </div>
        </v-list-item>
      </v-list>

      <v-spacer />
      <!-- No bottom button in this version -->
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

      <!-- Example icons: Search, Notifications, Settings -->
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
      <v-container fluid class="py-4 px-4">
        <router-view />
      </v-container>
    </v-main>

    <v-footer
      class="college-dark text-center px-4"
      height="40"
      app
    >
      <span class="text-white text-caption mx-auto">
        © 2023 MyCollege. All rights reserved.
      </span>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

import {useStudentStore} from "@/utils/stores/studentStore";

// Drawer / Sidebar State
const drawerOpen = ref(true)
const drawerWidth = 260

// Mobile detection (optional)
const { smAndDown } = useDisplay()
const isMobile = computed(() => smAndDown.value)

// Example user info
const userName = ref('John Smith')
const userRole = ref('Administrator')

// Page Title + Subtitle
const pageTitle = ref('Admin Dashboard')

// Navigation items for the left sidebar
const navItems = [
  { title: 'Students',    icon: 'mdi-account-multiple',   route: '/admin/students' },
  { title: 'Staff',       icon: 'mdi-account-group',      route: '/admin/staff' },
  { title: 'Courses',     icon: 'mdi-book-open-variant',  route: '/admin/courses' },
  { title: 'Classrooms',  icon: 'mdi-city-variant-outline', route: '/admin/classrooms' },
  { title: 'Departments', icon: 'mdi-office-building',    route: '/admin/departments' },
  { title: 'Tasks',       icon: 'mdi-clipboard-text',     route: '/admin/tasks' },
  { title: 'Events',      icon: 'mdi-calendar-outline',   route: '/admin/events' },
]

// Track which nav item is selected
const selectedNav = ref(0)

// Router
const router = useRouter()

// Toggle the drawer
function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value
}

// On create course click (example)
function onCreateCourse() {
  console.log('Add Course clicked')
}

// Handling nav click -> update selected + route
function navigateTo(i: number) {
  router.push(navItems[i].route)
}

/**
 * handleReadRFID:
 *   If you have a store function that reads an RFID, call it here,
 *   then navigate to, for example, a Student Info page.
 */
// If you have a store, uncomment and adapt:
const studentStore = useStudentStore()
const { readRFID } = studentStore

async function handleReadRFID() {
  try {
    const student_number = await readRFID()
    if (student_number) {
      console.log("Scanned student number:", student_number)

      await router.push({
        name: "studentInfo",
        params: { student_number },
      })
    } else {
      console.warn("No student_number returned from readRFID")
    }
  } catch (err) {
    console.error("Error reading RFID:", err)
  }
}
</script>

<style scoped>
/* Dark background for sidebar */
.college-dark {
  background-color: #25303B !important;
}

/* Make list item text white by default */
.v-list-item-title {
  color: #fff;
}

/* Provide a bit more visible highlight when an item is selected */
.v-list-item--active {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* Adjust the color of icons in the sidebar */
.v-list-item--active .v-icon {
  color: #fff !important;
}

/* Example: override text for user role or small text in the drawer */
.text-grey-lighten-3 {
  color: rgba(255, 255, 255, 0.6) !important;
}
</style>
