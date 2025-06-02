<template>
  <div class="d-flex" :class="align">
    <v-btn
      v-if="showCancel"
      color="grey-darken-1"
      variant="text"
      class="mr-2"
      @click="$emit('cancel')"
      :disabled="loading"
    >
      {{ cancelText }}
    </v-btn>
    <v-btn
      color="primary"
      type="submit"
      :loading="loading"
      :disabled="disabled || loading"
    >
      {{ submitText }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
defineProps({
  submitText: {
    type: String,
    default: 'Save'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  align: {
    type: String,
    default: 'justify-end mt-4'
  }
});

defineEmits(['cancel']);
</script> 