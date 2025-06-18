<template>
  <v-container class="header-card">
    <div class="header-content">
      <div class="header-titles">
        <h1 class="header-title">{{ title }}</h1>
        <div v-if="$slots.subtitle" class="header-subtitle">
          <slot name="subtitle" />
        </div>
      </div>
      <div v-if="$slots.actions" class="header-actions">
        <slot name="actions" />
      </div>
      <v-tooltip v-if="infoText" location="bottom">
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            color="info"
            class="info-icon"
            style="cursor: pointer;"
          >mdi-information</v-icon>
        </template>
        <span v-html="infoText" />
      </v-tooltip>
    </div>
    <div class="header-accent" />
    <slot></slot>
  </v-container>
</template>

<script setup lang="ts">
defineProps<{
  title: string,
  infoText?: string
}>();
</script>

<style lang="scss" scoped>
@use '../../styles/theme/index' as theme;

.header-card {
  background: linear-gradient(135deg, theme.$theme-surface-1 80%, theme.$theme-primary-light 100%);
  border-radius: theme.$border-radius-xl;
  box-shadow: 0 4px 24px theme.$theme-shadow-color;
  padding: theme.$spacing-xl theme.$spacing-lg theme.$spacing-lg theme.$spacing-lg;
  margin-bottom: theme.$spacing-xl;
  position: relative;
  animation: fadeInHeader 0.5s cubic-bezier(.4,0,.2,1);
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: theme.$spacing-md;
}

.header-titles {
  display: flex;
  flex-direction: column;
  gap: theme.$spacing-xs;
}

.header-title {
  color: theme.$theme-primary-dark;
  font-size: 2.2rem;
  font-weight: theme.$font-weight-bold;
  margin: 0;
  letter-spacing: 0.01em;
  line-height: 1.1;
}

.header-subtitle {
  color: theme.$theme-text-secondary;
  font-size: 1.1rem;
  font-weight: theme.$font-weight-medium;
  margin-top: 2px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: theme.$spacing-md;
  margin-left: auto;
}

.info-icon {
  margin-left: theme.$spacing-md;
  font-size: 1.7rem;
  opacity: 0.85;
  transition: color 0.2s;
  &:hover {
    color: theme.$theme-primary;
    opacity: 1;
  }
}

.header-accent {
  width: 64px;
  height: 5px;
  border-radius: 9999px;
  background: linear-gradient(90deg, theme.$theme-primary, theme.$theme-primary-dark 80%);
  margin-bottom: theme.$spacing-lg;
  margin-top: -8px;
  transition: width 0.3s, background 0.3s;
}

@keyframes fadeInHeader {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}

[data-theme="dark"] {
  .header-title {
    color: white !important;
  }
  .header-subtitle {
    color: rgba(255, 255, 255, 0.7) !important;
  }
}
</style>
