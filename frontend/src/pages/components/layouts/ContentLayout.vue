<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import ErrorBoundary from '@/pages/components/base/ErrorBoundary.vue';
import PageTransition from '@/pages/components/PageTransition.vue';

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

// Add mobile detection
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 960;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<template>
  <div 
    class="content-layout"
    :class="{ 
      'pb-6': paddingBottom,
      'mobile': isMobile
    }"
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
          class="page-header"
        >
          <div class="header-content">
            <div class="header-title">
              <h1 v-if="pageTitle" class="text-h4 mb-1">{{ pageTitle }}</h1>
              <p v-if="subtitle" class="text-subtitle-1 text-medium-emphasis">{{ subtitle }}</p>
            </div>
            
            <!-- Header Actions -->
            <div class="header-actions">
              <slot name="actions"></slot>
            </div>
          </div>
        </div>
        
        <!-- Breadcrumbs -->
        <div v-if="showBreadcrumbs" class="breadcrumbs-container">
          <slot name="breadcrumbs"></slot>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
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
          class="page-header"
        >
          <div class="header-content">
            <div class="header-title">
              <h1 v-if="pageTitle" class="text-h4 mb-1">{{ pageTitle }}</h1>
              <p v-if="subtitle" class="text-subtitle-1 text-medium-emphasis">{{ subtitle }}</p>
            </div>
            
            <!-- Header Actions -->
            <div class="header-actions">
              <slot name="actions"></slot>
            </div>
          </div>
        </div>
        
        <!-- Breadcrumbs -->
        <div v-if="showBreadcrumbs" class="breadcrumbs-container">
          <slot name="breadcrumbs"></slot>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
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
  transition: all 0.3s ease;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: inherit;
  padding: 16px 0;
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.header-title {
  flex: 1;
  min-width: 0;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.breadcrumbs-container {
  margin-bottom: 1rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  flex: 1;
}

.content-container {
  flex: 1;
  min-height: 0;
}

/* Responsive breakpoints */
@media (min-width: 960px) {
  .header-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .header-actions {
    justify-content: flex-end;
  }
}

@media (max-width: 960px) {
  .content-layout {
    padding: 20px;
  }
  
  .page-header {
    padding: 12px 0;
  }
}

@media (max-width: 600px) {
  .content-layout {
    padding: 16px;
  }
  
  .page-header {
    padding: 8px 0;
  }
  
  .header-actions {
    width: 100%;
  }
}

/* Print styles */
@media print {
  .content-layout {
    padding: 0;
  }
  
  .header-actions {
    display: none;
  }
  
  .page-header {
    position: static;
  }
}
</style> 