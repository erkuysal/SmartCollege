<template>
  <v-navigation-drawer
    permanent
    class="sidebar"
    :elevation="2"
  >
    <v-list class="sidebar-content">
      <v-list-item class="sidebar-header">
        <v-list-item-title class="text-h5 font-weight-bold d-flex align-center">
          <v-icon
            icon="mdi-school"
            size="large"
            class="me-2"
            color="primary"
          />
          <span>
            Smart<br>Attendance
          </span>
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <v-divider class="sidebar-divider"></v-divider>

    <!-- Navigation Sections -->
    <template v-for="section in navigationConfig" :key="section.title">
      <v-list nav class="sidebar-nav">
        <v-list-subheader class="nav-subheader">{{ section.title }}</v-list-subheader>
        <v-list-item
          v-for="item in section.items"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.text"
          class="nav-item"
          :class="{ 'nav-item-active': $route.path === item.to }"
        >
          <template v-slot:prepend>
            <v-icon
              :icon="item.icon"
              :color="$route.path === item.to ? 'primary' : undefined"
            />
          </template>
        </v-list-item>
      </v-list>
    </template>

    <template v-slot:append>
      <div class="theme-toggle">
        <v-btn
          block
          variant="text"
          @click="toggleTheme"
          :prepend-icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          class="theme-btn"
          :color="isDark ? 'warning' : 'primary'"
        >
          {{ isDark ? 'Light Mode' : 'Dark Mode' }}
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/client/stores/theme.ts'
import { navigationConfig } from '@/config/navigation'

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)
const { toggleTheme } = themeStore
</script>

<style lang="scss" scoped>
@use '../../styles/theme/colors' as color;
@use '../../styles/theme/spacing' as spacing;
@use '../../styles/theme/variables' as var;
@use '../../styles/theme/typography' as typo;

.sidebar {
  border-right: 1px solid color.$color-border;
  background: color.$color-surface-container;
  transition: all 0.2s;
  width: 256px !important;
  min-width: 200px !important;
  max-width: 256px !important;
  box-shadow: 2px 0 8px 0 rgba(30, 34, 40, 0.04);
  z-index: 100;

  // Override Vuetify theme variable for on-surface color
  --v-theme-on-surface: #{color.$color-text-primary} !important;

  &-content {
    padding: spacing.$spacing-lg 0;
  }

  &-header {
    display: flex;
    align-items: center;
    padding: spacing.$spacing-xl;
    margin-bottom: spacing.$spacing-sm;
    .v-list-item-title {
      color: color.$color-text-primary;
      font-size: clamp(1.1rem, 2vw, 1.5rem);
      font-weight: var.$font-weight-bold;
      letter-spacing: -0.5px;
      white-space: normal;
      word-break: break-word;
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      line-height: 1.15;
      text-align: left;
    }
  }

  &-divider {
    margin: spacing.$spacing-sm 0;
    border-color: color.$color-border;
    opacity: 0.5;
  }

  &-nav {
    padding: spacing.$spacing-sm;

    .nav-subheader,
    .nav-subheader .v-list-subheader__text,
    .nav-subheader__text {
      color: var(--v-theme-on-surface) !important;
      opacity: 0.7;
      font-size: 0.75rem;
      font-weight: var.$font-weight-medium;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: spacing.$spacing-md spacing.$spacing-lg;
      margin-top: spacing.$spacing-sm;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 1;
      }
    }

    .nav-item {
      margin: spacing.$spacing-xs 0;
      border-radius: var.$border-radius-md;
      transition: all 0.15s;
      color: color.$color-text-secondary;
      height: 48px;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 3px;
        background: color.$color-primary;
        transform: scaleY(0);
        transition: transform 0.15s;
      }

      &:hover {
        background: color.$color-surface-container-high;
        color: color.$color-text-primary;
        transform: translateX(4px);

        &::before {
          transform: scaleY(1);
        }
      }

      &.nav-item-active {
        background: color.$color-surface-container-high;
        color: color.$color-text-primary;
        font-weight: var.$font-weight-medium;

        &::before {
          transform: scaleY(1);
        }

        .v-list-item-title {
          font-weight: var.$font-weight-semibold;
        }
      }
    }
  }
}

.theme-toggle {
  padding: spacing.$spacing-lg;
  border-top: 1px solid color.$color-border;
  background: color.$color-surface-container-low;

  .theme-btn {
    border-radius: var.$border-radius-md;
    transition: all 0.15s;
    height: 40px;
    font-weight: var.$font-weight-medium;

    &:hover {
      background: color.$color-surface-container-high;
      transform: translateY(-2px);
    }
  }
}

.nav-group-header {
  color: color.$color-text-primary !important;
  font-size: 0.875rem;
  font-weight: var.$font-weight-medium;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: spacing.$spacing-md spacing.$spacing-lg;
  margin-top: spacing.$spacing-sm;
}
</style>
