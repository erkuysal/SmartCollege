<template>
  <v-snackbar
    v-model="isVisible"
    :color="resolvedColor"
    :timeout="timeout"
    :location="location"
    :closable="closable"
    :multi-line="multiLine"
  >
    <div class="d-flex align-center">
      <v-icon
        v-if="showIcon"
        :icon="resolvedIcon"
        class="mr-2"
        size="small"
      ></v-icon>
      
      <span>{{ message }}</span>
    </div>
    
    <template v-slot:actions v-if="closable">
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        @click="close"
      ></v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// Type for notification types
type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Props definition
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String as () => NotificationType,
    default: 'info',
    validator: (value: string) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  icon: {
    type: String,
    default: ''
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  timeout: {
    type: Number,
    default: 5000
  },
  location: {
    type: String,
    default: 'bottom',
    validator: (value: string) => ['top', 'bottom'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  multiLine: {
    type: Boolean,
    default: false
  }
});

// Events
const emit = defineEmits(['update:modelValue', 'close']);

// Computed icon based on type
const resolvedIcon = computed(() => {
  if (props.icon) return props.icon;
  
  switch (props.type) {
    case 'success':
      return 'mdi-check-circle';
    case 'error':
      return 'mdi-alert-circle';
    case 'warning':
      return 'mdi-alert';
    case 'info':
    default:
      return 'mdi-information';
  }
});

// Computed color based on type
const resolvedColor = computed(() => {
  return props.type || 'info';
});

// Internal visibility state
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Methods
function close() {
  isVisible.value = false;
  emit('close');
}

// Show method for imperative usage
function show(newMessage?: string, type?: NotificationType) {
  if (newMessage) {
    message.value = newMessage;
  }
  if (type) {
    notificationType.value = type;
  }
  isVisible.value = true;
}

// Internal state for imperative API
const message = ref(props.message);
const notificationType = ref(props.type);

// Watch for prop changes
watch(() => props.message, (newVal) => {
  message.value = newVal;
});

watch(() => props.type, (newVal) => {
  notificationType.value = newVal;
});

// Expose methods
defineExpose({
  show,
  close
});
</script> 