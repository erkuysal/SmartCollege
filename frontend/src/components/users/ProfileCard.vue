<template>
  <div class="profile-tab modern-card">
    <div class="profile-header">
      <v-avatar size="96" class="profile-avatar" color="primary">
        <span class="avatar-initials">{{ initials }}</span>
      </v-avatar>
      <div>
        <div class="profile-name">{{ firstName }} {{ lastName }}</div>
        <div class="profile-chips">
          <slot name="chips"></slot>
        </div>
      </div>
    </div>
    <div class="profile-info-grid">
      <div v-for="(item, idx) in infoItems" :key="idx" class="info-row">
        <div class="info-label">{{ item.label }}</div>
        <div class="info-value">
          <v-icon v-if="item.icon" color="primary" class="mr-2">{{ item.icon }}</v-icon>
          <span v-if="item.isLink">
            <a :href="item.value" target="_blank">{{ item.displayValue }}</a>
          </span>
          <span v-else>{{ item.displayValue }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface InfoItem {
  label: string
  icon?: string
  value: string
  displayValue?: string
  isLink?: boolean
}

interface Props {
  firstName?: string
  lastName?: string
  infoItems: InfoItem[]
}

const props = defineProps<Props>()

const initials = computed(() => {
  return `${props.firstName?.charAt(0) || ''}${props.lastName?.charAt(0) || ''}`
})
</script>

<style lang="scss">
@use '../../styles/theme/index' as theme;

.profile-tab.modern-card {
  background: rgba(255,255,255,0.05);
  border-radius: theme.$border-radius-xl;
  box-shadow: none;
  padding: theme.$spacing-xl;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: theme.$spacing-xl;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: theme.$spacing-lg;
}

.profile-avatar {
  box-shadow: 0 2px 12px theme.$theme-shadow-color;
  border: 4px solid theme.$theme-primary;
}

.profile-name {
  font-size: theme.$font-size-2xl;
  font-weight: theme.$font-weight-bold;
  color: theme.$theme-text-primary;
}

.profile-chips {
  display: flex;
  gap: theme.$spacing-xs;
  margin-top: theme.$spacing-xs;
}

.profile-info-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: theme.$spacing-md theme.$spacing-xl;
  width: 100%;
}

.info-row {
  display: contents;
}

.info-label {
  color: theme.$theme-text-secondary;
  font-weight: theme.$font-weight-medium;
  align-self: center;
  justify-self: start;
  text-align: left;
}

.info-value {
  display: flex;
  align-items: center;
  gap: theme.$spacing-xs;
  color: theme.$theme-text-primary;
  font-weight: theme.$font-weight-medium;
  word-break: break-all;
}

.profile-info-grid a {
  color: theme.$theme-text-primary;
  text-decoration: none;
}

.avatar-initials {
  color: theme.$theme-primary-contrast;
  font-size: theme.$font-size-xl;
  font-weight: theme.$font-weight-bold;
}
</style>
