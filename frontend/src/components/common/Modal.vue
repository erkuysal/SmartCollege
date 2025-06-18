<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :max-width="maxWidth"
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <slot name="title">{{ title }}</slot>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>
      <v-card-text>
        <slot></slot>
      </v-card-text>
      <v-card-actions v-if="$slots.actions">
        <slot name="actions"></slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  title?: string;
  maxWidth?: string | number;
}>();

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
</script>

<style lang="scss" scoped>
@use '../../styles/theme/index' as theme;

.v-dialog {
  z-index: theme.$theme-z-modal;
}

.v-card {
  background: theme.$theme-surface-1;
  border-radius: theme.$border-radius-lg;
  box-shadow: 0 8px 32px theme.$theme-shadow-color;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.v-card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: theme.$spacing-lg;
  font-size: theme.$font-size-lg;
  font-weight: theme.$font-weight-semibold;
  color: theme.$theme-text-primary;
  border-bottom: 1px solid theme.$theme-border-light;
}

.v-card-text {
  color: theme.$theme-text-primary;
  padding: theme.$spacing-lg;
}

.v-card-actions {
  padding: theme.$spacing-md theme.$spacing-lg;
  border-top: 1px solid theme.$theme-border-light;
  display: flex;
  justify-content: flex-end;
  gap: theme.$spacing-sm;
}

.v-btn[icon] {
  color: theme.$theme-text-secondary;
  padding: theme.$spacing-xs;
  font-size: 24px;
  &:hover {
    color: theme.$theme-text-primary;
  }
}
</style>
