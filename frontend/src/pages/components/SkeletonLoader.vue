<template>
  <div class="skeleton-loader" :style="{ width: width, height: height }">
    <div class="shimmer"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  width?: string;
  height?: string;
}>();
</script>

<style scoped>
.skeleton-loader {
  background-color: #e5e7eb;
  border-radius: 0.25rem;
  position: relative;
  overflow: hidden;
}

.shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style> 