<template>
  <div class="semester-manager">
    <!-- Header Actions -->
    <div class="manager-header">
      <div class="header-actions">
        <v-btn
          color="primary"
          icon="mdi-plus"
          @click="showAddModal = true"
          title="Add Semester"
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

      <!-- Semesters Table -->
      <List
        v-else
        :headers="semesterTableHeaders"
        :rows="semesterTableRows"
        :actions="semesterTableActions"
        :showActions="true"
      >
        <template #item-academic_year="{ row }">
          <div class="d-flex align-center">
            <v-icon icon="mdi-calendar-multiselect" class="mr-2" color="primary"></v-icon>
            <span class="font-weight-bold">{{ row.academic_year_name }}</span>
          </div>
        </template>
        <template #item-semester_type="{ row }">
          <div class="d-flex align-center">
            <v-icon icon="mdi-calendar-range" class="mr-2" color="primary"></v-icon>
            <span class="font-weight-bold">{{ row.semester_type }}</span>
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
        <template #item-registration_start="{ row }">
          <span>{{ formatDate(row.registration_start) }}</span>
        </template>
        <template #item-registration_end="{ row }">
          <span>{{ formatDate(row.registration_end) }}</span>
        </template>
      </List>
    </div>

    <!-- Edit Semester Dialog -->
    <v-dialog
      :model-value="!!editingSemester"
      @update:model-value="val => editingSemester = val ? editingSemester : null"
      max-width="500px"
    >
      <v-card v-if="editingSemester">
        <v-card-title>Edit Semester</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleUpdateSemester">
            <v-select
              v-model="editingSemester.academic_year"
              :items="academicYearItems"
              label="Academic Year"
              item-title="label"
              item-value="value"
              required
              variant="outlined"
            />
            <v-select
              v-model="editingSemester.semester_type"
              :items="semesterTypes"
              label="Semester Type"
              item-title="title"
              item-value="value"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="editingSemester.start_date"
              label="Start Date"
              type="date"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="editingSemester.end_date"
              label="End Date"
              type="date"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="editingSemester.registration_start"
              label="Registration Start Date"
              type="date"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="editingSemester.registration_end"
              label="Registration End Date"
              type="date"
              required
              variant="outlined"
            />
            <v-switch
              v-model="editingSemester.is_active"
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
            @click="editingSemester = null"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="handleUpdateSemester"
            :loading="isLoading"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Semester Dialog -->
    <v-dialog
      :model-value="showAddModal"
      @update:model-value="val => showAddModal = val"
      max-width="500px"
    >
      <v-card>
        <v-card-title>Add Semester</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleAddSemester">
            <v-select
              v-model="newSemester.academic_year"
              :items="academicYearItems"
              label="Academic Year"
              item-title="label"
              item-value="value"
              required
              variant="outlined"
            />
            <v-select
              v-model="newSemester.semester_type"
              :items="semesterTypes"
              label="Semester Type"
              item-title="title"
              item-value="value"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="newSemester.start_date"
              label="Start Date"
              type="date"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="newSemester.end_date"
              label="End Date"
              type="date"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="newSemester.registration_start"
              label="Registration Start Date"
              type="date"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="newSemester.registration_end"
              label="Registration End Date"
              type="date"
              required
              variant="outlined"
            />
            <v-switch
              v-model="newSemester.is_active"
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
            @click="handleAddSemester"
            :loading="isLoading"
          >
            Add Semester
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  getSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
  getAcademicYears,
  type Semester,
  type AcademicYear,
  type PaginatedResponse
} from '@/client/api.ts';
import List from '@/components/common/List.vue';
import Filter from '@/components/common/Filter.vue';
import { useUIStore } from '@/client/stores/ui.ts';

type SortField = 'name' | 'academic_year' | 'start_date' | 'end_date';

// State
const semesters = ref<Semester[]>([]);
const academicYears = ref<AcademicYear[]>([]);
const error = ref('');
const isLoading = ref(false);
const searchQuery = ref('');
const sortBy = ref<SortField>('name');
const currentPage = ref(1);
const itemsPerPage = 12;
const totalPages = ref(1);
const totalItems = ref(0);
const editingSemester = ref<Semester | null>(null);
const showAddModal = ref(false);

const newSemester = ref({
  academic_year: null as number | null,
  semester_type: 'fall' as 'fall' | 'spring' | 'summer',
  start_date: '',
  end_date: '',
  registration_start: '',
  registration_end: '',
  is_active: true
});

