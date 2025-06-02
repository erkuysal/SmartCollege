<script setup lang="ts">
import { ref, onErrorCaptured, provide, computed } from 'vue';
import { getErrorMessage } from '@/composables/useDataFetching';

/**
 * Reset error state symbol for provide/inject pattern
 */
const RESET_ERROR = Symbol('resetError');

/**
 * Component props
 */
const props = defineProps({
  /**
   * Fallback component to render when error is thrown
   */
  fallback: {
    type: Boolean,
    default: true
  },
  /**
   * Log error to console
   */
  logError: {
    type: Boolean,
    default: true
  },
  /**
   * Additional context message to help with debugging
   */
  context: {
    type: String,
    default: ''
  }
});

const emits = defineEmits<{
  (e: 'error', error: Error, component: string | undefined, info: string): void;
  (e: 'reset'): void;
}>();

/**
 * Error state
 */
const error = ref<Error | null>(null);

/**
 * Info about where the error occurred
 */
const errorInfo = ref('');

/**
 * Component where error occurred
 */
const errorComponent = ref<string | undefined>(undefined);

/**
 * Reset the error state
 */
const resetError = () => {
  error.value = null;
  errorInfo.value = '';
  errorComponent.value = undefined;
  emits('reset');
};

/**
 * Error message formatter
 */
const errorMessage = computed(() => {
  if (!error.value) return '';
  return getErrorMessage(error.value);
});

/**
 * Technical error details for developers
 */
const technicalDetails = computed(() => {
  if (!error.value) return '';
  return `${error.value.name}: ${error.value.message}`;
});

/**
 * Track error occurrence
 */
onErrorCaptured((err, instance, info) => {
  // Store error information
  error.value = err;
  errorInfo.value = info;
  errorComponent.value = instance?.$options?.name;
  
  // Emit error event
  emits('error', err, instance?.$options?.name, info);
  
  // Log error to console if enabled
  if (props.logError) {
    console.error('Error captured by boundary:', {
      error: err,
      component: instance?.$options?.name || 'Unknown component',
      info,
      context: props.context
    });
  }
  
  // Stop error propagation
  return false;
});

/**
 * Provide reset function to child components
 */
provide(RESET_ERROR, resetError);

/**
 * Export RESET_ERROR symbol for consumer components
 */
defineExpose({
  RESET_ERROR,
  resetError
});
</script>

<template>
  <div>
    <slot v-if="!error" />
    <div v-else class="error-boundary">
      <h3>Something went wrong.</h3>
      <p>{{ error.message }}</p>
      <button @click="resetError">Try Again</button>
    </div>
  </div>
</template>

<style scoped>
.error-boundary {
  padding: 2rem;
  background: #fee2e2;
  border: 1px solid #ef4444;
  border-radius: 0.5rem;
  color: #991b1b;
  text-align: center;
}
button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}
button:hover {
  background: #dc2626;
}
</style> 