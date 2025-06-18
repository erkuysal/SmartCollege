<template>
  <div class="students-view">
    <!-- Header Section -->
    <PageHeader title="Students">
      <template #subtitle>
        Manage and organize student information
      </template>
      <template #actions>
        <v-btn
          color="primary"
          icon="mdi-plus"
          @click="showAddModal = true"
          title="Add Student"
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

      <!-- Students Table -->
      <List
        v-else
        :headers="studentTableHeaders"
        :rows="studentTableRows"
        :actions="studentTableActions"
        :showActions="true"
      />

      <!-- Pagination -->
      <v-pagination
        v-if="totalPages > 1"
        v-model="currentPage"
        :length="totalPages"
        class="pagination"
      />
    </div>

    <!-- Edit Student Dialog -->
    <v-dialog
      :model-value="!!editingStudent"
      @update:model-value="val => editingStudent = val ? editingStudent : null"
      max-width="500px"
    >
      <v-card v-if="editingStudent">
        <v-card-title class="d-flex align-center">
          <v-icon start color="primary">mdi-account-edit</v-icon>
          Edit Student
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleUpdateStudent">
            <v-text-field
              v-model="editingStudent.first_name"
              label="First Name"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="editingStudent.last_name"
              label="Last Name"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="editingStudent.student_number"
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
            @click="editingStudent = null"
          >
            <v-icon start>mdi-close</v-icon>
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="handleUpdateStudent"
          >
            <v-icon start>mdi-content-save</v-icon>
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Student Dialog -->
    <v-dialog
      :model-value="!!showAddModal"
      @update:model-value="val => showAddModal = val"
      max-width="500px"
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start color="primary">mdi-account-plus</v-icon>
          Add Student
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleAddStudent">
            <v-text-field
              v-model="firstName"
              label="First name"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="lastName"
              label="Last name"
              required
              variant="outlined"
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
            <v-icon start>mdi-close</v-icon>
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="handleAddStudent"
            :loading="isLoading"
          >
            <v-icon start>mdi-plus</v-icon>
            Add Student
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  type Student,
  type PaginatedResponse
} from '@/client/api.ts';
import { useRfidStore } from '@/client/stores/rfid.ts';
import List from '@/components/common/List.vue';
import Filter from '@/components/common/Filter.vue';
import { useRouter } from 'vue-router';
import { useUIStore } from '@/client/stores/ui.ts';
import PageHeader from '@/components/common/PageHeader.vue';

type SortField = 'student_number' | 'first_name' | 'last_name';

// State
const students = ref<Student[]>([]);
const firstName = ref('');
const lastName = ref('');
const error = ref('');
const isLoading = ref(false);
const searchQuery = ref('');
const sortBy = ref<SortField>('student_number');
const currentPage = ref(1);
const itemsPerPage = 12;
const totalPages = ref(1);
const totalItems = ref(0);
const selectedStudent = ref<Student | null>(null);
const editingStudent = ref<Student | null>(null);
const showAddModal = ref(false);

const router = useRouter();
const rfidStore = useRfidStore();
const uiStore = useUIStore();

const filters = ref([
  {
    type: 'search' as const,
    label: 'Search students...',
    value: searchQuery.value
  },
  {
    type: 'select' as const,
    label: 'Sort by',
    value: sortBy.value,
    items: [
      { title: 'Sort by ID', value: 'student_number' },
      { title: 'Sort by First Name', value: 'first_name' },
      { title: 'Sort by Last Name', value: 'last_name' }
    ]
  }
]);

// Handle search
function handleSearch() {
  currentPage.value = 1; // Reset to first page on search
  fetchStudents();
}

// Handle sort
function handleSort(field: SortField) {
  sortBy.value = field;
  currentPage.value = 1; // Reset to first page on sort
  fetchStudents();
}

watch([searchQuery, sortBy], () => {
  filters.value[0].value = searchQuery.value;
  filters.value[1].value = sortBy.value;
});

function handleFilterChange(values: any[]) {
  searchQuery.value = values[0];
  sortBy.value = values[1];
  handleSearch();
  handleSort(values[1]);
}

