<template>
  <v-snackbar
    v-model="isVisible"
    :color="getColor"
    :timeout="timeout"
    :location="location"
    max-width="400"
  >
    <div class="d-flex align-center">
      <v-icon
        class="mr-2"
        :icon="getIcon"
        size="small"
      ></v-icon>
      <span>{{ message }}</span>
    </div>
    
    <template v-slot:actions>
      <v-btn
        variant="text"
        icon="mdi-close"
        @click="isVisible = false"
      ></v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ErrorType } from '@/utils/helpers/errorHandler';

interface Props {
  message?: string;
  type?: ErrorType | 'info' | 'success' | 'warning';
  timeout?: number;
  location?: 'top' | 'bottom';
  autoHide?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  type: 'info',
  timeout: 5000,
  location: 'bottom',
  autoHide: true
});

const isVisible = ref(false);
const message = ref(props.message);
// Make current type reactive
const currentType = ref(props.type);

// Computed color based on type
const getColor = computed(() => {
  switch (currentType.value) {
    case ErrorType.NETWORK:
    case ErrorType.SERVER:
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
    case ErrorType.UNKNOWN:
    case ErrorType.TIMEOUT:
      return 'error';
    case ErrorType.VALIDATION:
    case 'warning':
      return 'warning';
    case 'success':
      return 'success';
    case 'info':
    default:
      return 'info';
  }
});

// Computed icon based on type
const getIcon = computed(() => {
  switch (currentType.value) {
    case ErrorType.NETWORK:
      return 'mdi-wifi-off';
    case ErrorType.SERVER:
      return 'mdi-server-network-off';
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
      return 'mdi-shield-alert';
    case ErrorType.VALIDATION:
      return 'mdi-alert';
    case ErrorType.TIMEOUT:
      return 'mdi-clock-alert';
    case 'success':
      return 'mdi-check-circle';
    case 'warning':
      return 'mdi-alert';
    case ErrorType.UNKNOWN:
    case 'info':
    default:
      return 'mdi-information';
  }
});

// Create a unique event name for this component instance
const eventId = `error-notification-${Date.now()}`;

// Methods
const show = (newMessage: string, type?: Props['type']) => {
  message.value = newMessage;
  if (type) {
    currentType.value = type;
  }
  isVisible.value = true;
};

const hide = () => {
  isVisible.value = false;
};

// Expose methods to parent
defineExpose({ show, hide });

// Event handling for global notifications
const handleErrorEvent = (event: CustomEvent) => {
  if (event.detail) {
    show(event.detail.message, event.detail.type);
  }
};

// Register and clean up event listeners
onMounted(() => {
  window.addEventListener(`${eventId}:show`, handleErrorEvent as EventListener);
});

onUnmounted(() => {
  window.removeEventListener(`${eventId}:show`, handleErrorEvent as EventListener);
});

// Static method to trigger notifications from anywhere
const showGlobalNotification = (message: string, type: Props['type'] = 'info') => {
  const event = new CustomEvent(`${eventId}:show`, {
    detail: { message, type }
  });
  window.dispatchEvent(event);
};

// Declare type for window extension
declare global {
  interface Window {
    showErrorNotification: (message: string, type?: ErrorType | 'info' | 'success' | 'warning') => void;
  }
}

// Register global method
// Note: This is a workaround - in a real app you might use a Pinia store instead
if (typeof window !== 'undefined') {
  window.showErrorNotification = showGlobalNotification;
}
</script>

<style scoped>
/* Add any custom styling here */
</style> 