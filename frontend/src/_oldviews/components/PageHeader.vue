<template>
  <div class="page-header mb-4">
    <div class="d-flex align-center justify-space-between flex-wrap">
      <div class="header-content">
        <h1 class="text-h4 font-weight-bold">{{ title }}</h1>
        <p v-if="subtitle" class="text-body-1 text-medium-emphasis mt-1">
          {{ subtitle }}
        </p>
      </div>
      
      <div class="d-flex align-center">
        <template v-for="(action, index) in actions" :key="index">
          <v-btn
            :color="action.color || 'default'"
            :variant="action.variant || 'elevated'"
            :prepend-icon="action.icon"
            class="ml-2"
            @click="action.handler"
          >
            {{ action.text }}
          </v-btn>
        </template>
      </div>
    </div>
    
    <v-divider class="my-4" />
  </div>
</template>

<script setup lang="ts">
interface Action {
  text: string;
  icon?: string;
  color?: string;
  variant?: string;
  handler: () => void;
}

// Props
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  actions: {
    type: Array as () => Action[],
    default: () => []
  }
});
</script>

<style scoped>
.page-header {
  position: relative;
}

@media (max-width: 600px) {
  .header-content {
    margin-bottom: 16px;
  }
  
  .page-header .d-flex {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .page-header .d-flex > .d-flex {
    width: 100%;
    margin-top: 16px;
    justify-content: flex-start;
  }
  
  .page-header .ml-2:first-child {
    margin-left: 0 !important;
  }
}
</style> 