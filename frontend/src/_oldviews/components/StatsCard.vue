<template>
  <v-card 
    class="stats-card"
    :class="{ 'stats-card--dark': dark }"
    @click="$emit('click')"
    elevation="0"
    variant="elevated"
  >
    <div class="d-flex px-4 py-4">
      <!-- Icon Wrapper -->
      <div 
        class="stats-card__icon-wrapper rounded-lg d-flex align-center justify-center mr-4"
        :class="`bg-${color}-lighten-5`" 
      >
        <v-icon 
          :color="color" 
          size="32"
          :icon="icon"
        ></v-icon>
      </div>
      
      <!-- Content -->
      <div class="flex-grow-1">
        <div class="text-body-2 text-medium-emphasis mb-1">{{ title }}</div>
        <div class="d-flex align-center">
          <span class="text-h5 font-weight-bold">{{ value }}</span>
          <div v-if="change !== null" class="ml-2">
            <v-chip
              density="comfortable"
              size="small"
              :color="changeColor"
              variant="outlined"
              class="text-caption font-weight-medium"
            >
              <v-icon 
                :icon="changeIcon" 
                size="12" 
                start
              ></v-icon>
              {{ Math.abs(change) }}%
            </v-chip>
          </div>
        </div>
        <div v-if="subtitle" class="text-caption text-medium-emphasis mt-1">
          {{ subtitle }}
        </div>
      </div>
    </div>

    <v-divider v-if="showFooter"></v-divider>
    
    <div v-if="showFooter" class="px-4 py-2 stats-card__footer d-flex align-center">
      <span class="text-caption font-weight-medium">{{ footerText }}</span>
      <v-spacer></v-spacer>
      <v-icon size="small" :color="color" :icon="footerIcon || 'mdi-arrow-right'"></v-icon>
    </div>

    <v-divider v-if="$slots.actions"></v-divider>
    
    <v-card-actions v-if="$slots.actions">
      <slot name="actions"></slot>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'mdi-chart-bar'
  },
  color: {
    type: String,
    default: 'primary'
  },
  dark: {
    type: Boolean,
    default: false
  },
  change: {
    type: Number,
    default: null
  },
  footerText: {
    type: String,
    default: 'View Details'
  },
  footerIcon: {
    type: String,
    default: 'mdi-arrow-right'
  },
  showFooter: {
    type: Boolean,
    default: true
  }
});

defineEmits(['click']);

// Computed properties
const changeColor = computed(() => {
  if (props.change === null) return 'primary';
  return props.change >= 0 ? 'success' : 'error';
});

const changeIcon = computed(() => {
  return props.change >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down';
});
</script>

<style scoped>
.stats-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 12px;
  overflow: hidden;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08) !important;
}

.stats-card__icon-wrapper {
  width: 56px;
  height: 56px;
  min-width: 56px;
}

.stats-card__footer {
  height: 44px;
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  transition: background-color 0.2s;
}

.stats-card:hover .stats-card__footer {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.stats-card--dark {
  background: linear-gradient(135deg, var(--v-theme-primary), rgba(var(--v-theme-primary), 0.7));
  color: white;
}

.stats-card--dark .text-medium-emphasis {
  color: rgba(255, 255, 255, 0.7) !important;
}

.stats-card--dark .stats-card__icon-wrapper {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.stats-card--dark .stats-card__icon-wrapper .v-icon {
  color: white !important;
}

.stats-card--dark .stats-card__footer {
  background-color: rgba(0, 0, 0, 0.1);
}

.stats-card--dark:hover .stats-card__footer {
  background-color: rgba(0, 0, 0, 0.15);
}
</style> 