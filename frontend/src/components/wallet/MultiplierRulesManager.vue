<template>
  <div class="multiplier-rules-manager">
    <!-- Statistics Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="primary" theme="dark">
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-format-list-bulleted" size="large" class="mr-2"></v-icon>
              <div class="text-h6">Total Rules</div>
            </div>
            <div class="text-h4">{{ multiplierRules.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="success" theme="dark">
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-check-circle" size="large" class="mr-2"></v-icon>
              <div class="text-h6">Active Rules</div>
            </div>
            <div class="text-h4">{{ activeRules }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="info" theme="dark">
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-fire" size="large" class="mr-2"></v-icon>
              <div class="text-h6">Streak Rules</div>
            </div>
            <div class="text-h4">{{ streakRules }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="warning" theme="dark">
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-star-multiple" size="large" class="mr-2"></v-icon>
              <div class="text-h6">Avg Multiplier</div>
            </div>
            <div class="text-h4">{{ averageMultiplier }}x</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div class="manager-header">
      <div class="d-flex align-center">
        <v-icon icon="mdi-star-multiple" size="large" color="primary" class="mr-2"></v-icon>
        <h2>Multiplier Rules</h2>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus-circle" @click="showDialog = true">Add Multiplier Rule</v-btn>
    </div>
    
    <div class="manager-filters">
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            label="Search rules"
            prepend-inner-icon="mdi-magnify"
            single-line
            hide-details
            density="compact"
            class="search-field"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="typeFilter"
            :items="typeOptions"
            label="Type"
            hide-details
            density="compact"
            prepend-inner-icon="mdi-filter-variant"
            class="filter-select"
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            label="Sort By"
            hide-details
            density="compact"
            prepend-inner-icon="mdi-sort"
            class="sort-select"
          ></v-select>
        </v-col>
      </v-row>
    </div>

    <List
      :headers="headers"
      :rows="formattedMultiplierRules"
      :loading="isLoadingMultiplierRules"
      :itemsPerPage="itemsPerPage"
      :sortableColumns="['multiplier', 'created_at']"
      :actions="tableActions"
      @rowClick="handleRowClick"
      @sort="handleSort"
    >
      <template #item-condition_type="{ row }">
        <div class="d-flex align-center">
          <v-avatar
            :color="getConditionTypeColor(row.condition_type)"
            size="32"
            class="mr-2"
          >
            <v-icon :icon="getConditionTypeIcon(row.condition_type)" color="white" size="small"></v-icon>
          </v-avatar>
          <span class="text-subtitle-1">{{ formatConditionType(row.condition_type) }}</span>
        </div>
      </template>

      <template #item-multiplier="{ row }">
        <div class="d-flex align-center">
          <v-avatar
            :color="getMultiplierColor(row.multiplier)"
            size="32"
            class="mr-2"
          >
            <v-icon icon="mdi-rocket-launch" color="white" size="small"></v-icon>
          </v-avatar>
          <span
            class="text-subtitle-1 font-weight-bold"
            :class="getMultiplierTextClass(row.multiplier)"
          >
            {{ row.multiplier }}x
          </span>
        </div>
      </template>

      <template #item-created_at="{ row }">
        <div class="d-flex align-center">
          <v-avatar
            color="grey-lighten-1"
            size="32"
            class="mr-2"
          >
            <v-icon icon="mdi-calendar-clock" color="white" size="small"></v-icon>
          </v-avatar>
          <div class="d-flex flex-column">
            <div class="cell-title">{{ formatDate(row.created_at) }}</div>
            <div class="cell-subtitle">{{ formatTime(row.created_at) }}</div>
          </div>
        </div>
      </template>

      <template #item-status="{ row }">
        <div class="d-flex align-center">
          <v-avatar
            :color="row.status ? 'success' : 'error'"
            size="32"
            class="mr-2"
          >
            <v-icon :icon="row.status ? 'mdi-check-circle' : 'mdi-close-circle'" color="white" size="small"></v-icon>
          </v-avatar>
          <span :class="['status-text', row.status ? 'status-green' : 'status-red']">
            {{ row.status ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </template>

      <template #item-condition_value="{ row }">
        <div class="d-flex align-center">
          <v-avatar
            color="grey-lighten-1"
            size="32"
            class="mr-2"
          >
            <v-icon icon="mdi-code-braces" color="white" size="small"></v-icon>
          </v-avatar>
          <div class="d-flex flex-column">
            <div class="cell-title">{{ formatConditionValue(row.condition_value) }}</div>
          </div>
        </div>
      </template>
    </List>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon :icon="isEditing ? 'mdi-pencil-circle' : 'mdi-plus-circle'" class="mr-2" :color="isEditing ? 'warning' : 'success'"></v-icon>
          {{ isEditing ? 'Edit Multiplier Rule' : 'Add Multiplier Rule' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="isFormValid">
            <v-text-field
              v-model="formData.name"
              label="Rule Name"
              :rules="[v => !!v || 'Rule name is required']"
              required
              prepend-inner-icon="mdi-tag"
            ></v-text-field>
            <v-text-field
              v-model="formData.description"
              label="Description"
              :rules="[v => !!v || 'Description is required']"
              required
              prepend-inner-icon="mdi-text"
            ></v-text-field>
            <v-select
              v-model="formData.condition_type"
              :items="conditionTypeOptions"
              label="Condition Type"
              :rules="[v => !!v || 'Condition type is required']"
              required
              prepend-inner-icon="mdi-filter-variant"
            ></v-select>
            <v-text-field
              v-model="formData.multiplier"
              label="Points Multiplier"
              type="number"
              step="0.1"
              :rules="[v => !!v || 'Multiplier is required']"
              required
              prepend-inner-icon="mdi-rocket-launch"
            ></v-text-field>
            
            <!-- Condition Value Editor -->
            <div v-if="formData.condition_type === 'streak'" class="condition-value-editor">
              <div class="text-subtitle-1 mb-2">Streak Thresholds</div>
              <div v-for="(multiplier, days) in getStreakThresholds()" :key="days" class="d-flex align-center mb-2">
                <v-text-field
                  v-model="getStreakThresholds()[days]"
                  :label="`${days} Days Multiplier`"
                  type="number"
                  step="0.1"
                  class="mr-2"
                  density="compact"
                ></v-text-field>
                <v-btn
                  icon="mdi-delete"
                  color="error"
                  variant="text"
                  @click="deleteStreakThreshold(days)"
                ></v-btn>
              </div>
              <v-btn
                color="primary"
                variant="text"
                prepend-icon="mdi-plus"
                @click="addStreakThreshold"
              >
                Add Threshold
              </v-btn>
            </div>
            <v-text-field
              v-else
              v-model="formData.condition_value"
              label="Condition Value"
              :rules="[v => !!v || 'Condition value is required']"
              required
              prepend-inner-icon="mdi-code-braces"
            ></v-text-field>
            
            <v-text-field
              v-model="formData.start_date"
              label="Start Date"
              type="date"
              prepend-inner-icon="mdi-calendar-start"
            ></v-text-field>
            <v-text-field
              v-model="formData.end_date"
              label="End Date"
              type="date"
              prepend-inner-icon="mdi-calendar-end"
            ></v-text-field>
            <v-switch
              v-model="formData.is_active"
              label="Active"
              hide-details
              color="success"
              prepend-icon="mdi-power"
            ></v-switch>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDialog = false" prepend-icon="mdi-close">Cancel</v-btn>
          <v-btn
            color="primary"
            :disabled="!isFormValid"
            @click="handleSubmit"
            :loading="isLoadingMultiplierRules"
            :prepend-icon="isEditing ? 'mdi-content-save' : 'mdi-plus-circle'"
          >
            {{ isEditing ? 'Update' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon icon="mdi-alert-circle" color="error" class="mr-2"></v-icon>
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this multiplier rule?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDeleteDialog = false" prepend-icon="mdi-close">Cancel</v-btn>
          <v-btn color="error" @click="handleDelete" :loading="isLoadingMultiplierRules" prepend-icon="mdi-delete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useWalletStore } from '@/client/stores/wallet';
import type { MultiplierRule } from '@/client/api';
import List from '@/components/common/List.vue';

interface Action {
  label: string;
  icon: string;
  color: string;
  tooltip: string;
  handler: (row: MultiplierRule) => void;
}

interface TableHeader {
  title: string;
  key: string;
  sortable: boolean;
}

// Helper functions for date formatting
const formatDate = (date: string) => new Date(date).toLocaleDateString();
const formatTime = (date: string) => new Date(date).toLocaleTimeString();

const store = useWalletStore();
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const isEditing = ref(false);
const isFormValid = ref(false);
const form = ref();
const search = ref('');
const typeFilter = ref('all');
const sortBy = ref('name');
const itemsPerPage = ref(10);

interface FormData {
  id?: number;
  name: string;
  description: string;
  multiplier: number;
  condition_type: 'streak' | 'special_event' | 'time_of_day' | 'location' | 'custom';
  condition_value: {
    streak_thresholds?: Record<string, number>;
  } | string;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

const formData = ref<FormData>({
  name: '',
  description: '',
  multiplier: 1.0,
  condition_type: 'streak',
  condition_value: { streak_thresholds: {} },
  is_active: true,
  start_date: '',
  end_date: ''
});

const headers: TableHeader[] = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Description', key: 'description', sortable: true },
  { title: 'Condition Type', key: 'condition_type', sortable: true },
  { title: 'Multiplier', key: 'multiplier', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Created', key: 'created_at', sortable: true },
];

const typeOptions = [
  { title: 'All Types', value: 'all' },
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' }
];

const conditionTypeOptions = [
  { title: 'Attendance Streak', value: 'streak' },
  { title: 'Special Event', value: 'special_event' },
  { title: 'Time of Day', value: 'time_of_day' },
  { title: 'Location Based', value: 'location' },
  { title: 'Custom Rule', value: 'custom' }
];

const sortOptions = [
  { title: 'Name', value: 'name' },
  { title: 'Created Date', value: 'created_at' },
  { title: 'Status', value: 'status' }
];

const tableActions = [
  {
    label: 'Edit',
    icon: 'mdi-pencil',
    color: 'primary',
    tooltip: 'Edit rule',
    handler: (row: MultiplierRule) => handleRowClick(row)
  },
  {
    label: 'Delete',
    icon: 'mdi-delete',
    color: 'error',
    tooltip: 'Delete rule',
    handler: (row: MultiplierRule) => handleDelete(row)
  }
];

const multiplierRules = computed(() => store.multiplierRules);
const isLoadingMultiplierRules = computed(() => store.isLoadingMultiplierRules);

const activeRules = computed(() => 
  multiplierRules.value.filter(rule => rule.is_active).length
);

const streakRules = computed(() => 
  multiplierRules.value.filter(rule => rule.condition_type === 'streak').length
);

const averageMultiplier = computed(() => {
  const activeRules = multiplierRules.value.filter(rule => rule.is_active);
  if (activeRules.length === 0) return 0;
  const sum = activeRules.reduce((acc, rule) => acc + rule.multiplier, 0);
  return (sum / activeRules.length).toFixed(1);
});

const formattedMultiplierRules = computed(() => {
  let filtered = [...multiplierRules.value];
  
  // Apply search filter
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    filtered = filtered.filter(rule => 
      rule.name.toLowerCase().includes(searchLower) ||
      rule.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Apply type filter
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(rule => 
      typeFilter.value === 'active' ? rule.is_active : !rule.is_active
    );
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'status':
        return a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1;
      default:
        return 0;
    }
  });
  
  // Add status field for custom slot
  return filtered.map(rule => ({
    ...rule,
    status: rule.is_active
  }));
});

const getConditionTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    streak: 'error',
    special_event: 'success',
    time_of_day: 'info',
    location: 'warning',
    custom: 'primary'
  };
  return colors[type] || 'grey';
};

const getConditionTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    streak: 'mdi-fire',
    special_event: 'mdi-star',
    time_of_day: 'mdi-clock',
    location: 'mdi-map-marker',
    custom: 'mdi-cog'
  };
  return icons[type] || 'mdi-help';
};

const formatConditionType = (type: string) => {
  const types: Record<string, string> = {
    streak: 'Attendance Streak',
    special_event: 'Special Event',
    time_of_day: 'Time of Day',
    location: 'Location Based',
    custom: 'Custom Rule'
  };
  return types[type] || type;
};

const getMultiplierColor = (multiplier: number) => {
  if (multiplier >= 2) return 'error';
  if (multiplier >= 1.5) return 'warning';
  return 'success';
};

const getMultiplierTextClass = (multiplier: number) => {
  if (multiplier >= 2) return 'text-error';
  if (multiplier >= 1.5) return 'text-warning';
  return 'text-success';
};

const handleRowClick = (row: MultiplierRule) => {
  isEditing.value = true;
  formData.value = {
    id: row.id,
    name: row.name,
    description: row.description,
    multiplier: row.multiplier,
    condition_type: row.condition_type,
    condition_value: typeof row.condition_value === 'string' 
      ? JSON.parse(row.condition_value) 
      : row.condition_value,
    is_active: row.is_active,
    start_date: row.start_date || '',
    end_date: row.end_date || ''
  };
  showDialog.value = true;
};

const handleSort = (column: string) => {
  sortBy.value = column;
};

const handleDelete = (row: MultiplierRule) => {
  if (row.id) {
    store.editMultiplierRule(row.id, { ...row, is_active: false });
  }
};

const handleSubmit = async () => {
  if (!form.value.validate()) return;

  try {
    if (isEditing.value && formData.value.id) {
      await store.editMultiplierRule(formData.value.id, formData.value);
    } else {
      await store.addMultiplierRule(formData.value);
    }
    showDialog.value = false;
    resetForm();
  } catch (error) {
    console.error('Error saving multiplier rule:', error);
  }
};

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    multiplier: 1.0,
    condition_type: 'streak',
    condition_value: { streak_thresholds: {} },
    is_active: true,
    start_date: '',
    end_date: ''
  };
  isEditing.value = false;
  form.value?.reset();
};

const getStreakThresholds = () => {
  if (typeof formData.value.condition_value === 'object' && formData.value.condition_value.streak_thresholds) {
    return formData.value.condition_value.streak_thresholds;
  }
  return {};
};

const addStreakThreshold = () => {
  const thresholds = getStreakThresholds();
  const days = Object.keys(thresholds).length + 1;
  if (typeof formData.value.condition_value === 'object') {
    if (!formData.value.condition_value.streak_thresholds) {
      formData.value.condition_value.streak_thresholds = {};
    }
    formData.value.condition_value.streak_thresholds[days.toString()] = 1.0;
  }
};

const deleteStreakThreshold = (days: string) => {
  if (typeof formData.value.condition_value === 'object' && formData.value.condition_value.streak_thresholds) {
    delete formData.value.condition_value.streak_thresholds[days];
  }
};

const formatConditionValue = (value: any) => {
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  
  if (value && typeof value === 'object' && value.streak_thresholds) {
    return Object.entries(value.streak_thresholds)
      .map(([days, multiplier]) => `${days} days: ${multiplier}x`)
      .join(', ');
  }
  
  return JSON.stringify(value);
};

onMounted(async () => {
  await store.fetchMultiplierRules();
});

watch(showDialog, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});
</script>

<style scoped>
.multiplier-rules-manager {
  padding: 20px;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.manager-filters {
  margin-bottom: 20px;
}

.search-field,
.filter-select,
.sort-select {
  max-width: 100%;
}

.stat-card {
  height: 100%;
}

.cell-status {
  display: flex;
  align-items: center;
}

.status-text {
  font-weight: 500;
}

.status-green {
  color: var(--v-success-base);
}

.status-red {
  color: var(--v-error-base);
}

.cell-title {
  font-size: 0.875rem;
  font-weight: 500;
}

.cell-subtitle {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}
</style> 