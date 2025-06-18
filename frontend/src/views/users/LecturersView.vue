<template>
  <div class="lecturers-view">
    <!-- Header Section -->
    <PageHeader title="Lecturers">
      <template #subtitle>
        Manage and organize lecturer information
      </template>
      <template #actions>
        <v-btn
          color="primary"
          icon="mdi-plus"
          @click="showAddModal = true"
          title="Add Lecturer"
        />
      </template>
    </PageHeader>

    <!-- Search and Filter Section -->
    <Filter :filters="filters" @change="handleFilterChange" />

    <!-- Main Content -->
    <div class="view-content">
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

      <!-- Lecturers Table -->
      <List
        v-else
        :headers="lecturerTableHeaders"
        :rows="lecturerTableRows"
        :actions="lecturerTableActions"
        :showActions="true"
      />
    </div>

    <!-- Add/Edit Lecturer Dialog -->
    <v-dialog
      :model-value="showAddModal || showEditModal"
      @update:model-value="val => { if (!val) closeModal() }"
      max-width="500px"
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start color="primary">{{ showEditModal ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon>
          {{ showEditModal ? 'Edit Lecturer' : 'Add New Lecturer' }}
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="submitLecturer">
            <v-text-field
              v-model="currentLecturer.first_name"
              label="First Name"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="currentLecturer.last_name"
              label="Last Name"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="currentLecturer.title"
              label="Title"
              variant="outlined"
            />
            <v-text-field
              v-model="currentLecturer.lecturer_number"
              label="RFID Tag"
              placeholder="Scan RFID card..."
              variant="outlined"
            >
              <template v-slot:append>
                <v-btn
                  icon="mdi-scan-helper"
                  @click="scanRFID"
                  variant="text"
                  title="Scan RFID"
                />
                <v-btn
                  icon="mdi-card-account-details"
                  @click="writeRFID"
                  variant="text"
                  title="Write RFID"
                />
              </template>
            </v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="closeModal"
          >
            <v-icon start>mdi-close</v-icon>
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="submitLecturer"
            :loading="isLoading"
          >
            <v-icon start>{{ showEditModal ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
            {{ showEditModal ? 'Update' : 'Add' }} Lecturer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      :model-value="showDeleteModal"
      @update:model-value="val => showDeleteModal = val"
      max-width="400px"
    >
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this lecturer?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showDeleteModal = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            @click="deleteLecturer"
            :loading="isLoading"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch } from 'vue'
import {
  getLecturers,
  createLecturer,
  updateLecturer,
  deleteLecturer as deleteLecturerApi,
  type Lecturer,
  type PaginatedResponse
} from '@/client/api.ts'
import List from '@/components/common/List.vue'
import Filter from '@/components/common/Filter.vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/client/stores/ui.ts'
import { useRfidStore } from '@/client/stores/rfid.ts'
import PageHeader from '@/components/common/PageHeader.vue'

const router = useRouter()
const uiStore = useUIStore()
const rfidStore = useRfidStore()

// State
const lecturers = ref<Lecturer[]>([])
const searchQuery = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isLoading = ref(false)
const error = ref('')
const currentPage = ref(1)
const itemsPerPage = 12
const totalPages = ref(1)
const totalItems = ref(0)

type SortField = 'lecturer_number' | 'first_name' | 'last_name' | 'email'
const sortBy = ref<SortField>('lecturer_number')

const filters = ref([
  {
    type: 'search' as const,
    label: 'Search lecturers...',
    value: searchQuery.value
  },
  {
    type: 'select' as const,
    label: 'Sort by',
    value: sortBy.value,
    items: [
      { title: 'Sort by Lecturer Number', value: 'lecturer_number' },
      { title: 'Sort by First Name', value: 'first_name' },
      { title: 'Sort by Last Name', value: 'last_name' },
      { title: 'Sort by Email', value: 'email' }
    ]
  }
])

interface LecturerForm {
  id: number;
  first_name: string;
  last_name: string;
  title?: string;
  lecturer_number?: string;
}

const currentLecturer = reactive<LecturerForm>({
  id: 0,
  first_name: '',
  last_name: '',
  title: '',
  lecturer_number: ''
})

const lecturerToDelete = ref<Lecturer | null>(null)

// Fetch lecturers with pagination
async function fetchLecturers() {
  try {
    isLoading.value = true;
    error.value = '';
    const response = await getLecturers();
    const data = response.data as PaginatedResponse<Lecturer>;
    lecturers.value = data.results;
    totalItems.value = data.count;
    totalPages.value = Math.ceil(data.count / itemsPerPage);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to fetch lecturers';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
}

// Handle lecturer creation
async function submitLecturer() {
  try {
    isLoading.value = true
    if (showEditModal.value) {
      await updateLecturer(currentLecturer.id, {
        first_name: currentLecturer.first_name,
        last_name: currentLecturer.last_name,
        title: currentLecturer.title,
        lecturer_number: currentLecturer.lecturer_number
      })
      uiStore.showSuccess('Lecturer updated successfully')
    } else {
      await createLecturer({
        first_name: currentLecturer.first_name,
        last_name: currentLecturer.last_name,
        title: currentLecturer.title
      })
      uiStore.showSuccess('Lecturer added successfully')
    }
    closeModal()
    await fetchLecturers()
  } catch (err: any) {
    uiStore.showError(err.response?.data?.message || 'Failed to save lecturer')
  } finally {
    isLoading.value = false
  }
}

// Handle lecturer deletion
async function deleteLecturer() {
  if (!lecturerToDelete.value) return;

  try {
    isLoading.value = true;
    error.value = '';
    await deleteLecturerApi(lecturerToDelete.value.id);
    showDeleteModal.value = false;
    lecturerToDelete.value = null;
    await fetchLecturers();
    uiStore.showSuccess('Lecturer deleted successfully');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to delete lecturer';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
}

// Handle search
function handleSearch() {
  currentPage.value = 1; // Reset to first page on search
  fetchLecturers();
}

// Handle sort
function handleSort(field: SortField) {
  sortBy.value = field;
  currentPage.value = 1; // Reset to first page on sort
  fetchLecturers();
}

function handleFilterChange(values: any[]) {
  searchQuery.value = values[0];
  sortBy.value = values[1];
  handleSearch();
  handleSort(values[1]);
}

function closeModal() {
  showAddModal.value = false;
  showEditModal.value = false;
  currentLecturer.id = 0;
  currentLecturer.first_name = '';
  currentLecturer.last_name = '';
  currentLecturer.title = '';
  currentLecturer.lecturer_number = '';
}

function editLecturer(lecturer: Lecturer) {
  currentLecturer.id = lecturer.id;
  currentLecturer.first_name = lecturer.first_name;
  currentLecturer.last_name = lecturer.last_name;
  currentLecturer.title = lecturer.title;
  currentLecturer.lecturer_number = lecturer.lecturer_number;
  showEditModal.value = true;
}

function confirmDelete(lecturer: Lecturer) {
  lecturerToDelete.value = lecturer;
  showDeleteModal.value = true;
}

// Handle RFID card writing
async function handleWriteToCard(lecturer: Lecturer) {
  try {
    uiStore.showSnackbar('Writing to RFID card...', 'info');
    await rfidStore.writeCard(lecturer.lecturer_number, lecturer.user_number);
    uiStore.showSuccess('Successfully wrote to RFID card!');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to write to card';
    uiStore.showError(error.value);
  }
}

// Add these methods in the script section
async function writeRFID() {
  try {
    isLoading.value = true
    await rfidStore.writeCard(currentLecturer.lecturer_number || '', currentLecturer.lecturer_number || '')
    uiStore.showSuccess('RFID tag written successfully')
  } catch (err: any) {
    uiStore.showError(err.response?.data?.message || 'Failed to write RFID tag')
  } finally {
    isLoading.value = false
  }
}

async function scanRFID() {
  try {
    isLoading.value = true
    const result = await rfidStore.scanRFID()
    if (result.student_number) {
      currentLecturer.lecturer_number = result.student_number
    }
    uiStore.showSuccess('RFID tag scanned successfully')
  } catch (err: any) {
    uiStore.showError(err.response?.data?.message || 'Failed to scan RFID tag')
  } finally {
    isLoading.value = false
  }
}

// Computed properties for filtering and sorting
const filteredLecturers = computed(() => {
  let result = [...lecturers.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(lecturer =>
      lecturer.first_name.toLowerCase().includes(query) ||
      lecturer.last_name.toLowerCase().includes(query) ||
      lecturer.lecturer_number.toLowerCase().includes(query) ||
      lecturer.email.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  result.sort((a, b) => {
    const field = sortBy.value;
    return a[field].localeCompare(b[field]);
  });

  return result;
});

// Table headers and rows for List.vue
const lecturerTableHeaders = [
  'Lecturer Code',
  'First Name',
  'Last Name',
  'Email',
  'Title'
];

const lecturerTableRows = computed(() =>
  filteredLecturers.value.map(lecturer => ({
    lecturer_code: lecturer.lecturer_number,
    first_name: lecturer.first_name,
    last_name: lecturer.last_name,
    email: lecturer.email,
    title: lecturer.title || 'N/A',
    _original: lecturer
  }))
);

const lecturerTableActions = [
  {
    label: 'View',
    icon: 'mdi-eye',
    handler: (row: any) => router.push(`/lecturers/${row._original.id}`)
  },
  {
    label: 'Edit',
    icon: 'mdi-pencil',
    handler: (row: any) => editLecturer(row._original)
  },
  {
    label: 'Write to Card',
    icon: 'mdi-card-account-details',
    handler: (row: any) => handleWriteToCard(row._original)
  },
  {
    label: 'Delete',
    icon: 'mdi-delete',
    handler: (row: any) => confirmDelete(row._original)
  }
];

// Lifecycle hooks
onMounted(() => {
  fetchLecturers();
});

// Watch for pagination changes
watch(currentPage, () => {
  fetchLecturers();
});

watch([searchQuery, sortBy], () => {
  filters.value[0].value = searchQuery.value;
  filters.value[1].value = sortBy.value;
});
</script>

<style lang="scss">
@use '../../styles/theme/index' as theme;

.lecturers-view {
  padding: theme.$spacing-lg;
  background-color: theme.$theme-surface-0;
  min-height: 100vh;
}

.view-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-title {
  color: white;
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

.search-filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-field {
  flex: 1;
  max-width: 400px;
}

.sort-field {
  width: 200px;
}

.view-content {
  position: relative;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.error-alert {
  margin-bottom: 24px;
}

:deep(.v-field) {
  background-color: #273142 !important;
  border-color: #313D4F !important;
}

:deep(.v-field__input) {
  color: white !important;
}

:deep(.v-field__outline) {
  border-color: #313D4F !important;
}

:deep(.v-field:hover .v-field__outline) {
  border-color: #738297 !important;
}

:deep(.v-field--focused .v-field__outline) {
  border-color: #2298F1 !important;
}

:deep(.v-field__append-inner) {
  color: #738297 !important;
}

:deep(.v-select__selection) {
  color: white !important;
}

:deep(.v-list) {
  background-color: #273142 !important;
}

:deep(.v-list-item) {
  color: white !important;
}

:deep(.v-list-item-subtitle) {
  color: #738297 !important;
}

:deep(.v-card) {
  background-color: #273142 !important;
  color: white !important;
}

:deep(.v-card-title) {
  color: white !important;
}

:deep(.v-card-text) {
  color: #738297 !important;
}

:deep(.v-btn) {
  text-transform: none !important;
}
</style>
