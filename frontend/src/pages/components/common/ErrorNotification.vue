<template>
  <div v-if="error" class="error-notification">
    <div class="error-content">
      <span class="error-icon">⚠️</span>
      <span class="error-message">{{ error }}</span>
    </div>
    <button v-if="dismissible" @click="$emit('dismiss')" class="dismiss-button">×</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  error: string;
  dismissible?: boolean;
}>();

defineEmits<{
  (e: 'dismiss'): void;
}>();
</script>

<style scoped>
.error-notification {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin: 0.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-icon {
  font-size: 1.25rem;
}

.error-message {
  color: #991b1b;
  font-size: 0.875rem;
}

.dismiss-button {
  background: none;
  border: none;
  color: #991b1b;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 0.5rem;
}

.dismiss-button:hover {
  opacity: 0.8;
}
</style> 