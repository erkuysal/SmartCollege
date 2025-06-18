<template>
  <div class="activity-type-manager">
    <!-- Statistics Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="primary" theme="dark">
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-format-list-bulleted" size="large" class="mr-2"></v-icon>
              <div class="text-h6">Total Activities</div>
            </div>
            <div class="text-h4">{{ activityTypes.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="success" theme="dark">
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-check-circle" size="large" class="mr-2"></v-icon>
              <div class="text-h6">Active Activities</div>
            </div>
            <div class="text-h4">{{ activeTypes }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="info" theme="dark">
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-star-plus" size="large" class="mr-2"></v-icon>
              <div class="text-h6">Earning Activities</div>
            </div>
            <div class="text-h4">{{ creditTypes }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="warning" theme="dark">
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-star-minus" size="large" class="mr-2"></v-icon>
              <div class="text-h6">Spending Activities</div>
            </div>
            <div class="text-h4">{{ debitTypes }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div class="manager-header">
      <div class="d-flex align-center">
        <v-icon icon="mdi-tag-multiple" size="large" color="primary" class="mr-2"></v-icon>
        <h2>Activity Types</h2>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus-circle" @click="showDialog = true">Add Activity Type</v-btn>
    </div>
    
    <div class="manager-filters">
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            label="Search activities"
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
      :rows="formattedActivityTypes"
      :loading="isLoadingActivityTypes"
      :itemsPerPage="itemsPerPage"
      :sortableColumns="['name', 'created_at']"
      :actions="tableActions"
      @rowClick="handleRowClick"
      @sort="handleSort"
    >
      <template #item-name="{ row }">
        <div class="d-flex align-center">
          <v-avatar
            :color="getActivityTypeColor(row.id)"
            size="32"
            class="mr-2"
          >
            <v-icon :icon="getActivityTypeIcon(row.id)" color="white" size="small"></v-icon>
          </v-avatar>
          <span class="text-subtitle-1">{{ row.name }}</span>
        </div>
      </template>

      <template #item-points="{ row }">
        <div class="d-flex align-center">
          <v-avatar
            color="info"
            size="32"
            class="mr-2"
          >
            <v-icon icon="mdi-star" color="white" size="small"></v-icon>
          </v-avatar>
          <span class="text-subtitle-1 font-weight-bold text-info">
            Activity Type
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
        <div class="cell-status">
          <v-avatar
            :color="row.is_active ? 'success' : 'error'"
            size="32"
            class="mr-2"
          >
            <v-icon :icon="row.is_active ? 'mdi-check-circle' : 'mdi-close-circle'" color="white" size="small"></v-icon>
          </v-avatar>
          <span :class="['status-text', row.is_active ? 'status-green' : 'status-red']">
            {{ row.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </template>
    </List>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon :icon="isEditing ? 'mdi-pencil-circle' : 'mdi-plus-circle'" class="mr-2" :color="isEditing ? 'warning' : 'success'"></v-icon>
          {{ isEditing ? 'Edit Activity Type' : 'Add Activity Type' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="isFormValid">
            <v-text-field
              v-model="formData.name"
              label="Activity Name"
              :rules="[v => !!v || 'Activity name is required']"
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
            @click="saveActivityType"
            :loading="isLoadingActivityTypes"
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
          Are you sure you want to delete this activity type?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDeleteDialog = false" prepend-icon="mdi-close">Cancel</v-btn>
          <v-btn color="error" @click="deleteActivityType" :loading="isLoadingActivityTypes" prepend-icon="mdi-delete">
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
import type { ActivityType } from '@/client/api';
import List from '@/components/common/List.vue';

const walletStore = useWalletStore();
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const isEditing = ref(false);
const isFormValid = ref(false);
const search = ref('');
const form = ref();
const selectedActivityType = ref<ActivityType | null>(null);
const typeFilter = ref('all');
const sortBy = ref('created_at');
const currentPage = ref(1);
const itemsPerPage = ref(10);

const typeOptions = [
  { title: 'All', value: 'all' },
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' }
];

const sortOptions = [
  { title: 'Date', value: 'created_at' },
  { title: 'Name', value: 'name' }
];

const headers = [
  {
    title: 'Name',
    key: 'name',
    sortable: true
  },
  {
    title: 'Description',
    key: 'description',
    sortable: false
  },
  {
    title: 'Created At',
    key: 'created_at',
    sortable: true
  },
  {
    title: 'Status',
    key: 'status',
    sortable: true
  }
];

const tableActions = [
  {
    label: 'Edit',
    handler: (row: any) => editActivityType(row)
  },
  {
    label: 'Delete',
    handler: (row: any) => confirmDelete(row)
  }
];

const formData = ref({
  name: '',
  description: '',
  is_active: true
});

const activityTypes = computed(() => walletStore.activityTypes);
const isLoadingActivityTypes = computed(() => walletStore.isLoadingActivityTypes);

const activeTypes = computed(() => {
  return activityTypes.value.filter(t => t.is_active).length;
});

const creditTypes = computed(() => 
  activityTypes.value.filter(type => type.is_active).length
);

const debitTypes = computed(() => 
  activityTypes.value.filter(type => !type.is_active).length
);

const formattedActivityTypes = computed(() => {
  let filtered = [...activityTypes.value];
  
  // Apply type filter
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(t => 
      typeFilter.value === 'active' ? t.is_active : !t.is_active
    );
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  return filtered.map(t => ({
    ...t,
    'name': t.name,
    'description': t.description,
    'created_at': t.created_at,
    'status': t.is_active ? 'Active' : 'Inactive'
  }));
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString();
};

const handleSearch = (value: string) => {
  search.value = value;
};

const handleSort = (column: string, direction: 'asc' | 'desc') => {
  sortBy.value = column;
};

const handleRowClick = (row: any) => {
  editActivityType(row);
};

onMounted(async () => {
  await walletStore.fetchActivityTypes();
});

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    is_active: true
  };
  isEditing.value = false;
  selectedActivityType.value = null;
};

const editActivityType = (activityType: ActivityType) => {
  isEditing.value = true;
  selectedActivityType.value = activityType;
  formData.value = {
    name: activityType.name,
    description: activityType.description,
    is_active: activityType.is_active
  };
  showDialog.value = true;
};

const confirmDelete = (activityType: ActivityType) => {
  selectedActivityType.value = activityType;
  showDeleteDialog.value = true;
};

const deleteActivityType = async () => {
  if (selectedActivityType.value) {
    await walletStore.removeActivityType(selectedActivityType.value.id);
    showDeleteDialog.value = false;
    selectedActivityType.value = null;
  }
};

const saveActivityType = async () => {
  if (!form.value?.validate()) return;

  const data = {
    name: formData.value.name,
    description: formData.value.description,
    is_active: formData.value.is_active
  };

  if (isEditing.value && selectedActivityType.value) {
    await walletStore.editActivityType(selectedActivityType.value.id, data);
  } else {
    await walletStore.addActivityType(data);
  }

  showDialog.value = false;
  resetForm();
};

// Watch for dialog close
watch(showDialog, (newVal: boolean) => {
  if (!newVal) {
    resetForm();
  }
});

const getActivityTypeColor = (id: number) => {
  const colors = ['primary', 'success', 'info', 'warning', 'error'];
  return colors[id % colors.length];
};

const getActivityTypeIcon = (id: number) => {
  const icons = [
    'mdi-school', // Education
    'mdi-book-open-variant', // Library
    'mdi-calendar-check', // Attendance
    'mdi-trophy', // Achievement
    'mdi-medal', // Award
    'mdi-account-group', // Group Activity
    'mdi-presentation', // Presentation
    'mdi-handshake', // Collaboration
    'mdi-lightbulb', // Innovation
    'mdi-heart', // Community Service
  ];
  return icons[id % icons.length];
};
</script>

<style scoped>
.activity-type-manager {
  padding: 12px 0;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.manager-filters {
  margin-bottom: 16px;
}

.stat-card {
  transition: transform 0.2s;
  border-radius: 12px;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.search-field,
.filter-select,
.sort-select {
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.cell-title {
  font-size: 0.875rem;
  font-weight: 500;
}

.cell-subtitle {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}

.cell-status {
  display: flex;
  align-items: center;
}

.status-text {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-green {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.status-red {
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.v-card {
  border-radius: 12px;
}

.v-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
}

.v-text-field,
.v-select {
  border-radius: 8px;
}
</style> 