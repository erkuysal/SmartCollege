<template>
  <schedule-form-dialog
    v-model="showDialog"
    :editing-schedule="editingSchedule"
    :classroom-id="classroomId"
    @saved="onScheduleSaved"
  />
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, onUnmounted } from 'vue';
import type { Schedule } from '@/utils/interfaces/college/scheduleInterface';
import ScheduleFormDialog from '@/components/schedule/ScheduleFormDialog.vue';

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  editingSchedule: {
    type: Object as () => Schedule | null,
    default: null
  },
  classroomId: {
    type: Number,
    required: true
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'saved']);

// Dialog state
const showDialog = ref(props.modelValue);

// Watch for changes in the modelValue
const unwatch = watch(() => props.modelValue, (newValue: boolean) => {
  showDialog.value = newValue;
});

// Watch for changes in showDialog to emit update
watch(() => showDialog.value, (newValue: boolean) => {
  emit('update:modelValue', newValue);
});

// Handle schedule saved event
function onScheduleSaved() {
  emit('saved');
}

// Clean up watches
onUnmounted(() => {
  unwatch();
});
</script> 