// Fetch students with pagination
async function fetchStudents() {
  try {
    isLoading.value = true;
    error.value = '';
    const response = await getStudents();
    const data = response.data as PaginatedResponse<Student>;
    students.value = data.results;
    totalItems.value = data.count;
    totalPages.value = Math.ceil(data.count / itemsPerPage);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to fetch students';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
}

// Handle student creation
async function handleAddStudent() {
  try {
    isLoading.value = true;
    error.value = '';
    await createStudent({
      first_name: firstName.value,
      last_name: lastName.value
    });
    showAddModal.value = false;
    firstName.value = '';
    lastName.value = '';
    await fetchStudents();
    uiStore.showSuccess('Student added successfully');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to add student';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
}

// Handle student update
async function handleUpdateStudent() {
  if (!editingStudent.value) return;

  try {
    isLoading.value = true;
    error.value = '';
    await updateStudent(editingStudent.value.id, {
      first_name: editingStudent.value.first_name,
      last_name: editingStudent.value.last_name
    });
    editingStudent.value = null;
    await fetchStudents();
    uiStore.showSuccess('Student updated successfully');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to update student';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
}

// Handle student deletion
async function handleDeleteStudent(student: Student) {
  try {
    isLoading.value = true;
    error.value = '';
    await deleteStudent(student.id);
    await fetchStudents();
    uiStore.showSuccess('Student deleted successfully');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to delete student';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
}

// Handle student details view
function viewStudentDetails(student: Student) {
  router.push(`/students/${student.id}`);
}

// Handle student edit
function handleEditStudent(student: Student) {
  editingStudent.value = { ...student };
}

// Handle RFID scanning
async function scanRFID() {
  try {
    isLoading.value = true;
    const result = await rfidStore.scanRFID();
    if (editingStudent.value && result.student_number) {
      editingStudent.value.student_number = result.student_number;
    }
    uiStore.showSuccess('RFID tag scanned successfully');
  } catch (err: any) {
    uiStore.showError(err.response?.data?.message || 'Failed to scan RFID tag');
  } finally {
    isLoading.value = false;
  }
}

// Handle RFID writing
async function writeRFID() {
  if (!editingStudent.value) return;
  
  try {
    isLoading.value = true;
    await rfidStore.writeCard(editingStudent.value.student_number, editingStudent.value.student_number);
    uiStore.showSuccess('RFID tag written successfully');
  } catch (err: any) {
    uiStore.showError(err.response?.data?.message || 'Failed to write RFID tag');
  } finally {
    isLoading.value = false;
  }
}

// Add this function before the table actions definition
async function handleWriteToCard(student: Student) {
  try {
    isLoading.value = true;
    await rfidStore.writeCard(student.student_number, student.student_number);
    uiStore.showSuccess('RFID tag written successfully');
  } catch (err: any) {
    uiStore.showError(err.response?.data?.message || 'Failed to write RFID tag');
  } finally {
    isLoading.value = false;
  }
}

// Computed properties for filtering and sorting
const filteredStudents = computed(() => {
  let result = [...students.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(student =>
      student.first_name.toLowerCase().includes(query) ||
      student.last_name.toLowerCase().includes(query) ||
      student.student_number.toLowerCase().includes(query)
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
const studentTableHeaders = [
  'Student Number',
  'First Name',
  'Last Name',
  'RFID Tag'
];

const studentTableRows = computed(() =>
  filteredStudents.value.map(student => ({
    student_number: student.student_number,
    first_name: student.first_name,
    last_name: student.last_name,
    rfid_tag: student.student_number || 'Not assigned',
    _original: student // keep reference for actions
  }))
);

const studentTableActions = [
  {
    label: 'View',
    icon: 'mdi-eye',
    handler: (row: any) => viewStudentDetails(row._original)
  },
  {
    label: 'Edit',
    icon: 'mdi-pencil',
    handler: (row: any) => handleEditStudent(row._original)
  },
  {
    label: 'Write to Card',
    icon: 'mdi-card-account-details',
    handler: (row: any) => handleWriteToCard(row._original)
  },
  {
    label: 'Delete',
    icon: 'mdi-delete',
    handler: (row: any) => handleDeleteStudent(row._original)
  }
];

// Lifecycle hooks
onMounted(() => {
  fetchStudents();
});

// Watch for pagination changes
watch(currentPage, () => {
  fetchStudents();
});
</script>

<style lang="scss">
@use '../../styles/theme/index' as theme;

.students-view {
  padding: theme.$spacing-lg;
  min-height: 100vh;
}

.view-header {
  margin-bottom: theme.$spacing-lg;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: theme.$spacing-md;
}

.header-title {
  color: theme.$theme-text-primary;
  font-size: theme.$font-size-xl;
  font-weight: theme.$font-weight-bold;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: theme.$spacing-sm;
}

.search-filter-section {
  display: flex;
  gap: theme.$spacing-md;
  margin-bottom: theme.$spacing-md;

  .search-field {
    flex: 1;
    max-width: 400px;
  }

  .sort-field {
    width: 200px;
  }
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
  margin-bottom: theme.$spacing-md;
}

.pagination {
  margin-top: theme.$spacing-md;
  display: flex;
  justify-content: center;
}

// Dialog styles
.v-dialog {
  .v-card {
    background: theme.$theme-surface-1;
    border-radius: theme.$border-radius-lg;
  }

  .v-card-title {
    color: theme.$theme-text-primary;
    font-size: theme.$font-size-lg;
    font-weight: theme.$font-weight-semibold;
    padding: theme.$spacing-lg;
    border-bottom: 1px solid theme.$theme-border-light;
  }

  .v-card-text {
    padding: theme.$spacing-lg;
  }

  .v-card-actions {
    padding: theme.$spacing-md theme.$spacing-lg;
    border-top: 1px solid theme.$theme-border-light;
  }
}

// Improve input and select contrast in dark mode
.search-field .v-input__control,
.sort-field .v-input__control {
  background: theme.$theme-surface-2;
  color: theme.$theme-text-primary;
  border-radius: theme.$border-radius-md;
  border: 1px solid theme.$theme-border-light;

  @include theme.theme-dark {
    background: theme.$theme-surface-1;
    color: theme.$theme-text-primary;
    border: 1px solid theme.$theme-border-medium;
  }
}

.search-field input,
.sort-field input,
.search-field .v-field__input,
.sort-field .v-field__input {
  background: transparent;
  color: theme.$theme-text-primary;
}

.search-field .v-label,
.sort-field .v-label {
  color: theme.$theme-text-secondary;
}
</style>
