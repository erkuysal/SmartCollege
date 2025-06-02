<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { PropType } from 'vue';
import { getErrorMessage } from '@/composables/useDataFetching';

const props = defineProps({
  /**
   * Initial form data
   */
  initialValues: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({})
  },
  /**
   * Whether the form is loading (e.g., during submission)
   */
  loading: {
    type: Boolean,
    default: false
  },
  /**
   * Error object from form submission
   */
  error: {
    type: [Error, String, Object] as PropType<Error | string | Record<string, any> | null>,
    default: null
  },
  /**
   * Form title
   */
  title: {
    type: String,
    default: ''
  },
  /**
   * Form subtitle or description
   */
  subtitle: {
    type: String,
    default: ''
  },
  /**
   * Submit button text
   */
  submitText: {
    type: String,
    default: 'Submit'
  },
  /**
   * Cancel button text
   */
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  /**
   * Whether the form has a cancel button
   */
  showCancel: {
    type: Boolean,
    default: true
  },
  /**
   * Whether the form has a reset button
   */
  showReset: {
    type: Boolean,
    default: false
  },
  /**
   * Whether to display success alert after submission
   */
  showSuccessAlert: {
    type: Boolean,
    default: false
  },
  /**
   * Success message
   */
  successMessage: {
    type: String,
    default: 'Form submitted successfully!'
  },
  /**
   * Whether the form should be disabled
   */
  disabled: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits<{
  (e: 'submit', formData: Record<string, any>): void;
  (e: 'cancel'): void;
  (e: 'reset'): void;
  (e: 'update', formData: Record<string, any>): void;
}>();

/**
 * Form data state
 */
const formData = ref<Record<string, any>>({ ...props.initialValues });

/**
 * Whether the form has been submitted successfully
 */
const formSubmitted = ref(false);

/**
 * Track whether form values have changed from initial values
 */
const formChanged = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(props.initialValues);
});

/**
 * Track if form is in an error state
 */
const hasError = computed(() => props.error !== null);

/**
 * Format error message for display
 */
const errorMessage = computed(() => {
  if (!props.error) return '';
  
  if (props.error instanceof Error) {
    return getErrorMessage(props.error);
  }
  
  if (typeof props.error === 'string') {
    return props.error;
  }
  
  if (typeof props.error === 'object') {
    // Handle validation errors object
    return Object.values(props.error).flat().join(', ');
  }
  
  return 'An error occurred. Please try again.';
});

/**
 * Handle form submission
 */
const handleSubmit = () => {
  formSubmitted.value = false;
  emits('submit', { ...formData.value });
};

/**
 * Handle form cancellation
 */
const handleCancel = () => {
  emits('cancel');
};

/**
 * Reset form to initial values
 */
const resetForm = () => {
  formData.value = { ...props.initialValues };
  formSubmitted.value = false;
  emits('reset');
};

/**
 * Update parent with form changes
 */
const updateParent = () => {
  emits('update', { ...formData.value });
};

/**
 * Track form changes and notify parent
 */
watch(formData, updateParent, { deep: true });

/**
 * Update local form data when initialValues change
 */
watch(() => props.initialValues, (newValues) => {
  formData.value = { ...newValues };
}, { deep: true });

/**
 * Set success state after successful submission
 */
onMounted(() => {
  if (props.showSuccessAlert && props.error === null && !formChanged.value) {
    formSubmitted.value = true;
  }
});

// Expose methods to parent component using defineExpose
defineExpose({
  resetForm,
  formData
});
</script>

<template>
  <div class="base-form">
    <!-- Form Title & Subtitle -->
    <div v-if="title || subtitle" class="form-header mb-6">
      <h2 v-if="title" class="text-h5 font-weight-bold mb-2">{{ title }}</h2>
      <p v-if="subtitle" class="text-subtitle-1 text-medium-emphasis">{{ subtitle }}</p>
    </div>
    
    <!-- Success Alert -->
    <v-alert
      v-if="showSuccessAlert && formSubmitted"
      type="success"
      variant="tonal"
      class="mb-4 animate-fade-in"
      density="comfortable"
      closable
    >
      {{ successMessage }}
    </v-alert>
    
    <!-- Error Alert -->
    <v-alert
      v-if="hasError"
      type="error"
      variant="tonal"
      class="mb-4 animate-fade-in"
      density="comfortable"
      closable
    >
      {{ errorMessage }}
    </v-alert>
    
    <!-- Form Content -->
    <form @submit.prevent="handleSubmit" novalidate>
      <!-- Slot for form fields -->
      <slot :form-data="formData"></slot>
      
      <!-- Form Actions -->
      <div class="d-flex flex-wrap gap-3 mt-6">
        <v-btn
          type="submit"
          color="primary"
          :loading="loading"
          :disabled="disabled || loading"
          variant="elevated"
          class="form-submit-btn"
        >
          {{ submitText }}
        </v-btn>
        
        <v-btn
          v-if="showReset"
          type="button"
          variant="tonal"
          :disabled="disabled || loading || !formChanged"
          @click="resetForm"
          class="form-reset-btn"
        >
          Reset
        </v-btn>
        
        <v-btn
          v-if="showCancel"
          type="button"
          variant="text"
          :disabled="disabled || loading"
          @click="handleCancel"
          class="form-cancel-btn ms-auto"
        >
          {{ cancelText }}
        </v-btn>
      </div>
    </form>
  </div>
</template>

<style scoped>
.base-form {
  width: 100%;
}

.form-header {
  border-left: 4px solid var(--v-primary-base);
  padding-left: 16px;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style> 