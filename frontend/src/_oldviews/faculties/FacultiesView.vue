<template>
  <div class="faculties-view">
    <PageHeader
      title="Faculty Management"
      subtitle="View and manage academic faculties"
      :actions="headerActions"
    />

    <!-- Faculties Cards -->
    <v-row>
      <v-col v-for="faculty in faculties" :key="faculty.id" cols="12" sm="6" md="4">
        <v-card 
          class="faculty-card" 
          :to="{ name: 'faculty-details', params: { id: faculty.id } }"
        >
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar 
                :color="getFacultyColor(faculty.code)" 
                class="mr-3"
              >
                <span class="text-h6 text-white">{{ faculty.code.charAt(0) }}</span>
              </v-avatar>
            </template>
            <v-card-title>{{ faculty.name }}</v-card-title>
            <v-card-subtitle>{{ faculty.code }}</v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <p class="mb-2">{{ faculty.description }}</p>
            
            <v-list-item density="compact" prepend-icon="mdi-account-tie">
              <v-list-item-title class="text-body-2">{{ faculty.dean }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">Dean</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item density="compact" prepend-icon="mdi-map-marker">
              <v-list-item-title class="text-body-2">{{ faculty.office_location }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">Office Location</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item v-if="getDepartmentsCount(faculty.id) > 0" density="compact" prepend-icon="mdi-domain">
              <v-list-item-title class="text-body-2">{{ getDepartmentsCount(faculty.id) }} Departments</v-list-item-title>
            </v-list-item>
          </v-card-text>

          <v-card-actions>
            <v-btn
              variant="text"
              color="primary"
              :to="{ name: 'faculty-details', params: { id: faculty.id } }"
            >
              View Details
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              icon
              variant="text"
              @click.stop="editFaculty(faculty)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      
      <!-- Add New Faculty Card -->
      <v-col cols="12" sm="6" md="4">
        <v-card 
          class="faculty-card new-faculty-card d-flex flex-column align-center justify-center"
          height="100%"
          @click="openCreateDialog"
        >
          <v-icon size="64" color="primary">mdi-plus-circle</v-icon>
          <span class="text-h6 mt-2">Add New Faculty</span>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5 bg-primary text-white py-3 px-4">
          {{ isEditing ? 'Edit Faculty' : 'Create New Faculty' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="form" @submit.prevent="saveFaculty">
            <v-row>
              <v-col cols="12" sm="8">
                <v-text-field
                  v-model="editedItem.name"
                  label="Faculty Name"
                  variant="outlined"
                  :rules="[v => !!v || 'Name is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="editedItem.code"
                  label="Code"
                  variant="outlined"
                  :rules="[v => !!v || 'Code is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.description"
                  label="Description"
                  variant="outlined"
                  rows="3"
                  :rules="[v => !!v || 'Description is required']"
                  required
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.dean"
                  label="Dean"
                  variant="outlined"
                  :rules="[v => !!v || 'Dean name is required']"
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
            @click="saveFaculty"
            :loading="saveLoading"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PageHeader from '@/views/components/PageHeader.vue';
import apiClient from '@/utils/apiClient';
import { API_ROUTES } from '@/utils/config/apiRoutes';

// Data
const faculties = ref([]);
const departments = ref([]);
const loading = ref(true);

// Dialog states
const editDialog = ref(false);
const isEditing = ref(false);
const editedItem = ref({
  id: null,
  name: '',
  code: '',
  description: '',
  dean: '',
  office_location: '',
  is_active: true
});
const defaultItem = {
  id: null,
  name: '',
  code: '',
  description: '',
  dean: '',
  office_location: '',
  is_active: true
};
const saveLoading = ref(false);

// Form reference
const form = ref(null);

// Header actions
const headerActions = [
  { 
    icon: 'mdi-plus', 
    text: 'Add Faculty',
    color: 'primary',
    handler: openCreateDialog
  }
];

// Faculty colors
const facultyColors = {
  'SCI': 'primary',
  'ENG': 'success',
  'ART': 'warning',
  'MED': 'error',
  'BUS': 'purple',
  'LAW': 'indigo'
};

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([
    fetchFaculties(),
    fetchDepartments()
  ]);
});

// Methods
async function fetchFaculties() {
  loading.value = true;
  try {
    const response = await apiClient.get(API_ROUTES.FACULTIES_ROUTE);
    faculties.value = response.data.results || response.data;
  } catch (error) {
    console.error('Error fetching faculties:', error);
    // Mock data for development
    faculties.value = [
      {
        "id": 3,
        "name": "Faculty of Arts",
        "code": "ART",
        "description": "Faculty focusing on arts and humanities",
        "dean": "Dr. Michael Brown",
        "office_location": "Arts Building, Room 301",
        "is_active": true
      },
      {
        "id": 2,
        "name": "Faculty of Engineering",
        "code": "ENG",
        "description": "Faculty focusing on engineering studies",
        "dean": "Dr. Sarah Johnson",
        "office_location": "Engineering Building, Room 201",
        "is_active": true
      },
      {
        "id": 1,
        "name": "Faculty of Science",
        "code": "SCI",
        "description": "Faculty focusing on scientific studies",
        "dean": "Dr. John Smith",
        "office_location": "Science Building, Room 101",
        "is_active": true
      }
    ];
  } finally {
    loading.value = false;
  }
}

async function fetchDepartments() {
  try {
    const response = await apiClient.get(API_ROUTES.DEPARTMENTS_ROUTE);
    departments.value = response.data.results || response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    // Mock data for development
    departments.value = [
      {
        "id": 1,
        "name": "Computer Science",
        "faculty": 1
      },
      {
        "id": 2,
        "name": "Mathematics",
        "faculty": 1
      },
      {
        "id": 6,
        "name": "Electrical Engineering",
        "faculty": 2
      }
    ];
  }
}

function getDepartmentsCount(facultyId) {
  return departments.value.filter(dept => dept.faculty === facultyId).length;
}

function getFacultyColor(code) {
  return facultyColors[code] || 'grey';
}

function openCreateDialog() {
  isEditing.value = false;
  editedItem.value = { ...defaultItem };
  editDialog.value = true;
}

function editFaculty(item) {
  isEditing.value = true;
  editedItem.value = { ...item };
  editDialog.value = true;
}

function closeEditDialog() {
  editDialog.value = false;
}

async function saveFaculty() {
  saveLoading.value = true;
  
  try {
    if (isEditing.value && editedItem.value.id) {
      // Update existing faculty
      await apiClient.put(`${API_ROUTES.FACULTIES_ROUTE}${editedItem.value.id}/`, editedItem.value);
    } else {
      // Create new faculty
      await apiClient.post(API_ROUTES.FACULTIES_ROUTE, editedItem.value);
    }
    
    await fetchFaculties();
    closeEditDialog();
  } catch (error) {
    console.error('Error saving faculty:', error);
  } finally {
    saveLoading.value = false;
  }
}
</script>

<style scoped>
.faculties-view {
  min-height: calc(100vh - 120px);
}

.faculty-card {
  height: 100%;
  transition: transform 0.2s;
}

.faculty-card:hover {
  transform: translateY(-5px);
}

.new-faculty-card {
  border: 2px dashed rgba(var(--v-theme-primary), 0.4);
  background-color: rgba(var(--v-theme-primary), 0.05);
  cursor: pointer;
}

.new-faculty-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.8);
  background-color: rgba(var(--v-theme-primary), 0.1);
}
</style> 