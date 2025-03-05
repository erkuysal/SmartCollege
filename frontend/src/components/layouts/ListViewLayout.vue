<template>
  <v-container fluid class="py-4 px-4">
    <!-- Page Header with Search and Actions -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="d-flex align-center">
        <v-icon size="large" :color="iconColor || 'primary'" class="mr-3">{{ icon }}</v-icon>
        <h1 class="text-h5 font-weight-medium mb-0">{{ title }}</h1>
      </div>
      
      <v-spacer></v-spacer>
      
      <!-- Search Field -->
      <v-text-field
        v-if="showSearch"
        v-model="searchQuery"
        prepend-inner-icon="mdi-magnify"
        :label="searchLabel"
        hide-details
        density="compact"
        class="mx-2"
        style="max-width: 300px;"
        @update:model-value="handleSearch"
        clearable
      ></v-text-field>
      
      <!-- View Toggle -->
      <v-btn-toggle
        v-if="showViewToggle"
        v-model="viewTypeModel"
        mandatory
        density="comfortable"
        class="mx-2"
        color="primary"
      >
        <v-btn value="table" variant="text">
          <v-icon>mdi-table</v-icon>
        </v-btn>
        <v-btn value="card" variant="text">
          <v-icon>mdi-view-grid</v-icon>
        </v-btn>
      </v-btn-toggle>
      
      <!-- Add Button -->
      <v-btn 
        v-if="showAddButton"
        color="primary" 
        prepend-icon="mdi-plus"
        @click="$emit('add')"
        class="mr-2"
      >
        {{ addButtonText }}
      </v-btn>
      
      <!-- Refresh Button -->
      <v-btn 
        v-if="showRefreshButton"
        icon
        variant="text"
        @click="$emit('refresh')"
        :loading="loading"
        color="grey-darken-1"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>

      <!-- Extra Actions Slot -->
      <slot name="actions"></slot>
    </div>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      class="mb-4"
      variant="tonal"
      closable
      @click:close="$emit('clear-error')"
    >
      {{ error }}
    </v-alert>

    <!-- Custom Alert Slot -->
    <slot name="alerts"></slot>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center my-8">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <!-- Empty State -->
    <v-card
      v-else-if="isEmpty"
      class="pa-8 text-center"
      variant="outlined"
    >
      <v-icon size="64" color="grey-lighten-1" class="mb-4">{{ emptyIcon }}</v-icon>
      <h3 class="text-h6 mb-2">{{ emptyTitle }}</h3>
      <p class="text-body-1 text-grey mb-4">
        {{ searchQuery ? emptySearchText : emptyText }}
      </p>
      <v-btn 
        v-if="showAddButton"
        color="primary" 
        prepend-icon="mdi-plus"
        @click="$emit('add')"
      >
        {{ addButtonText }}
      </v-btn>
      <slot name="empty-actions"></slot>
    </v-card>

    <!-- Content -->
    <template v-else>
      <slot :view-type="viewTypeModel"></slot>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
// @ts-ignore
import debounce from 'lodash/debounce';

const props = defineProps({
  // Basic props
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    default: 'primary'
  },
  
  // Data state
  loading: {
    type: Boolean,
    default: false
  },
  isEmpty: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  
  // Search
  showSearch: {
    type: Boolean,
    default: true
  },
  searchLabel: {
    type: String,
    default: 'Search'
  },
  
  // View toggle
  showViewToggle: {
    type: Boolean,
    default: true
  },
  viewType: {
    type: String,
    default: 'table'
  },
  
  // Add button
  showAddButton: {
    type: Boolean,
    default: true
  },
  addButtonText: {
    type: String,
    default: 'Add'
  },
  
  // Refresh button
  showRefreshButton: {
    type: Boolean,
    default: true
  },
  
  // Empty state
  emptyIcon: {
    type: String,
    default: 'mdi-alert-circle-outline'
  },
  emptyTitle: {
    type: String,
    default: 'No Items Found'
  },
  emptyText: {
    type: String,
    default: 'Get started by adding your first item.'
  },
  emptySearchText: {
    type: String,
    default: 'No items match your search criteria.'
  }
});

const emit = defineEmits([
  'search', 
  'update:viewType', 
  'add', 
  'refresh', 
  'clear-error'
]);

// Search functionality
const searchQuery = ref('');

const handleSearch = debounce((value: string) => {
  emit('search', value);
}, 300);

// View type with two-way binding
const viewTypeModel = computed({
  get: () => props.viewType,
  set: (value) => emit('update:viewType', value)
});

// Watch for external changes to search query
watch(() => props.loading, (newValue) => {
  // Reset search when data is refreshed
  if (newValue === true) {
    searchQuery.value = '';
  }
});
</script>

<style scoped>
/* Add any custom styles here */
</style> 