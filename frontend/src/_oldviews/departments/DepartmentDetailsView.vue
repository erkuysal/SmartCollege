<template>
  <div class="department-details-view">
    <PageHeader
      title="Department Details"
      subtitle="View and manage department information"
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
                <span class="text-h6 text-white">{{ department.name.charAt(0) }}</span>
              </v-avatar>
              <div>
                <div class="text-h5">{{ department.name }}</div>
                <div class="text-subtitle-2">
                  <v-chip
                    :color="facultyColor"
                    size="small"
                    class="text-white"
                  >
                    {{ facultyName }}
                  </v-chip>
                </div>
              </div>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" sm="6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Head of Department</h3>
                  <div class="d-flex align-center">
                    <v-avatar color="secondary" size="32" class="mr-2">
                      <v-icon size="small" color="white">mdi-account-tie</v-icon>
                    </v-avatar>
                    <span>{{ department.head_of_department }}</span>
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Office Location</h3>
                  <div class="d-flex align-center">
                    <v-avatar color="info" size="32" class="mr-2">
                      <v-icon size="small" color="white">mdi-map-marker</v-icon>
                    </v-avatar>
                    <span>{{ department.office_location }}</span>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-4"></v-divider>

              <v-row>
                <v-col cols="12">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Status</h3>
                  <v-chip
                    :color="department.is_active ? 'success' : 'error'"
                    size="small"
                  >
                    {{ department.is_active ? 'Active' : 'Inactive' }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Courses Section -->
          <v-card class="mt-4">
            <v-card-title class="d-flex align-center py-3 px-4 bg-secondary text-white">
              <span>Courses</span>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                color="white"
                size="small"
                prepend-icon="mdi-plus"
                @click="addCourse"
              >
                Add Course
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list>
                <v-list-item
                  v-for="course in courses"
                  :key="course.id"
                  :title="course.name"
                  :subtitle="course.code"
                  :to="{ name: 'course-details', params: { id: course.id } }"
                >
                  <template v-slot:prepend>
                    <v-avatar
                      color="error"
                      size="32"
                    >
                      <span class="text-subtitle-2 text-white">{{ course.code.charAt(0) }}</span>
                    </v-avatar>
                  </template>
                  <template v-slot:append>
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="primary"
                      :to="{ name: 'course-details', params: { id: course.id } }"
                    >
                      <v-icon>mdi-arrow-right</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
              
              <div v-if="courses.length === 0" class="pa-4 text-center">
                <v-icon
                  icon="mdi-book-off"
                  size="64"
                  color="grey-lighten-1"
                  class="mb-2"
                ></v-icon>
                <div class="text-body-1 text-medium-emphasis">No courses found in this department</div>
                <v-btn
                  color="primary"
                  class="mt-4"
                  prepend-icon="mdi-plus"
                  @click="addCourse"
                >
                  Add First Course
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
                  title="Edit Department"
                  @click="editDepartment"
                  class="mb-2"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-toggle-switch"
                  :title="department.is_active ? 'Deactivate Department' : 'Activate Department'"
                  @click="toggleStatus"
                  class="mb-2"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-book-plus-multiple"
                  title="Add Course"
                  @click="addCourse"
                  class="mb-2"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-delete"
                  title="Delete Department"
                  color="error"
                  @click="confirmDelete"
                ></v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <v-card class="mt-4">
            <v-card-title class="d-flex align-center py-3 px-4 bg-primary-lighten-1 text-white">
              <span>Faculty</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-list>
                <v-list-item
                  prepend-icon="mdi-office-building"
                  :title="facultyName"
                  :subtitle="faculty.dean ? `Dean: ${faculty.dean}` : ''"
                  :to="{ name: 'faculty-details', params: { id: department.faculty } }"
                >
                  <template v-slot:prepend>
                    <v-avatar
                      :color="facultyColor"
                      size="32"
                    >
                      <span class="text-subtitle-2 text-white">{{ faculty.code ? faculty.code.charAt(0) : 'F' }}</span>
                    </v-avatar>
                  </template>
                </v-list-item>
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
                    <div class="text-h4 font-weight-bold text-primary mb-1">{{ courses.length }}</div>
                    <div class="text-caption text-medium-emphasis">Courses</div>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card variant="outlined" class="pa-4 text-center">
                    <div class="text-h4 font-weight-bold text-success mb-1">{{ lecturerCount }}</div>
                    <div class="text-caption text-medium-emphasis">Lecturers</div>
                  </v-card>
                </v-col>
                <v-col cols="12">
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
          Edit Department
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
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.head_of_department"
                  label="Head of Department"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.office_location"
                  label="Office Location"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="editedItem.is_active"
                  label="Department Active"
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
            <p><strong>Department:</strong> {{ department.name }}</p>
            <p><strong>Faculty:</strong> {{ facultyName }}</p>
            <p><strong>Courses:</strong> {{ courses.length }}</p>
          </div>
          <p class="mt-3 text-caption text-medium-emphasis">
            This will permanently remove the department and all associated courses from the system.
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
            @click="deleteDepartment"
            :loading="deleteLoading"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Course Dialog -->
    <v-dialog v-model="courseDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5 bg-secondary text-white py-3 px-4">
          Add Course
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="courseForm" @submit.prevent="saveCourse">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="courseItem.name"
                  label="Course Name"
                  variant="outlined"
                  :rules="[v => !!v || 'Name is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="courseItem.code"
                  label="Course Code"
                  variant="outlined"
                  :rules="[v => !!v || 'Code is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="courseItem.description"
                  label="Description"
                  variant="outlined"
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="courseItem.credits"
                  label="Credits"
                  type="number"
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
            @click="courseDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="secondary"
            @click="saveCourse"
            :loading="courseLoading"
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
const departmentId = computed(() => route.params.id as string);
const isLoading = ref(true);

// Type definitions
interface DepartmentType {
  id: number;
  name: string;
  head_of_department: string;
  office_location: string;
  is_active: boolean;
  faculty: number;
}

interface FacultyType {
  id: number;
  name: string;
  code: string;
  dean: string;
}

interface CourseType {
  id: number;
  name: string;
  code: string;
  description: string;
  credits: number;
  department: number;
}

const department = ref<DepartmentType>({
  id: 0,
  name: '',
  head_of_department: '',
  office_location: '',
  is_active: true,
  faculty: 0
});

const faculty = ref<FacultyType>({
  id: 0,
  name: '',
  code: '',
  dean: ''
});

const courses = ref<CourseType[]>([]);

// Faculty name and color
const facultyName = computed(() => faculty.value.name || 'Unknown Faculty');
const facultyColor = computed(() => {
  const colors: Record<number, string> = {
    1: 'primary',
    2: 'success',
    3: 'purple'
  };
  return colors[department.value.faculty] || 'grey';
});

// Statistics
const lecturerCount = ref(0);
const studentCount = ref(0);

// Edit Dialog
const editDialog = ref(false);
const saveLoading = ref(false);
const editedItem = ref({
  name: '',
  head_of_department: '',
  office_location: '',
  is_active: true
});

// Course Dialog
const courseDialog = ref(false);
const courseLoading = ref(false);
const courseItem = ref({
  name: '',
  code: '',
  description: '',
  credits: 3,
  department: 0
});

// Delete Dialog
const deleteDialog = ref(false);
const deleteLoading = ref(false);

// Header Actions
const headerActions = [
  {
    icon: 'mdi-arrow-left',
    text: 'Back to Departments',
    handler: () => router.push({ name: 'departments' })
  },
  {
    icon: 'mdi-pencil',
    text: 'Edit',
    color: 'primary',
    handler: editDepartment
  }
];

// Lifecycle Hooks
onMounted(async () => {
  await Promise.all([
    fetchDepartment(),
    fetchCourses(),
    fetchStatistics()
  ]);
});

// Methods
async function fetchDepartment() {
  isLoading.value = true;
  try {
    const response = await apiClient.get(`${API_ROUTES.DEPARTMENTS_ROUTE}${departmentId.value}/`);
    department.value = response.data as DepartmentType;
    
    // Now fetch the faculty data
    await fetchFaculty();
  } catch (error) {
    console.error('Error fetching department:', error);
    
    // Mock data for development
    department.value = {
      id: Number(departmentId.value),
      name: "Computer Science",
      head_of_department: "Dr. Computer Head",
      office_location: "Science Building, Room 201",
      is_active: true,
      faculty: 1
    };
    
    // Fetch faculty data for the mock department
    await fetchFaculty();
  } finally {
    isLoading.value = false;
  }
}

async function fetchFaculty() {
  try {
    const response = await apiClient.get(`${API_ROUTES.FACULTIES_ROUTE}${department.value.faculty}/`);
    faculty.value = response.data as FacultyType;
  } catch (error) {
    console.error('Error fetching faculty:', error);
    
    // Mock data for development
    faculty.value = {
      id: department.value.faculty,
      name: "Faculty of Science",
      code: "SCI",
      dean: "Dr. John Smith"
    };
  }
}

async function fetchCourses() {
  try {
    const response = await apiClient.get(`${API_ROUTES.COURSES_ROUTE}?department=${departmentId.value}`);
    courses.value = (response.data.results || response.data) as CourseType[];
  } catch (error) {
    console.error('Error fetching courses:', error);
    
    // Mock data for development
    courses.value = [
      {
        id: 1,
        name: "Introduction to Programming",
        code: "CS101",
        description: "Basic programming concepts",
        credits: 3,
        department: Number(departmentId.value)
      },
      {
        id: 2,
        name: "Data Structures",
        code: "CS201",
        description: "Advanced data structures",
        credits: 4,
        department: Number(departmentId.value)
      }
    ];
  }
}

async function fetchStatistics() {
  try {
    // In a real implementation, these would be API calls to get actual counts
    lecturerCount.value = 15;
    studentCount.value = 250;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    lecturerCount.value = 0;
    studentCount.value = 0;
  }
}

function editDepartment() {
  editedItem.value = {
    name: department.value.name,
    head_of_department: department.value.head_of_department,
    office_location: department.value.office_location,
    is_active: department.value.is_active
  };
  editDialog.value = true;
}

async function saveDepartment() {
  saveLoading.value = true;
  
  try {
    await apiClient.patch(`${API_ROUTES.DEPARTMENTS_ROUTE}${departmentId.value}/`, editedItem.value);
    
    // Update local data
    department.value = {
      ...department.value,
      ...editedItem.value
    };
    
    editDialog.value = false;
  } catch (error) {
    console.error('Error saving department:', error);
  } finally {
    saveLoading.value = false;
  }
}

function addCourse() {
  courseItem.value = {
    name: '',
    code: '',
    description: '',
    credits: 3,
    department: Number(departmentId.value)
  };
  courseDialog.value = true;
}

async function saveCourse() {
  courseLoading.value = true;
  
  try {
    const response = await apiClient.post(API_ROUTES.COURSES_ROUTE, courseItem.value);
    
    // Add new course to local list
    courses.value.push({
      ...courseItem.value,
      id: response.data.id || courses.value.length + 1
    } as CourseType);
    
    courseDialog.value = false;
  } catch (error) {
    console.error('Error saving course:', error);
  } finally {
    courseLoading.value = false;
  }
}

function toggleStatus() {
  editedItem.value = {
    ...editedItem.value,
    is_active: !department.value.is_active
  };
  saveDepartment();
}

function confirmDelete() {
  deleteDialog.value = true;
}

async function deleteDepartment() {
  deleteLoading.value = true;
  
  try {
    await apiClient.delete(`${API_ROUTES.DEPARTMENTS_ROUTE}${departmentId.value}/`);
    router.push({ name: 'departments' });
  } catch (error) {
    console.error('Error deleting department:', error);
  } finally {
    deleteLoading.value = false;
  }
}
</script>

<style scoped>
.department-details-view {
  min-height: calc(100vh - 120px);
}
</style> 