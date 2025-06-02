<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mainNavItems, managementItems } from '@/utils/navigation';
import '@/assets/styles/sharedStyles.css';

// Get current route to check active status
const route = useRoute();
const router = useRouter();

// Props
const props = defineProps({
  drawer: {
    type: Boolean,
    default: true
  },
  rail: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['update:rail', 'update:drawer']);

// Computed properties
const hasManagementAccess = computed(() => {
  // This would come from an auth store in a real app
  return true; // For demo purposes
});

// Determine if a route is active, even for nested routes
const isActive = (routeName: string) => {
  // Currently active route name
  const currentRouteName = route.name?.toString() || '';
  
  // Check exact route name match
  if (currentRouteName === routeName) {
    return true;
  }
  
  // Check if current route is a child of this route
  // For example, if we're on 'student-details' and the nav item is 'students'
  if (routeName === 'students' && currentRouteName.includes('student')) {
    return true;
  }
  
  if (routeName === 'lecturers' && currentRouteName.includes('lecturer')) {
    return true;
  }
  
  return false;
};

// Methods
function toggleRail() {
  emit('update:rail', !props.rail);
}

function navigateTo(routeName: string) {
  router.push({ name: routeName });
}
</script>

<template>
  <v-navigation-drawer
    :model-value="drawer"
    @update:model-value="$emit('update:drawer', $event)"
    :rail="rail"
    permanent
    theme="dark"
    class="sidebar-background"
    width="220"
    :rail-width="56"
  >
    <!-- Logo -->
    <div class="d-flex align-center pa-4" :class="{ 'justify-center': rail }">
      <v-avatar color="white" :size="rail ? 32 : 36" :class="rail ? '' : 'mr-3'">
        <v-icon color="primary" :size="rail ? 20 : 24">mdi-school</v-icon>
      </v-avatar>
      <h1 v-if="!rail" class="text-h6 font-weight-bold text-white mb-0">
        Smart College
      </h1>
    </div>

    <v-divider class="border-opacity-25"></v-divider>

    <!-- Main Navigation -->
    <v-list nav density="compact" class="pa-2">
      <v-list-subheader v-if="!rail" class="text-white text-opacity-75">MAIN</v-list-subheader>
      
      <v-list-item
        v-for="(item, i) in mainNavItems"
        :key="i"
        :to="item.to"
        :value="item.title"
        :prepend-icon="item.icon"
        :title="rail ? '' : item.title"
        color="primary"
        exact
        rounded="lg"
        class="mb-1"
        @click="navigateTo(item.to.name)"
      ></v-list-item>
    </v-list>

    <!-- Management Section -->
    <template v-if="hasManagementAccess">
      <v-divider class="border-opacity-25 mx-3"></v-divider>
      
      <v-list nav density="compact" class="pa-2">
        <v-list-subheader v-if="!rail" class="text-white text-opacity-75">MANAGEMENT</v-list-subheader>
        
        <v-list-item
          v-for="(item, i) in managementItems"
          :key="i"
          :to="item.to"
          :value="item.title"
          :prepend-icon="item.icon"
          :title="rail ? '' : item.title"
          color="primary"
          exact
          rounded="lg"
          class="mb-1"
          @click="navigateTo(item.to.name)"
        ></v-list-item>
      </v-list>
    </template>

    <!-- Toggle Button -->
    <template v-slot:append>
      <div class="pa-2">
        <v-btn
          block
          variant="tonal"
          :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          @click="toggleRail"
          size="small"
        ></v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.sidebar-background {
  z-index: 1000;
}
</style>