<template>
  <div class="faculty-details-view">
    <PageHeader
      title="Faculty Details"
      subtitle="View and manage faculty information"
      :actions="headerActions"
    />

    <v-row v-if="isLoading">
      <v-col cols="12" class="d-flex justify-center py-12">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </v-col>
    </v-row>

    <template v-else>
      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="d-flex align-center py-3 px-4 bg-primary text-white">
              <v-avatar
                :color="facultyColor"
                size="42"
                class="mr-3"
              >
                <span class="text-h6 text-white">{{ faculty.code.charAt(0) }}</span>
              </v-avatar>
              <div>
                <div class="text-h5">{{ faculty.name }}</div>
                <div class="text-subtitle-2">{{ faculty.code }}</div>
              </div>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Description</h3>
                  <p class="text-body-1">{{ faculty.description }}</p>
                </v-col>
              </v-row>

              <v-divider class="my-4"></v-divider>

              <v-row>
                <v-col cols="12" sm="6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Dean</h3>
                  <div class="d-flex align-center">
                    <v-avatar color="secondary" size="32" class="mr-2">
                      <v-icon size="small" color="white">mdi-account-tie</v-icon>
                    </v-avatar>
                    <span>{{ faculty.dean }}</span>
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Office Location</h3>
                  <div class="d-flex align-center">
                    <v-avatar color="info" size="32" class="mr-2">
                      <v-icon size="small" color="white">mdi-map-marker</v-icon>
                    </v-avatar>
                    <span>{{ faculty.office_location }}</span>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-4"></v-divider>

              <v-row>
                <v-col cols="12">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Status</h3>
                  <v-chip
                    :color="faculty.is_active ? 'success' : 'error'"
                    size="small"
                  >
                    {{ faculty.is_active ? 'Active' : 'Inactive' }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Departments Section -->
          <v-card class="mt-4">
            <v-card-title class="d-flex align-center py-3 px-4 bg-secondary text-white">
              <span>Departments</span>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                color="white"
                size="small"
                prepend-icon="mdi-plus"
                @click="addDepartment"
              >
                Add Department
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list>
                <v-list-item
                  v-for="department in departments"
                  :key="department.id"
                  :title="department.name"
                  :subtitle="department.head_of_department"
                  :to="{ name: 'department-details', params: { id: department.id } }"
                >
                  <template v-slot:prepend>
                    <v-avatar
                      :color="facultyColor"
                      size="32"
                    >
                      <span class="text-subtitle-2 text-white">{{ department.name.charAt(0) }}</span>
                    </v-avatar>
                  </template>
                  <template v-slot:append>
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="primary"
                      :to="{ name: 'department-details', params: { id: department.id } }"
                    >
                      <v-icon>mdi-arrow-right</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
              
              <div v-if="departments.length === 0" class="pa-4 text-center">
                <v-icon
                  icon="mdi-domain-off"
                  size="64"
                  color="grey-lighten-1"
                  class="mb-2"
                ></v-icon>
                <div class="text-body-1 text-medium-emphasis">No departments found in this faculty</div>
                <v-btn
                  color="primary"
                  class="mt-4"
                  prepend-icon="mdi-plus"
                  @click="addDepartment"
                >
                  Add First Department
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-title class="d-flex align-center py-3 px-4 bg-info text-white">
              <span>Actions</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-list>
                <v-list-item
                  prepend-icon="mdi-pencil"
                  title="Edit Faculty"
                  @click="editFaculty"
                  class="mb-2"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-toggle-switch"
                  :title="faculty.is_active ? 'Deactivate Faculty' : 'Activate Faculty'"
                  @click="toggleStatus"
                  class="mb-2"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-domain-plus"
                  title="Add Department"
                  @click="addDepartment"
                  class="mb-2"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-delete"
                  title="Delete Faculty"
                  color="error"
                  @click="confirmDelete"
                ></v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <v-card class="mt-4">
            <v-card-title class="d-flex align-center py-3 px-4 bg-primary-lighten-1 text-white">
              <span>Statistics</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="6">
                  <v-card variant="outlined" class="pa-4 text-center">
                    <div class="text-h4 font-weight-bold text-primary mb-1">{{ departments.length }}</div>
                    <div class="text-caption text-medium-emphasis">Departments</div>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card variant="outlined" class="pa-4 text-center">
                    <div class="text-h4 font-weight-bold text-success mb-1">{{ courseCount }}</div>
                    <div class="text-caption text-medium-emphasis">Courses</div>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card variant="outlined" class="pa-4 text-center">
                    <div class="text-h4 font-weight-bold text-info mb-1">{{ lecturerCount }}</div>
                    <div class="text-caption text-medium-emphasis">Lecturers</div>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card variant="outlined" class="pa-4 text-center">
                    <div class="text-h4 font-weight-bold text-error mb-1">{{ studentCount }}</div>
                    <div class="text-caption text-medium-emphasis">Students</div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5 bg-primary text-white py-3 px-4">
          Edit Faculty
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="form" @submit.prevent="saveFaculty">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.name"
                  label="Faculty Name"
                  variant="outlined"
                  :rules="[v => !!v || 'Name is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.code"
                  label="Faculty Code"
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
                ></v-textarea>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.dean"
                  label="Dean"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.office_location"
                  label="Office Location"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="editedItem.is_active"
                  label="Faculty Active"
                  color="success"
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
            @click="editDialog = false"
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

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 bg-error text-white py-3 px-4">
          Confirm Deletion
        </v-card-title>
        <v-card-text class="pa-4 pt-6">
          Are you sure you want to delete this faculty?
          <div class="mt-3 pa-3 bg-error-lighten-5 rounded">
            <p><strong>Faculty:</strong> {{ faculty.name }}</p>
            <p><strong>Code:</strong> {{ faculty.code }}</p>
            <p><strong>Departments:</strong> {{ departments.length }}</p>
          </div>
          <p class="mt-3 text-caption text-medium-emphasis">
            This will permanently remove the faculty and all associated departments from the system.
            This action cannot be undone.
          </p>
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
            @click="deleteFaculty"
            :loading="deleteLoading"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Department Dialog -->
    <v-dialog v-model="departmentDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5 bg-secondary text-white py-3 px-4">
          Add Department
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="departmentForm" @submit.prevent="saveDepartment">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="departmentItem.name"
                  label="Department Name"
                  variant="outlined"
                  :rules="[v => !!v || 'Name is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="departmentItem.head_of_department"
                  label="Head of Department"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="departmentItem.office_location"
                  label="Office Location"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="departmentDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="secondary"
            @click="saveDepartment"
            :loading="departmentLoading"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageHeader from '@/views/components/PageHeader.vue';
import apiClient from '@/utils/apiClient';
import { API_ROUTES } from '@/utils/config/apiRoutes';

// Route and Router
const route = useRoute();
const router = useRouter();

// Data
const facultyId = computed(() => route.params.id as string);
const isLoading = ref(true);

// Type definitions
interface FacultyType {
  id: number;
  name: string;
  code: string;
  description: string;
  dean: string;
  office_location: string;
  is_active: boolean;
}

interface DepartmentType {
  id: number;
  name: string;
  head_of_department: string;
  office_location: string;
  is_active: boolean;
  faculty: number;
}

const faculty = ref<FacultyType>({
  id: 0,
  name: '',
  code: '',
  description: '',
  dean: '',
  office_location: '',
  is_active: true
});

const departments = ref<DepartmentType[]>([]);

// Statistics
const courseCount = ref(0);
const lecturerCount = ref(0);
const studentCount = ref(0);

// Edit Dialog
const editDialog = ref(false);
const saveLoading = ref(false);
const editedItem = ref({
  name: '',
  code: '',
  description: '',
  dean: '',
  office_location: '',
  is_active: true
});

// Department Dialog
const departmentDialog = ref(false);
const departmentLoading = ref(false);
const departmentItem = ref({
  name: '',
  head_of_department: '',
  office_location: '',
  is_active: true,
  faculty: 0
});

// Delete Dialog
const deleteDialog = ref(false);
const deleteLoading = ref(false);

// Faculty color
const facultyColor = computed(() => {
  const colors = {
    'SCI': 'primary',
    'ENG': 'success',
    'ART': 'purple',
    'MED': 'error',
    'BUS': 'amber',
    'LAW': 'blue'
  };
  return colors[faculty.value.code] || 'grey';
});

// Header Actions
const headerActions = [
  {
    icon: 'mdi-arrow-left',
    text: 'Back to Faculties',
    handler: () => router.push({ name: 'faculties' })
  },
  {
    icon: 'mdi-pencil',
    text: 'Edit',
    color: 'primary',
    handler: editFaculty
  }
];

// Lifecycle Hooks
onMounted(async () => {
  await Promise.all([
    fetchFaculty(),
    fetchDepartments(),
    fetchStatistics()
  ]);
});

// Methods
async function fetchFaculty() {
  isLoading.value = true;
  try {
    const response = await apiClient.get(`${API_ROUTES.FACULTIES_ROUTE}${facultyId.value}/`);
    faculty.value = response.data as FacultyType;
  } catch (error) {
    console.error('Error fetching faculty:', error);
    
    // Mock data for development
    faculty.value = {
      id: Number(facultyId.value),
      name: "Faculty of Science",
      code: "SCI",
      description: "Faculty focusing on scientific studies",
      dean: "Dr. John Smith",
      office_location: "Science Building, Room 101",
      is_active: true
    };
  } finally {
    isLoading.value = false;
  }
}

async function fetchDepartments() {
  try {
    const response = await apiClient.get(`${API_ROUTES.DEPARTMENTS_ROUTE}?faculty=${facultyId.value}`);
    departments.value = (response.data.results || response.data) as DepartmentType[];
  } catch (error) {
    console.error('Error fetching departments:', error);
    
    // Mock data for development
    departments.value = [
      {
        id: 1,
        name: "Computer Science",
        head_of_department: "Dr. Computer Head",
        office_location: "Science Building, Room 201",
        is_active: true,
        faculty: Number(facultyId.value)
      },
      {
        id: 2,
        name: "Mathematics",
        head_of_department: "Dr. Math Head",
        office_location: "Science Building, Room 301",
        is_active: true,
        faculty: Number(facultyId.value)
      }
    ];
  }
}

async function fetchStatistics() {
  try {
    // In a real implementation, these would be API calls to get actual counts
    courseCount.value = 25;
    lecturerCount.value = 32;
    studentCount.value = 450;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    courseCount.value = 0;
    lecturerCount.value = 0;
    studentCount.value = 0;
  }
}

function editFaculty() {
  editedItem.value = {
    name: faculty.value.name,
    code: faculty.value.code,
    description: faculty.value.description,
    dean: faculty.value.dean,
    office_location: faculty.value.office_location,
    is_active: faculty.value.is_active
  };
  editDialog.value = true;
}

async function saveFaculty() {
  saveLoading.value = true;
  
  try {
    await apiClient.patch(`${API_ROUTES.FACULTIES_ROUTE}${facultyId.value}/`, editedItem.value);
    
    // Update local data
    faculty.value = {
      ...faculty.value,
      ...editedItem.value
    };
    
    editDialog.value = false;
  } catch (error) {
    console.error('Error saving faculty:', error);
  } finally {
    saveLoading.value = false;
  }
}

function addDepartment() {
  departmentItem.value = {
    name: '',
    head_of_department: '',
    office_location: '',
    is_active: true,
    faculty: Number(facultyId.value)
  };
  departmentDialog.value = true;
}

async function saveDepartment() {
  departmentLoading.value = true;
  
  try {
    const response = await apiClient.post(API_ROUTES.DEPARTMENTS_ROUTE, departmentItem.value);
    
    // Add new department to local list
    departments.value.push({
      ...departmentItem.value,
      id: response.data.id || departments.value.length + 1
    } as DepartmentType);
    
    departmentDialog.value = false;
  } catch (error) {
    console.error('Error saving department:', error);
  } finally {
    departmentLoading.value = false;
  }
}

function toggleStatus() {
  editedItem.value = {
    ...editedItem.value,
    is_active: !faculty.value.is_active
  };
  saveFaculty();
}

function confirmDelete() {
  deleteDialog.value = true;
}

async function deleteFaculty() {
  deleteLoading.value = true;
  
  try {
    await apiClient.delete(`${API_ROUTES.FACULTIES_ROUTE}${facultyId.value}/`);
    router.push({ name: 'faculties' });
  } catch (error) {
    console.error('Error deleting faculty:', error);
  } finally {
    deleteLoading.value = false;
  }
}
</script>

<style scoped>
.faculty-details-view {
  min-height: calc(100vh - 120px);
}
</style> 