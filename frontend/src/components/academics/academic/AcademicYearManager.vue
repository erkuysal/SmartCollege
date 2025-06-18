<template>
  <div class="academic-year-manager">
    <!-- Header Actions -->
    <div class="manager-header">
      <div class="header-actions">
        <v-btn
          color="primary"
          icon="mdi-plus"
          @click="showAddModal = true"
          title="Add Academic Year"
        />
      </div>

      <!-- Search and Filter Section -->
      <Filter :filters="filters" @change="handleFilterChange" />
    </div>

    <!-- Main Content -->
    <div class="manager-content">
      <!-- Loading State -->
      <v-progress-circular
        v-if="isLoading"
        indeterminate
        color="primary"
        class="loading-spinner"
      />

      <!-- Error State -->
      <v-alert
        v-else-if="error"
        type="error"
        variant="tonal"
        class="error-alert"
      >
        {{ error }}
      </v-alert>

      <!-- Academic Years Table -->
      <List
        v-else
        :headers="academicYearTableHeaders"
        :rows="academicYearTableRows"
        :actions="academicYearTableActions"
        :showActions="true"
      >
        <template #item-year="{ row }">
          <div class="d-flex align-center">
            <v-icon icon="mdi-calendar-multiselect" class="mr-2" color="primary"></v-icon>
            <span class="font-weight-bold">{{ row.year }}</span>
          </div>
        </template>
        <template #item-is_active="{ row }">
          <v-chip :color="row.is_active ? 'success' : 'error'" size="small" variant="flat">
            {{ row.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>
        <template #item-start_date="{ row }">
          <span>{{ formatDate(row.start_date) }}</span>
        </template>
        <template #item-end_date="{ row }">
          <span>{{ formatDate(row.end_date) }}</span>
        </template>
      </List>
    </div>

    <!-- Edit Academic Year Dialog -->
    <v-dialog
      :model-value="!!editingYear"
      @update:model-value="val => editingYear = val ? editingYear : null"
      max-width="500px"
    >
      <v-card v-if="editingYear">
        <v-card-title>Edit Academic Year</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleUpdateYear">
            <v-text-field
              v-model="editingYear.year"
              label="Year"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="editingYear.duration"
              label="Duration"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="editingYear.start_date"
              label="Start Date"
              type="date"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="editingYear.end_date"
              label="End Date"
              type="date"
              required
              variant="outlined"
            />
            <v-switch
              v-model="editingYear.is_active"
              label="Active"
              color="primary"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="editingYear = null"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="handleUpdateYear"
            :loading="isLoading"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Academic Year Dialog -->
    <v-dialog
      :model-value="showAddModal"
      @update:model-value="val => showAddModal = val"
      max-width="500px"
    >
      <v-card>
        <v-card-title>Add Academic Year</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleAddYear">
            <v-text-field
              v-model="newYear.year"
              label="Year"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="newYear.duration"
              label="Duration"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="newYear.start_date"
              label="Start Date"
              type="date"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="newYear.end_date"
              label="End Date"
              type="date"
              required
              variant="outlined"
            />
            <v-switch
              v-model="newYear.is_active"
              label="Active"
              color="primary"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showAddModal = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="handleAddYear"
            :loading="isLoading"
          >
            Add Academic Year
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  getAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  type AcademicYear,
  type PaginatedResponse
} from '@/client/api.ts';
import List from '@/components/common/List.vue';
import Filter from '@/components/common/Filter.vue';
import { useUIStore } from '@/client/stores/ui.ts';

type SortField = 'year' | 'duration' | 'start_date' | 'end_date';

// State
const academicYears = ref<AcademicYear[]>([]);
const error = ref('');
const isLoading = ref(false);
const searchQuery = ref('');
const sortBy = ref<SortField>('year');
const currentPage = ref(1);
const itemsPerPage = 12;
const totalPages = ref(1);
const totalItems = ref(0);
const editingYear = ref<AcademicYear | null>(null);
const showAddModal = ref(false);

const newYear = ref({
  year: '',
  duration: '',
  start_date: '',
  end_date: '',
  is_active: true
});

const uiStore = useUIStore();

const filters = ref([
  {
    type: 'search' as const,
    label: 'Search academic years...',
    value: searchQuery.value
  },
  {
    type: 'select' as const,
    label: 'Sort by',
    value: sortBy.value,
    items: [
      { title: 'Sort by Year', value: 'year' },
      { title: 'Sort by Duration', value: 'duration' },
      { title: 'Sort by Start Date', value: 'start_date' },
      { title: 'Sort by End Date', value: 'end_date' }
    ]
  }
]);

const academicYearTableHeaders = [
  'Year',
  'Duration',
  'Start Date',
  'End Date',
  'Status',
];

const academicYearTableRows = computed(() => {
  return academicYears.value.map(year => ({
    ...year,
    status: year.is_active ? 'Active' : 'Inactive',
    is_current: year.is_current ? 'Current' : ''
  }));
});

const academicYearTableActions = [
  {
    label: 'Edit',
    icon: 'mdi-pencil',
    color: 'primary',
    handler: (year: AcademicYear) => {
      editingYear.value = { ...year };
    }
  },
  {
    label: 'Delete',
    icon: 'mdi-delete',
    color: 'error',
    handler: async (year: AcademicYear) => {
      if (confirm('Are you sure you want to delete this academic year?')) {
        try {
          isLoading.value = true;
          await deleteAcademicYear(year.id);
          await fetchAcademicYears();
          uiStore.showSuccess('Academic year deleted successfully');
        } catch (err) {
          error.value = err instanceof Error ? err.message : 'Failed to delete academic year';
          uiStore.showError(error.value);
        } finally {
          isLoading.value = false;
        }
      }
    }
  }
];

async function fetchAcademicYears() {
  try {
    isLoading.value = true;
    const response = await getAcademicYears();
    const data = response.data as PaginatedResponse<AcademicYear>;
    academicYears.value = data.results;
    totalItems.value = data.count;
    totalPages.value = Math.ceil(data.count / itemsPerPage);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch academic years';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
}

async function handleAddYear() {
  try {
    isLoading.value = true;
    await createAcademicYear(newYear.value);
    await fetchAcademicYears();
    showAddModal.value = false;
    newYear.value = {
      year: '',
      duration: '',
      start_date: '',
      end_date: '',
      is_active: true
    };
    uiStore.showSuccess('Academic year added successfully');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add academic year';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
}

async function handleUpdateYear() {
  if (!editingYear.value) return;
  
  try {
    isLoading.value = true;
    await updateAcademicYear(editingYear.value.id, {
      year: editingYear.value.year,
      duration: editingYear.value.duration,
      start_date: editingYear.value.start_date,
      end_date: editingYear.value.end_date,
      is_active: editingYear.value.is_active
    });
    await fetchAcademicYears();
    editingYear.value = null;
    uiStore.showSuccess('Academic year updated successfully');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update academic year';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
}

function handleFilterChange(newFilters: typeof filters.value) {
  searchQuery.value = newFilters[0].value;
  sortBy.value = newFilters[1].value as SortField;
}

// Watch for changes in pagination and filters
watch([currentPage, searchQuery, sortBy], () => {
  fetchAcademicYears();
});

// Initial data fetch
onMounted(() => {
  fetchAcademicYears();
});

const formatDate = (date: string) => new Date(date).toLocaleDateString();
</script>

<style scoped>
.academic-year-manager {
  padding: 16px;
}

.manager-header {
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.manager-content {
  position: relative;
  min-height: 200px;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.error-alert {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 