<template>
  <div class="enrollments-view">
    <PageHeader
      title="Enrollment Management"
      subtitle="View and manage student course enrollments"
      :actions="headerActions"
    />

    <!-- Filters -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4" md="3">
            <v-text-field
              v-model="filters.search"
              label="Search Students"
              prepend-inner-icon="mdi-magnify"
              hide-details
              variant="outlined"
              density="comfortable"
              @update:model-value="applyFilters"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4" md="3">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="Status"
              hide-details
              variant="outlined"
              density="comfortable"
              @update:model-value="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4" md="3">
            <v-select
              v-model="filters.section"
              :items="sectionOptions"
              label="Section"
              hide-details
              variant="outlined"
              density="comfortable"
              @update:model-value="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4" md="3" class="d-flex align-center">
            <v-btn
              color="primary"
              variant="text"
              @click="resetFilters"
              class="ml-auto"
            >
              Reset Filters
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Enrollments Table -->
    <v-card>
      <v-data-table
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="filteredEnrollments"
        :loading="loading"
        :search="filters.search"
        :sort-by="[{ key: 'date_enrolled', order: 'desc' }]"
        class="elevation-0"
      >
        <!-- Student Name -->
        <template v-slot:item.student_name="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="32" class="mr-2">
              <span class="text-subtitle-2 font-weight-medium">{{ item.student_name.charAt(0).toUpperCase() }}</span>
            </v-avatar>
            <router-link 
              :to="{ name: 'student-details', params: { id: item.student } }"
              class="text-decoration-none font-weight-medium"
            >
              {{ item.student_name }}
            </router-link>
          </div>
        </template>

        <!-- Section/Course -->
        <template v-slot:item.section="{ item }">
          <div>{{ getSectionName(item.section) }}</div>
        </template>

        <!-- Status -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            class="text-capitalize"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Date Enrolled -->
        <template v-slot:item.date_enrolled="{ item }">
          <div>{{ formatDate(item.date_enrolled) }}</div>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex">
            <v-btn
              icon
              variant="text"
              size="small"
              color="primary"
              :to="{ name: 'enrollment-details', params: { id: item.id } }"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              @click="editEnrollment(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              color="error"
              @click="confirmDelete(item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>

        <!-- Empty state -->
        <template v-slot:no-data>
          <div class="d-flex flex-column align-center py-6">
            <v-icon
              icon="mdi-calendar-remove"
              size="64"
              color="grey-lighten-1"
              class="mb-4"
            ></v-icon>
            <h3 class="text-h6 font-weight-regular text-grey-darken-1">No enrollment records found</h3>
            <p class="text-body-2 text-grey-darken-1 mt-1">Try changing your search criteria or create a new enrollment</p>
            <v-btn
              color="primary"
              class="mt-4"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
            >
              Add Enrollment
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5 bg-primary text-white py-3 px-4">
          {{ isEditing ? 'Edit Enrollment' : 'Add New Enrollment' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="form" @submit.prevent="saveEnrollment">
            <v-row>
              <v-col cols="12" sm="6">
                <v-autocomplete
                  v-model="editedItem.student"
                  label="Student"
                  :items="studentOptions"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  :rules="[v => !!v || 'Student is required']"
                  required
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="6">
                <v-autocomplete
                  v-model="editedItem.section"
                  label="Section"
                  :items="sectionOptions"
                  variant="outlined"
                  :rules="[v => !!v || 'Section is required']"
                  required
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.status"
                  label="Status"
                  :items="statusOptions"
                  variant="outlined"
                  :rules="[v => !!v || 'Status is required']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.date_enrolled"
                  label="Enrollment Date"
                  type="date"
                  variant="outlined"
                  :rules="[v => !!v || 'Date is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.notes"
                  label="Notes"
                  variant="outlined"
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="closeEditDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveEnrollment"
            :loading="saveLoading"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 bg-error text-white py-3 px-4">
          Confirm Deletion
        </v-card-title>
        <v-card-text class="pa-4 pt-6">
          Are you sure you want to remove this enrollment record?
          <div class="mt-3 pa-3 bg-error-lighten-5 rounded">
            <p><strong>Student:</strong> {{ deleteItem?.student_name }}</p>
            <p><strong>Course:</strong> {{ getSectionName(deleteItem?.section) }}</p>
            <p><strong>Status:</strong> {{ deleteItem?.status }}</p>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            @click="deleteEnrollment"
            :loading="deleteLoading"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Notification Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      <div class="d-flex align-center">
        <v-icon v-if="snackbar.icon" :icon="snackbar.icon" class="mr-2" size="small"></v-icon>
        {{ snackbar.text }}
      </div>
      
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="snackbar.show = false"
        ></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import PageHeader from '@/views/components/PageHeader.vue';
import apiClient from '@/utils/apiClient';
import { API_ROUTES } from '@/utils/config/apiRoutes';
import { format, parseISO } from 'date-fns';

// Type definitions
interface Student {
  id: number;
  name: string;
}

interface Section {
  id: number;
  name: string;
}

interface Enrollment {
  id: number;
  student_name: string;
  status: string;
  date_enrolled: string;
  date_status_changed: string;
  grade: string | null;
  notes: string | null;
  student: number;
  section: number;
}

// Snackbar notifications
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000,
  icon: 'mdi-check-circle'
});

