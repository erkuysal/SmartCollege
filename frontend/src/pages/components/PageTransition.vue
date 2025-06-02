<template>
  <transition name="fade" mode="out-in">
    <slot />
  </transition>
</template>

<script setup lang="ts">
// No script logic needed for a basic transition
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style> 