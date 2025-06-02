<template>
  <div class="list-layout">
    <!-- Alerts slot for messages -->
    <slot name="alerts"></slot>
    
    <!-- Header with title, search and actions -->
    <v-card class="header-card mb-4" elevation="2">
      <v-card-text>
        <div class="d-flex flex-wrap align-center">
          <!-- Left side: Title and subtitle -->
          <div class="d-flex align-center">
            <div class="icon-wrapper mr-3" v-if="icon">
              <v-icon :icon="icon" :color="iconColor" size="large"></v-icon>
            </div>
            <div>
              <h2 class="text-h5 mb-0 font-weight-bold">{{ title }}</h2>
              <p v-if="subtitle" class="text-subtitle-2 text-medium-emphasis mb-0">{{ subtitle }}</p>
            </div>
          </div>
          
          <v-spacer></v-spacer>
          
          <!-- Right side: Search and actions -->
          <div class="d-flex flex-wrap align-center">
            <!-- Search field with animation -->
            <v-slide-x-transition>
              <v-text-field
                v-if="showSearch && (isSearchExpanded || mdAndUp)"
                v-model="searchQuery"
                density="compact"
                variant="outlined"
                append-inner-icon="mdi-magnify"
                hide-details
                :placeholder="searchPlaceholder"
                class="search-field mx-2"
                :class="{ 'search-field-expanded': isSearchExpanded }"
                @update:model-value="handleSearch"
                @blur="smAndDown && !searchQuery && (isSearchExpanded = false)"
                @keydown.esc="smAndDown && (isSearchExpanded = false)"
              ></v-text-field>
            </v-slide-x-transition>
            
            <v-btn 
              v-if="showSearch && smAndDown && !isSearchExpanded" 
              icon 
              variant="text"
              @click="isSearchExpanded = true"
              class="mr-2"
            >
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
            
            <!-- View type toggle switch -->
            <v-btn-toggle
              v-if="showViewToggle"
              v-model="selectedViewType"
              mandatory
              density="comfortable"
              rounded="pill"
              class="mr-2"
            >
              <v-btn value="table" small icon>
                <v-icon>mdi-view-list</v-icon>
              </v-btn>
              <v-btn value="grid" small icon>
                <v-icon>mdi-view-grid</v-icon>
              </v-btn>
            </v-btn-toggle>
            
            <!-- Refresh button -->
            <v-btn
              v-if="showRefresh"
              icon
              variant="text"
              class="mr-2"
              @click="$emit('refresh')"
              :loading="loading"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
            
            <!-- Primary action button with hover effect -->
            <v-btn
              v-if="primaryAction"
              :color="iconColor"
              :prepend-icon="primaryActionIcon"
              @click="$emit('primary-action')"
              elevation="1"
              class="action-button"
            >
              {{ primaryAction }}
            </v-btn>
            
            <!-- Additional actions slot -->
            <slot name="actions"></slot>
          </div>
        </div>
      </v-card-text>
    </v-card>
    
    <!-- Main content area with conditional states -->
    <div class="content-wrapper">
      <!-- Error state -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="$emit('clear-error')"
      >
        {{ error }}
      </v-alert>
      
      <!-- Loading state with animation -->
      <v-card v-if="loading" class="state-card pa-8" elevation="0">
        <div class="d-flex flex-column justify-center align-center">
          <v-progress-circular 
            indeterminate 
            :color="iconColor" 
            size="64"
            width="5"
            class="mb-4"
          ></v-progress-circular>
          <span class="text-body-1 text-medium-emphasis">Loading data...</span>
        </div>
      </v-card>
      
      <!-- Empty state with improved visuals -->
      <v-card v-else-if="isEmpty" class="state-card pa-8 text-center" elevation="0">
        <div class="mb-4">
          <v-avatar :color="`${iconColor}-lighten-4`" size="80" class="mb-4">
            <v-icon :icon="emptyStateIcon" :color="iconColor" size="40"></v-icon>
          </v-avatar>
        </div>
        <h3 class="text-h5 mb-2">{{ emptyStateTitle }}</h3>
        <p class="text-body-1 text-medium-emphasis mb-6 max-width-400">
          {{ searchQuery ? emptySearchMessage : emptyStateMessage }}
        </p>
        <slot name="empty-state-actions">
          <v-btn v-if="primaryAction" :color="iconColor" variant="elevated" @click="$emit('primary-action')">
            <v-icon :icon="primaryActionIcon" class="mr-2"></v-icon>
            {{ primaryAction }}
          </v-btn>
        </slot>
      </v-card>
      
      <!-- Content with card wrapping -->
      <template v-else>
        <slot :viewType="selectedViewType"></slot>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useDisplay } from 'vuetify';

