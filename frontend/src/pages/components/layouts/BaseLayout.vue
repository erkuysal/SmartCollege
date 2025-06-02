<template>
  <v-app>
    <!-- Sidebar / Navigation Drawer -->
    <v-navigation-drawer v-if="showSidebar" v-model="sidebarOpen" app>
      <slot name="sidebar">
        <!-- Default sidebar content if no slot content provided -->
        <v-list>
          <v-list-item title="Default Sidebar Item" />
        </v-list>
      </slot>
    </v-navigation-drawer>

    <!-- App Bar -->
    <slot name="app-bar">
      <v-app-bar flat class="px-3">
        <slot name="app-bar-prepend">
          <v-app-bar-nav-icon v-if="showSidebar" @click="sidebarOpen = !sidebarOpen"></v-app-bar-nav-icon>
        </slot>
        <v-spacer></v-spacer>
        <slot name="app-bar-content"></slot>
      </v-app-bar>
    </slot>

    <!-- Main Content -->
    <v-main>
      <slot></slot>
    </v-main>

    <!-- Footer -->
    <slot name="footer">
      <v-footer app class="d-flex flex-column" v-if="showFooter">
        <div class="px-4 py-2 text-center w-100">
          <slot name="footer-content">
            <span class="text-caption text-medium-emphasis">
              &copy; {{ currentYear }} Smart College Management System
            </span>
          </slot>
        </div>
      </v-footer>
    </slot>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

// Props
interface BaseLayoutProps {
  /**
   * Whether to show the footer
   */
  showFooter?: boolean;
  /**
   * Whether to show the app bar
   */
  showAppBar?: boolean;
  /**
   * Whether to show the sidebar
   */
  showSidebar?: boolean;
  /**
   * Initial state of the sidebar (open/closed)
   */
  sidebarOpenByDefault?: boolean;
}

const props = withDefaults(defineProps<BaseLayoutProps>(), {
  showFooter: true,
  showAppBar: true,
  showSidebar: true,
  sidebarOpenByDefault: true,
});

// Reactive state
const sidebarOpen = ref(props.sidebarOpenByDefault);

// Computed
const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
/* Base styles that apply to all layouts */
</style> 