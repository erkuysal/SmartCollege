<template>
  <div class="stats-card">
    <div class="icon-container" :style="{ backgroundColor: iconBgColor }">
      <span class="icon">{{ icon }}</span>
    </div>
    <div class="content">
      <h3 class="title">{{ title }}</h3>
      <p class="value">{{ value }}</p>
      <p v-if="change" class="change" :class="{ 'positive': change > 0, 'negative': change < 0 }">
        {{ change > 0 ? '+' : '' }}{{ change }}%
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  value: string | number;
  icon: string;
  iconBgColor?: string;
  change?: number;
}>();
</script>

<style scoped>
.stats-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.icon-container {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e5e7eb;
}

.icon {
  font-size: 1.5rem;
}

.content {
  flex: 1;
}

.title {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0.25rem 0;
}

.change {
  font-size: 0.875rem;
  margin: 0;
}

.change.positive {
  color: #059669;
}

.change.negative {
  color: #dc2626;
}
</style> 