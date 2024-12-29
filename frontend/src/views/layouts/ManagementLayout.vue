<!-- layouts/AdminLayout.vue -->
<template>
  <v-app>
    <!-- Top App Bar -->
    <v-app-bar
      color="primary"
      dark
      app
    >
      <v-app-bar-nav-icon @click="toggleDrawer" />
      <v-toolbar-title class="ml-5">
        Admin Dashboard
      </v-toolbar-title>
      <v-spacer />
      <!-- Optional: user icon or menu -->
      <v-btn :icon="mdi-account-circle">
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawerOpen"
      app
      :temporary="isMobile"
      :permanent="!isMobile"
    >
      <v-sheet class="mt-4 text-center">
        <v-list density="comfortable">
          <v-list-item to="/admin/students">
            <v-list-item-title>
              <v-icon>mdi-account-group</v-icon>
            </v-list-item-title>
            <v-list-item-title>Students</v-list-item-title>
          </v-list-item>

          <v-list-item to="/admin/register-student">
            <v-list-item-title>
              <v-icon>mdi-account-plus</v-icon>
            </v-list-item-title>
            <v-list-item-title>Register Student</v-list-item-title>
          </v-list-item>

          <v-list-item to="/admin/classrooms">
            <v-list-item-title>
              <v-icon>mdi-book-education</v-icon>
            </v-list-item-title>
            <v-list-item-title>Classrooms</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-sheet>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'

// Drawer state
const drawerOpen = ref(true)
function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value
}

// Determine if we’re on a small device
const { smAndDown } = useDisplay()
const isMobile = computed(() => smAndDown.value)
</script>

<style scoped>
.ml-2 {
  margin-left: 0.5rem;
}
.me-2 {
  margin-right: 0.5rem;
}
</style>