// Define props
const props = defineProps({
  // Content
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  iconColor: {
    type: String,
    default: 'primary',
  },
  
  // Actions
  primaryAction: {
    type: String,
    default: '',
  },
  primaryActionIcon: {
    type: String,
    default: 'mdi-plus',
  },
  
  // Search
  showSearch: {
    type: Boolean,
    default: true,
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...',
  },
  
  // View toggle
  showViewToggle: {
    type: Boolean,
    default: false,
  },
  viewType: {
    type: String,
    default: 'table',
  },
  
  // Refresh 
  showRefresh: {
    type: Boolean,
    default: true,
  },
  
  // State
  loading: {
    type: Boolean,
    default: false,
  },
  isEmpty: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  
  // Empty state
  emptyStateIcon: {
    type: String,
    default: 'mdi-alert-circle-outline',
  },
  emptyStateTitle: {
    type: String,
    default: 'No items found',
  },
  emptyStateMessage: {
    type: String,
    default: 'There are no items to display.',
  },
  emptySearchMessage: {
    type: String,
    default: 'No items match your search criteria.',
  },
  
  // Pagination
  showPagination: {
    type: Boolean,
    default: false,
  },
  showItemsPerPageSelect: {
    type: Boolean,
    default: true,
  },
  page: {
    type: Number,
    default: 1,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  itemsPerPageOptions: {
    type: Array,
    default: () => [5, 10, 25, 50, 100],
  },
  totalItems: {
    type: Number,
    default: 0,
  },
});

// Reactive state
const searchQuery = ref('');
const isSearchExpanded = ref(false);
const currentPage = ref(props.page);
const selectedItemsPerPage = ref(props.itemsPerPage);
const selectedViewType = ref(props.viewType);
const display = useDisplay();

// Computed properties for pagination
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(props.totalItems / selectedItemsPerPage.value));
});

const startItem = computed(() => {
  return props.totalItems === 0 ? 0 : (currentPage.value - 1) * selectedItemsPerPage.value + 1;
});

const endItem = computed(() => {
  return Math.min(currentPage.value * selectedItemsPerPage.value, props.totalItems);
});

// Display breakpoints
const mdAndUp = computed(() => display.mdAndUp.value);
const smAndDown = computed(() => display.smAndDown.value);

// Watch for prop changes
watch(() => props.page, (newPage) => {
  currentPage.value = newPage;
});

watch(() => props.itemsPerPage, (newItemsPerPage) => {
  selectedItemsPerPage.value = newItemsPerPage;
});

watch(() => props.viewType, (newViewType) => {
  selectedViewType.value = newViewType;
});

watch(() => selectedViewType.value, (newViewType) => {
  emit('update:viewType', newViewType);
});

// Handle browser back/forward
watch(() => props.loading, (isLoading) => {
  if (!isLoading && props.page > 0) {
    currentPage.value = props.page;
  }
});

// Methods
const handleSearch = (value: string) => {
  searchQuery.value = value;
  currentPage.value = 1; // Reset to first page when searching
  emit('search', value);
};

const updateItemsPerPage = (value: number) => {
  selectedItemsPerPage.value = value;
  currentPage.value = 1; // Reset to first page when changing items per page
  emit('update-items-per-page', value);
};

// Close search on escape key for mobile
onMounted(() => {
  if (props.showSearch) {
    isSearchExpanded.value = mdAndUp.value;
  }
});

// Define emits
const emit = defineEmits([
  'search', 
  'primary-action', 
  'page-change', 
  'update-items-per-page', 
  'reset-filters',
  'refresh',
  'clear-error',
  'update:viewType'
]);
</script>

<style scoped>
.list-layout {
  max-width: 1200px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.header-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  overflow: visible;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.search-field {
  transition: all 0.3s ease;
  min-width: 200px;
}

@media (max-width: 600px) {
  .search-field-expanded {
    position: absolute;
    right: 16px;
    left: 16px;
    z-index: 10;
    background-color: var(--v-theme-surface);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.action-button {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.content-wrapper {
  position: relative;
  transition: all 0.3s ease;
}

.state-card {
  border-radius: 8px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.state-card:deep(.v-card-text) {
  width: 100%;
}

.content-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.empty-state {
  background-color: rgba(var(--v-theme-on-surface), 0.02);
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.1);
}

.max-width-400 {
  max-width: 400px;
  margin: 0 auto;
}

.pagination-container {
  background-color: rgba(var(--v-theme-on-surface), 0.02);
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.items-per-page-select :deep(.v-field__append-inner) {
  padding-inline-start: 8px;
}

/* Animation for content transitions */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style> 