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
  <!-- Error Display -->
  <div v-if="error && fallback" class="error-boundary">
    <v-card 
      color="error" 
      variant="outlined" 
      class="pa-4 rounded-lg error-card animate-fade-in"
    >
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-alert-circle" size="24" class="mr-2" />
        Something went wrong
      </v-card-title>
      
      <v-card-text>
        <p class="mb-2">{{ errorMessage }}</p>
        
        <!-- Technical details (collapsible) -->
        <v-expansion-panels variant="accordion" v-if="technicalDetails">
          <v-expansion-panel>
            <v-expansion-panel-title>
              Technical Details
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <pre class="technical-details">{{ technicalDetails }}</pre>
              <div v-if="errorComponent" class="mt-2">
                <strong>Component:</strong> {{ errorComponent }}
              </div>
              <div v-if="errorInfo" class="mt-1">
                <strong>Info:</strong> {{ errorInfo }}
              </div>
              <div v-if="context" class="mt-1">
                <strong>Context:</strong> {{ context }}
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
      
      <v-card-actions>
        <v-btn 
          variant="tonal" 
          color="primary" 
          @click="resetError"
          prepend-icon="mdi-refresh"
        >
          Try Again
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
  
  <!-- Normal content when no error -->
  <slot v-else></slot>
</template>

<style scoped>
.error-boundary {
  width: 100%;
  padding: 16px;
}

.error-card {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 8px;
}

.technical-details {
  background: rgba(0, 0, 0, 0.05);
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  overflow-x: auto;
  white-space: pre-wrap;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 