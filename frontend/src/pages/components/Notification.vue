<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

const props = defineProps<Props>();

const icon = computed(() => {
  switch (props.type) {
    case 'info':
      return 'mdi-information';
    case 'warning':
      return 'mdi-alert';
    case 'error':
      return 'mdi-alert-circle';
    case 'success':
      return 'mdi-check-circle';
    default:
      return 'mdi-bell';
  }
});

const color = computed(() => {
  switch (props.type) {
    case 'info':
      return 'info';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'success':
      return 'success';
    default:
      return 'primary';
  }
});

const formattedTime = computed(() => {
  const now = new Date();
  const diff = now.getTime() - props.timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else {
    return `${days}d ago`;
  }
});
</script>

<template>
  <v-list-item
    :class="{ 'notification-unread': !read }"
    class="notification-item"
    @click="$emit('click')"
  >
    <template #prepend>
      <v-icon
        :icon="icon"
        :color="color"
        class="notification-icon"
      />
    </template>

    <v-list-item-title class="text-subtitle-1 font-weight-medium">
      {{ title }}
    </v-list-item-title>

    <v-list-item-subtitle class="text-body-2 mt-1">
      {{ message }}
    </v-list-item-subtitle>

    <template #append>
      <div class="d-flex flex-column align-end">
        <span class="text-caption text-medium-emphasis">
          {{ formattedTime }}
        </span>
        <v-icon
          v-if="!read"
          icon="mdi-circle"
          size="small"
          color="primary"
          class="mt-1"
        />
      </div>
    </template>
  </v-list-item>
</template>

<style scoped>
.notification-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  transition: background-color 0.2s ease;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-unread {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.notification-icon {
  margin-right: 12px;
}
</style> 