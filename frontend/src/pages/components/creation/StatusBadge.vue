<template>
  <span
    class="status-badge"
    :class="{
      'bg-yellow-100 text-yellow-800': status === 'pending',
      'bg-blue-100 text-blue-800': status === 'in-progress',
      'bg-green-100 text-green-800': status === 'completed',
      'bg-gray-100 text-gray-800': status === 'disabled'
    }"
  >
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  status: 'pending' | 'in-progress' | 'completed' | 'disabled';
}

const props = defineProps<Props>();

const statusText = computed(() => {
  switch (props.status) {
    case 'pending':
      return 'Pending';
    case 'in-progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    default:
      return 'Disabled';
  }
});
</script>

<style scoped>
.status-badge {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}
</style> 