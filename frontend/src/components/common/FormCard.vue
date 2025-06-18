<template>
  <v-card class="form-card">
    <v-card-text>
      <slot></slot>
    </v-card-text>
  </v-card>
</template>

<style lang="scss" scoped>
@use '../../styles/theme/index' as theme;

.form-card {
  transition: transform theme.$theme-transition-fast, box-shadow theme.$theme-transition-fast;
}

.form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px theme.$theme-shadow-color !important;
}
</style>
