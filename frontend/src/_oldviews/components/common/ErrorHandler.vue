<template>
  <ErrorNotification ref="notification" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import ErrorNotification from './ErrorNotification.vue';
import { processError, ErrorType } from '@/utils/helpers/errorHandler';
import { API_CONFIG } from '@/utils/config/environment';

const notification = ref<InstanceType<typeof ErrorNotification> | null>(null);

// Handle unhandled promise rejections
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  if (!API_CONFIG.ERROR_HANDLING.SHOW_ERROR_NOTIFICATIONS) return;
  
  event.preventDefault();
  const errorDetails = processError(event.reason);
  
  if (notification.value) {
    notification.value.show(errorDetails.message, errorDetails.type);
  }
};

// Handle global errors
const handleGlobalError = (event: ErrorEvent) => {
  if (!API_CONFIG.ERROR_HANDLING.SHOW_ERROR_NOTIFICATIONS) return;
  
  event.preventDefault();
  const errorDetails = processError(event.error || event.message);
  
  if (notification.value) {
    notification.value.show(errorDetails.message, errorDetails.type);
  }
};

// Register and clean up global error handlers
onMounted(() => {
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  window.addEventListener('error', handleGlobalError);
  
  // Make the notification component available globally
  if (notification.value) {
    window.showErrorNotification = (message: string, type: ErrorType | 'info' | 'success' | 'warning' = ErrorType.UNKNOWN) => {
      notification.value?.show(message, type);
    };
  }
});

onUnmounted(() => {
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  window.removeEventListener('error', handleGlobalError);
});
</script> 