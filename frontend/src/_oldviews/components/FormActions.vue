<template>
  <div class="d-flex" :class="`justify-${justify}`">
    <!-- Cancel Button -->
    <v-btn
      v-if="showCancel"
      :color="cancelColor"
      :variant="cancelVariant"
      :disabled="loading || disabled"
      @click="$emit('cancel')"
      class="mr-2"
    >
      <v-icon v-if="cancelIcon" :icon="cancelIcon" class="mr-1"></v-icon>
      {{ cancelText }}
    </v-btn>

    <!-- Submit Button -->
    <v-btn
      v-if="showSubmit"
      :color="submitColor"
      :variant="submitVariant"
      :loading="loading"
      :disabled="disabled || loading"
      @click="$emit('submit')"
      type="submit"
    >
      <v-icon v-if="submitIcon" :icon="submitIcon" class="mr-1"></v-icon>
      {{ submitText }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
// Define button variant type
type ButtonVariant = 'text' | 'flat' | 'outlined' | 'plain' | 'elevated' | 'tonal' | undefined;

defineProps({
  // Layout
  justify: {
    type: String,
    default: 'end',
    validator: (value: string) => ['start', 'end', 'center', 'space-between', 'space-around'].includes(value)
  },
  
  // State
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Cancel button props
  showCancel: {
    type: Boolean,
    default: true
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  cancelColor: {
    type: String,
    default: 'grey-darken-1'
  },
  cancelVariant: {
    type: String as () => ButtonVariant,
    default: 'text' as ButtonVariant
  },
  cancelIcon: {
    type: String,
    default: ''
  },
  
  // Submit button props
  showSubmit: {
    type: Boolean,
    default: true
  },
  submitText: {
    type: String,
    default: 'Submit'
  },
  submitColor: {
    type: String,
    default: 'primary'
  },
  submitVariant: {
    type: String as () => ButtonVariant,
    default: 'flat' as ButtonVariant
  },
  submitIcon: {
    type: String,
    default: ''
  }
});

defineEmits(['submit', 'cancel']);
</script> 