// Show notification
const showNotification = (text: string, color = 'success', icon = '') => {
  snackbar.value.text = text;
  snackbar.value.color = color;
  snackbar.value.icon = icon || (color === 'success' ? 'mdi-check-circle' : 
                              color === 'error' ? 'mdi-alert-circle' : 
                              color === 'warning' ? 'mdi-alert' : 'mdi-information');
  snackbar.value.show = true;
};

// Table configuration
const loading = ref(true);
const itemsPerPage = ref(10);

// Data
const enrollments = ref<Enrollment[]>([]);
const sections = ref<Section[]>([]);
const students = ref<Student[]>([]);

// Filters
const filters = ref({
  search: '',
  status: 'all',
  section: 'all'
});

// Dialog states
const editDialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const editedItem = ref<{
  id: number | null;
  student: number | null;
  section: number | null;
  status: string;
  date_enrolled: string;
  notes: string | null;
}>({
  id: null,
  student: null,
  section: null,
  status: 'registered',
  date_enrolled: new Date().toISOString().substr(0, 10),
  notes: null
});
const defaultItem = {
  id: null,
  student: null,
  section: null,
  status: 'registered',
  date_enrolled: new Date().toISOString().substr(0, 10),
  notes: null
};
const deleteItem = ref<Enrollment | null>(null);
const saveLoading = ref(false);
const deleteLoading = ref(false);

// Form reference
const form = ref(null);

// Header definitions
const headers = [
  { title: 'Student', key: 'student_name', sortable: true },
  { title: 'Course/Section', key: 'section', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Date Enrolled', key: 'date_enrolled', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const }
];

// Filter options
const statusOptions = [
  { title: 'All Statuses', value: 'all' },
  { title: 'Registered', value: 'registered' },
  { title: 'Waitlisted', value: 'waitlisted' },
  { title: 'Dropped', value: 'dropped' }
];

// Computed properties
const sectionOptions = computed(() => {
  return [
    { title: 'All Sections', value: 'all' },
    ...sections.value.map(section => ({
      title: section.name,
      value: section.id
    }))
  ];
});

const studentOptions = computed(() => {
  return students.value.map(student => ({
    name: student.name,
    id: student.id
  }));
});

const filteredEnrollments = computed(() => {
  let result = [...enrollments.value];
  
  if (filters.value.status !== 'all') {
    result = result.filter(item => item.status === filters.value.status);
  }
  
  if (filters.value.section !== 'all') {
    result = result.filter(item => String(item.section) === String(filters.value.section));
  }
  
  return result;
});

const headerActions = [
  { 
    icon: 'mdi-plus', 
    text: 'Add Enrollment',
    color: 'primary',
    handler: openCreateDialog
  },
  { 
    icon: 'mdi-file-export', 
    text: 'Export', 
    variant: 'outlined',
    handler: exportData
  }
];

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([
    fetchEnrollments(),
    fetchSections(),
    fetchStudents()
  ]);
});

