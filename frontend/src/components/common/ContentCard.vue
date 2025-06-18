<template>
  <v-card class="content-card">
    <v-card-title v-if="title" class="d-flex align-center">
      {{ title }}
      <v-divider class="mx-4"></v-divider>
    </v-card-title>
    <v-card-text>
      <slot></slot>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>();
</script>

<style lang="scss" scoped>
@use '../../styles/theme/index' as theme;

.content-card {
  background: theme.$theme-surface-1;
  border-radius: theme.$border-radius-lg;
  box-shadow: 0 4px 16px theme.$theme-shadow-color;
  padding: theme.$spacing-lg;
  margin-bottom: theme.$spacing-md;
}

.v-card-title {
  font-size: theme.$font-size-lg;
  font-weight: theme.$font-weight-semibold;
  color: theme.$theme-text-primary;
  margin-bottom: theme.$spacing-md;
}

.v-card-text {
  color: theme.$theme-text-primary;
}
</style>
