<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import ErrorBoundary from '../components/base/ErrorBoundary.vue';
import PageTransition from '../components/PageTransition.vue';

const props = defineProps({
  /**
   * Page title
   */
  title: {
    type: String,
    default: ''
  },
  /**
   * Page subtitle
   */
  subtitle: {
    type: String,
    default: ''
  },
  /**
   * Whether to show the breadcrumbs
   */
  showBreadcrumbs: {
    type: Boolean,
    default: true
  },
  /**
   * Whether the content is in loading state
   */
  loading: {
    type: Boolean,
    default: false
  },
  /**
   * Whether to show the page header
   */
  showHeader: {
    type: Boolean,
    default: true
  },
  /**
   * Whether to use error boundary
   */
  useErrorBoundary: {
    type: Boolean,
    default: true
  },
  /**
   * Whether to use page transition
   */
  useTransition: {
    type: Boolean,
    default: true
  },
  /**
   * Header actions slot content check
   */
  hasHeaderActions: {
    type: Boolean,
    default: false
  },
  /**
   * Background color
   */
  bgColor: {
    type: String,
    default: 'background'
  },
  /**
   * Add bottom padding
   */
  paddingBottom: {
    type: Boolean,
    default: true
  },
  /**
   * Add page max width
   */
  maxWidth: {
    type: String,
    default: '1400px'
  }
});

const route = useRoute();

/**
 * Default page title from route meta
 */
const routeTitle = computed(() => {
  return (route.meta?.title as string) || '';
});

/**
 * Computed page title
 */
const pageTitle = computed(() => {
  return props.title || routeTitle.value;
});

/**
 * Error handling
 */
const handleError = (error: Error) => {
  console.error('Error caught in content layout:', error);
};
</script>

<template>
  <div 
    class="content-layout"
    :class="{ 'pb-6': paddingBottom }"
    :style="{ maxWidth, backgroundColor: bgColor }"
  >
    <PageTransition v-if="useTransition">
      <ErrorBoundary
        v-if="useErrorBoundary"
        @error="handleError"
        context="Content Layout"
      >
        <!-- Page Header -->
        <div 
          v-if="showHeader && (pageTitle || subtitle || hasHeaderActions)" 
          class="page-header d-flex flex-column flex-md-row justify-space-between align-md-center mb-6"
        >
          <div class="header-title">
            <h1 v-if="pageTitle" class="text-h4 mb-1">{{ pageTitle }}</h1>
            <p v-if="subtitle" class="text-subtitle-1 text-medium-emphasis">{{ subtitle }}</p>
          </div>
          
          <!-- Header Actions -->
          <div class="header-actions d-flex mt-4 mt-md-0 align-center">
            <slot name="actions"></slot>
          </div>
        </div>
        
        <!-- Breadcrumbs -->
        <slot v-if="showBreadcrumbs" name="breadcrumbs"></slot>
        
        <!-- Loading State -->
        <div v-if="loading" class="loading-container py-8">
          <slot name="loading">
            <v-progress-circular 
              indeterminate 
              color="primary" 
              size="64"
            ></v-progress-circular>
          </slot>
        </div>
        
        <!-- Main Content -->
        <div v-else class="content-container">
          <slot></slot>
        </div>
        
        <!-- Footer -->
        <slot name="footer"></slot>
      </ErrorBoundary>
    </PageTransition>
    
    <template v-else>
      <ErrorBoundary
        v-if="useErrorBoundary"
        @error="handleError"
        context="Content Layout"
      >
        <!-- Page Header -->
        <div 
          v-if="showHeader && (pageTitle || subtitle || hasHeaderActions)" 
          class="page-header d-flex flex-column flex-md-row justify-space-between align-md-center mb-6"
        >
          <div class="header-title">
            <h1 v-if="pageTitle" class="text-h4 mb-1">{{ pageTitle }}</h1>
            <p v-if="subtitle" class="text-subtitle-1 text-medium-emphasis">{{ subtitle }}</p>
          </div>
          
          <!-- Header Actions -->
          <div class="header-actions d-flex mt-4 mt-md-0 align-center">
            <slot name="actions"></slot>
          </div>
        </div>
        
        <!-- Breadcrumbs -->
        <slot v-if="showBreadcrumbs" name="breadcrumbs"></slot>
        
        <!-- Loading State -->
        <div v-if="loading" class="loading-container py-8">
          <slot name="loading">
            <v-progress-circular 
              indeterminate 
              color="primary" 
              size="64"
            ></v-progress-circular>
          </slot>
        </div>
        
        <!-- Main Content -->
        <div v-else class="content-container">
          <slot></slot>
        </div>
        
        <!-- Footer -->
        <slot name="footer"></slot>
      </ErrorBoundary>
    </template>
  </div>
</template>

<style scoped>
.content-layout {
  width: 100%;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  position: relative;
}

.header-title {
  flex: 1;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

@media (max-width: 600px) {
  .content-layout {
    padding: 16px;
  }
  
  .page-header {
    text-align: center;
  }
  
  .header-actions {
    justify-content: center;
  }
}
</style> 