// Methods
async function fetchEnrollments() {
  loading.value = true;
  try {
    const response = await apiClient.get(API_ROUTES.ENROLLMENT_ROUTE);
    // Type assertion for API response
    const data = response.data as unknown;
    enrollments.value = ((data as any).results || data as any) as Enrollment[];
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    showNotification('Failed to load enrollment data', 'error');
    
    // Mock data for development
    enrollments.value = [
      {
        id: 1,
        student_name: 'student0',
        status: 'registered',
        date_enrolled: '2025-04-27T11:35:57.329528Z',
        date_status_changed: '2025-04-28T11:35:57.331754Z',
        grade: null,
        notes: null,
        student: 1,
        section: 1485
      },
      // Add more mock data as needed
    ];
  } finally {
    loading.value = false;
  }
}

async function fetchSections() {
  try {
    // This should be implemented to fetch actual sections
    sections.value = [
      { id: 1485, name: 'Course 1 - Section A' },
      { id: 839, name: 'Course 2 - Section B' },
      { id: 943, name: 'Course 3 - Section C' },
    ];
  } catch (error) {
    console.error('Error fetching sections:', error);
    showNotification('Failed to load section data', 'error');
  }
}

async function fetchStudents() {
  try {
    // This should be implemented to fetch actual students
    students.value = [
      { id: 1, name: 'Student 0' },
      { id: 2, name: 'Student 1' },
      { id: 3, name: 'Student 2' },
    ];
  } catch (error) {
    console.error('Error fetching students:', error);
    showNotification('Failed to load student data', 'error');
  }
}

function getSectionName(sectionId: number | undefined | null): string {
  if (sectionId === undefined || sectionId === null) {
    return 'Unknown Section';
  }
  const section = sections.value.find(s => s.id === sectionId);
  return section ? section.name : `Section ${sectionId}`;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'registered': 'success',
    'waitlisted': 'warning',
    'dropped': 'error'
  };
  return colors[status] || 'grey';
}

function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch (e) {
    return dateString;
  }
}

function applyFilters(): void {
  // The computed property handles filtering
}

function resetFilters(): void {
  filters.value = {
    search: '',
    status: 'all',
    section: 'all'
  };
}

function openCreateDialog(): void {
  isEditing.value = false;
  editedItem.value = { ...defaultItem };
  editDialog.value = true;
}

function editEnrollment(item: Enrollment): void {
  isEditing.value = true;
  editedItem.value = { ...item };
  editDialog.value = true;
}

function closeEditDialog(): void {
  editDialog.value = false;
  editedItem.value = { ...defaultItem };
}

async function saveEnrollment(): Promise<void> {
  saveLoading.value = true;
  
  try {
    if (isEditing.value && editedItem.value.id) {
      // Update existing enrollment
      await apiClient.put(`${API_ROUTES.ENROLLMENT_ROUTE}${editedItem.value.id}/`, editedItem.value);
      showNotification('Enrollment updated successfully');
    } else {
      // Create new enrollment
      const response = await apiClient.post(API_ROUTES.ENROLLMENT_ROUTE, editedItem.value);
      showNotification('Enrollment created successfully');
    }
    
    await fetchEnrollments();
    closeEditDialog();
  } catch (error) {
    console.error('Error saving enrollment:', error);
    showNotification('Failed to save enrollment', 'error');
  } finally {
    saveLoading.value = false;
  }
}

function confirmDelete(item: Enrollment): void {
  deleteItem.value = item;
  deleteDialog.value = true;
}

async function deleteEnrollment(): Promise<void> {
  if (!deleteItem.value) return;
  
  deleteLoading.value = true;
  
  try {
    await apiClient.delete(`${API_ROUTES.ENROLLMENT_ROUTE}${deleteItem.value.id}/`);
    showNotification('Enrollment deleted successfully');
    await fetchEnrollments();
    deleteDialog.value = false;
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    showNotification('Failed to delete enrollment', 'error');
  } finally {
    deleteLoading.value = false;
  }
}

function exportData(): void {
  // Implement export functionality
  showNotification('Export functionality will be implemented soon', 'info');
}
</script>

<style scoped>
.enrollments-view {
  min-height: calc(100vh - 120px);
}
</style> 