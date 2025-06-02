<template>
  <div class="departments-view">
    <PageHeader
      title="Department Management"
      subtitle="View and manage academic departments"
      :actions="headerActions"
    />

    <!-- Filters -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filters.faculty"
              :items="facultyOptions"
              label="Filter by Faculty"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="filters.search"
              label="Search Departments"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              @keyup.enter="applyFilters"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4" class="d-flex align-center">
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

    <!-- Departments Table -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredDepartments"
        :loading="loading"
        :search="filters.search"
        class="elevation-0"
      >
        <!-- Department Name -->
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar
              :color="getFacultyColor(item.faculty)"
              size="32"
              class="mr-2"
            >
              <span class="text-subtitle-2 font-weight-medium text-white">{{ item.name.charAt(0) }}</span>
            </v-avatar>
            <router-link 
              :to="{ name: 'department-details', params: { id: item.id } }"
              class="text-decoration-none font-weight-medium"
            >
              {{ item.name }}
            </router-link>
          </div>
        </template>

        <!-- Faculty -->
        <template v-slot:item.faculty="{ item }">
          <v-chip
            :color="getFacultyColor(item.faculty)"
            size="small"
            class="text-white"
          >
            {{ getFacultyName(item.faculty) }}
          </v-chip>
        </template>

        <!-- Head of Department -->
        <template v-slot:item.head_of_department="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="28" class="mr-2 bg-grey-lighten-4">
              <v-icon size="small">mdi-account</v-icon>
            </v-avatar>
            {{ item.head_of_department }}
          </div>
        </template>

        <!-- Status -->
        <template v-slot:item.is_active="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'error'"
            size="small"
            variant="outlined"
          >
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex">
            <v-btn
              icon
              variant="text"
              size="small"
              color="primary"
              :to="{ name: 'department-details', params: { id: item.id } }"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              @click="editDepartment(item)"
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
      </v-data-table>
    </v-card>
    
    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5 bg-primary text-white py-3 px-4">
          {{ isEditing ? 'Edit Department' : 'Create New Department' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="form" @submit.prevent="saveDepartment">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.name"
                  label="Department Name"
                  variant="outlined"
                  :rules="[v => !!v || 'Name is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.faculty"
                  :items="facultyOptions"
                  label="Faculty"
                  variant="outlined"
                  :rules="[v => !!v || 'Faculty is required']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.head_of_department"
                  label="Head of Department"
                  variant="outlined"
                  :rules="[v => !!v || 'Head of department is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.office_location"
                  label="Office Location"
                  variant="outlined"
                  :rules="[v => !!v || 'Office location is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="editedItem.is_active"
                  color="primary"
                  label="Active"
                ></v-switch>
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
            @click="saveDepartment"
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
          Are you sure you want to delete this department?
          <div class="mt-3 pa-3 bg-error-lighten-5 rounded">
            <p><strong>Department:</strong> {{ deleteItem?.name }}</p>
            <p><strong>Faculty:</strong> {{ getFacultyName(deleteItem?.faculty) }}</p>
            <p><strong>Head:</strong> {{ deleteItem?.head_of_department }}</p>
          </div>
          <div class="mt-3 text-caption text-medium-emphasis">
            This action cannot be undone. All courses and staff associated with this department will be affected.
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
            @click="deleteDepartment"
            :loading="deleteLoading"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import PageHeader from '@/views/components/PageHeader.vue';
import apiClient from '@/utils/apiClient';
import { API_ROUTES } from '@/utils/config/apiRoutes';

// Data
const departments = ref([]);
const faculties = ref([]);
const loading = ref(true);

// Filters
const filters = ref({
  faculty: 'all',
  search: ''
});

// Dialog states
const editDialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const editedItem = ref({
  id: null,
  name: '',
  faculty: null,
  head_of_department: '',
  office_location: '',
  is_active: true
});
const defaultItem = {
  id: null,
  name: '',
  faculty: null,
  head_of_department: '',
  office_location: '',
  is_active: true
};
const deleteItem = ref(null);
const saveLoading = ref(false);
const deleteLoading = ref(false);

// Form reference
const form = ref(null);

// Header definitions
const headers = [
  { title: 'Department', key: 'name', sortable: true },
  { title: 'Faculty', key: 'faculty', sortable: true },
  { title: 'Head of Department', key: 'head_of_department', sortable: true },
  { title: 'Office', key: 'office_location', sortable: true },
  { title: 'Status', key: 'is_active', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

// Header actions
const headerActions = [
  { 
    icon: 'mdi-plus', 
    text: 'Add Department',
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

// Faculty colors mapping
const facultyColors = {
  1: 'primary',   // Science
  2: 'success',   // Engineering
  3: 'warning'    // Arts
};

// Computed properties
const facultyOptions = computed(() => {
  return [
    { title: 'All Faculties', value: 'all' },
    ...faculties.value.map(faculty => ({
      title: faculty.name,
      value: faculty.id
    }))
  ];
});

const filteredDepartments = computed(() => {
  let result = [...departments.value];
  
  if (filters.value.faculty !== 'all') {
    result = result.filter(item => item.faculty === filters.value.faculty);
  }
  
  return result;
});

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([
    fetchDepartments(),
    fetchFaculties()
  ]);
});

// Methods
async function fetchDepartments() {
  loading.value = true;
  try {
    const response = await apiClient.get(API_ROUTES.DEPARTMENTS_ROUTE);
    departments.value = response.data.results || response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    // Mock data for development
    departments.value = [
      {
        "id": 5,
        "name": "Biology",
        "head_of_department": "Dr. Biology Head",
        "office_location": "Faculty of Science Building, Room 172",
        "is_active": true,
        "faculty": 1
      },
      {
        "id": 1,
        "name": "Computer Science",
        "head_of_department": "Dr. Computer Head",
        "office_location": "Faculty of Science Building, Room 247",
        "is_active": true,
        "faculty": 1
      },
      {
        "id": 10,
        "name": "English Literature",
        "head_of_department": "Dr. English Head",
        "office_location": "Faculty of Arts Building, Room 346",
        "is_active": true,
        "faculty": 3
      }
    ];
  } finally {
    loading.value = false;
  }
}

async function fetchFaculties() {
  try {
    const response = await apiClient.get(API_ROUTES.FACULTIES_ROUTE);
    faculties.value = response.data.results || response.data;
  } catch (error) {
    console.error('Error fetching faculties:', error);
    // Mock data for development
    faculties.value = [
      {
        "id": 1,
        "name": "Faculty of Science",
        "code": "SCI"
      },
      {
        "id": 2,
        "name": "Faculty of Engineering",
        "code": "ENG"
      },
      {
        "id": 3,
        "name": "Faculty of Arts",
        "code": "ART"
      }
    ];
  }
}

function getFacultyName(facultyId) {
  const faculty = faculties.value.find(f => f.id === facultyId);
  return faculty ? faculty.name : 'Unknown Faculty';
}

function getFacultyColor(facultyId) {
  return facultyColors[facultyId] || 'grey';
}

function applyFilters() {
  // The computed property handles filtering
}

function resetFilters() {
  filters.value = {
    faculty: 'all',
    search: ''
  };
}

function openCreateDialog() {
  isEditing.value = false;
  editedItem.value = { ...defaultItem };
  editDialog.value = true;
}

function editDepartment(item) {
  isEditing.value = true;
  editedItem.value = { ...item };
  editDialog.value = true;
}

function closeEditDialog() {
  editDialog.value = false;
}

function confirmDelete(item) {
  deleteItem.value = item;
  deleteDialog.value = true;
}

async function saveDepartment() {
  saveLoading.value = true;
  
  try {
    if (isEditing.value && editedItem.value.id) {
      // Update existing department
      await apiClient.put(`${API_ROUTES.DEPARTMENTS_ROUTE}${editedItem.value.id}/`, editedItem.value);
    } else {
      // Create new department
      await apiClient.post(API_ROUTES.DEPARTMENTS_ROUTE, editedItem.value);
    }
    
    await fetchDepartments();
    closeEditDialog();
  } catch (error) {
    console.error('Error saving department:', error);
  } finally {
    saveLoading.value = false;
  }
}

async function deleteDepartment() {
  if (!deleteItem.value) return;
  
  deleteLoading.value = true;
  
  try {
    await apiClient.delete(`${API_ROUTES.DEPARTMENTS_ROUTE}${deleteItem.value.id}/`);
    await fetchDepartments();
    deleteDialog.value = false;
  } catch (error) {
    console.error('Error deleting department:', error);
  } finally {
    deleteLoading.value = false;
  }
}

function exportData() {
  // Implement export functionality
  console.log('Export departments');
}
</script>

<style scoped>
.departments-view {
  min-height: calc(100vh - 120px);
}
</style> 