<template>
  <div
    class="creation-card"
    :class="{
      'cursor-pointer hover:shadow-lg': !disabled,
      'opacity-50 cursor-not-allowed': disabled
    }"
    @click="!disabled && $emit('click')"
  >
    <div class="card-header">
      <h3 class="text-lg font-semibold">{{ title }}</h3>
      <StatusBadge :status="status" />
    </div>
    
    <p class="text-gray-600 mt-2">{{ description }}</p>
    
    <div class="mt-4 flex justify-between items-center">
      <span class="text-sm text-gray-500">Click to {{ getActionText }}</span>
      <button
        v-if="!disabled"
        class="text-blue-600 hover:text-blue-800"
        @click.stop="$emit('click')"
      >
        {{ getButtonText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StatusBadge from './StatusBadge.vue';

interface Props {
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'disabled';
  route: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
});

defineEmits<{
  (e: 'click'): void;
}>();

const getActionText = computed(() => {
  switch (props.status) {
    case 'pending':
      return 'start';
    case 'in-progress':
      return 'continue';
    case 'completed':
      return 'view';
    default:
      return 'access';
  }
});

const getButtonText = computed(() => {
  switch (props.status) {
    case 'pending':
      return 'Start →';
    case 'in-progress':
      return 'Continue →';
    case 'completed':
      return 'View →';
    default:
      return 'Access →';
  }
});
</script>

<style scoped>
.creation-card {
  @apply bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200;
}

.card-header {
  @apply flex justify-between items-start;
}
</style> 