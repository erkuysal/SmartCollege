<template>
  <div class="app">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/client/stores/theme'
import { onMounted } from 'vue'

const themeStore = useThemeStore()

// Initialize theme on mount
onMounted(() => {
  // Apply theme class to document
  document.documentElement.classList.toggle('dark', themeStore.isDark)
})
</script>

<style lang="scss">
@use './styles/theme/' as theme;

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: theme.$theme-surface-0;
  color: theme.$theme-text-primary;
}

/* Modern Transition Effects */
.fade-enter-active,
.fade-leave-active {
  transition: theme.$theme-transition-normal;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(theme.$spacing-sm);
}

/* Modern Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: theme.$theme-surface-2;
}

::-webkit-scrollbar-thumb {
  background: theme.$theme-border-medium;
  border-radius: theme.$border-radius-full;
}

::-webkit-scrollbar-thumb:hover {
  background: theme.$theme-border-dark;
}
</style>