const semesterTypes = [
  { title: 'Fall', value: 'fall' },
  { title: 'Spring', value: 'spring' },
  { title: 'Summer', value: 'summer' }
];

const uiStore = useUIStore();

const filters = ref([
  {
    type: 'search' as const,
    label: 'Search semesters...',
    value: searchQuery.value
  },
  {
    type: 'select' as const,
    label: 'Sort by',
    value: sortBy.value,
    items: [
      { title: 'Sort by Academic Year', value: 'academic_year' },
      { title: 'Sort by Semester Type', value: 'semester_type' },
      { title: 'Sort by Start Date', value: 'start_date' },
      { title: 'Sort by End Date', value: 'end_date' }
    ]
  }
]);

const academicYearItems = computed(() => {
  return academicYears.value.map(year => ({
    label: year.year,
    value: year.id
  }));
});

const semesterTableHeaders = [
  'Academic Year',
  'Semester Type',
  'Start Date',
  'End Date',
  'Registration Period',
  'Status',
];

const semesterTableRows = computed(() => {
  return semesters.value.map(semester => ({
    ...semester,
    academic_year_name: academicYears.value.find(y => y.id === semester.academic_year)?.year || 'Unknown',
    semester_type_display: semester.semester_type.charAt(0).toUpperCase() + semester.semester_type.slice(1),
    registration_period: `${new Date(semester.registration_start).toLocaleDateString()} - ${new Date(semester.registration_end).toLocaleDateString()}`,
    status: semester.is_active ? 'Active' : 'Inactive'
  }));
});

const semesterTableActions = [
  {
    label: 'Edit',
    icon: 'mdi-pencil',
    color: 'primary',
    handler: (semester: Semester) => {
      editingSemester.value = { ...semester };
    }
  },
  {
    label: 'Delete',
    icon: 'mdi-delete',
    color: 'error',
    handler: async (semester: Semester) => {
      if (confirm('Are you sure you want to delete this semester?')) {
        try {
          isLoading.value = true;
          await deleteSemester(semester.id);
          await fetchSemesters();
          uiStore.showSuccess('Semester deleted successfully');
        } catch (err) {
          error.value = err instanceof Error ? err.message : 'Failed to delete semester';
          uiStore.showError(error.value);
        } finally {
          isLoading.value = false;
        }
      }
    }
  }
];

async function fetchSemesters() {
  try {
    isLoading.value = true;
    const response = await getSemesters();
    const data = response.data as PaginatedResponse<Semester>;
    semesters.value = data.results;
    totalItems.value = data.count;
    totalPages.value = Math.ceil(data.count / itemsPerPage);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch semesters';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
}

async function fetchAcademicYears() {
  try {
    const response = await getAcademicYears();
    const data = response.data as PaginatedResponse<AcademicYear>;
    academicYears.value = data.results;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch academic years';
    uiStore.showError(error.value);
  }
}

async function handleAddSemester() {
  if (!newSemester.value.academic_year) {
    uiStore.showError('Please select an academic year');
    return;
  }

  try {
    isLoading.value = true;
    await createSemester({
      academic_year: newSemester.value.academic_year,
      semester_type: newSemester.value.semester_type,
      start_date: newSemester.value.start_date,
      end_date: newSemester.value.end_date,
      registration_start: newSemester.value.registration_start,
      registration_end: newSemester.value.registration_end,
      is_active: newSemester.value.is_active
    });
    await fetchSemesters();
    showAddModal.value = false;
    newSemester.value = {
      academic_year: null,
      semester_type: 'fall',
      start_date: '',
      end_date: '',
      registration_start: '',
      registration_end: '',
      is_active: true
    };
    uiStore.showSuccess('Semester added successfully');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add semester';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
}

async function handleUpdateSemester() {
  if (!editingSemester.value) return;
  
  try {
    isLoading.value = true;
    await updateSemester(editingSemester.value.id, {
      academic_year: editingSemester.value.academic_year,
      semester_type: editingSemester.value.semester_type,
      start_date: editingSemester.value.start_date,
      end_date: editingSemester.value.end_date,
      registration_start: editingSemester.value.registration_start,
      registration_end: editingSemester.value.registration_end,
      is_active: editingSemester.value.is_active
    });
    await fetchSemesters();
    editingSemester.value = null;
    uiStore.showSuccess('Semester updated successfully');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update semester';
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
  fetchSemesters();
});

// Initial data fetch
onMounted(() => {
  fetchSemesters();
  fetchAcademicYears();
});

const formatDate = (date: string) => new Date(date).toLocaleDateString();
</script>

<style scoped>
.semester-manager {
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
</style> 