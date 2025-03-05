<template>
  <ListViewLayout
    title="Courses"
    icon="mdi-book-education"
    :loading="courseStore.loading"
    :isEmpty="filteredCourses.length === 0"
    :error="courseStore.error || ''"
    searchLabel="Search courses"
    addButtonText="Add Course"
    emptyIcon="mdi-book-off"
    emptyTitle="No Courses Found"
    emptyText="Get started by adding your first course."
    emptySearchText="No courses match your search criteria."
    v-model:viewType="viewType"
    @search="handleSearch"
    @add="openAddCourseDialog"
    @refresh="loadCourses"
    @clear-error="courseStore.clearError()"
  >
    <!-- Table View -->
    <template #default="{ viewType }">
      <v-card
        v-if="viewType === 'table'"
        variant="outlined"
        class="mb-4"
      >
        <v-data-table
          :headers="headers"
          :items="filteredCourses"
          :loading="courseStore.loading"
          hover
        >
          <template #item.code="{ item }">
            <span class="font-weight-medium">{{ item.code }}</span>
          </template>
          
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" color="primary" class="mr-2">
                <span class="text-subtitle-2 text-white">{{ item.name.charAt(0) }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-grey">
                  {{ getDepartmentName(item.department) }}
                </div>
              </div>
            </div>
          </template>
          
          <template #item.lecturer="{ item }">
            <div v-if="item.lecturer">
              {{ getLecturerName(item.lecturer) }}
            </div>
            <span v-else class="text-grey">Not Assigned</span>
          </template>
          
          <template #item.credits="{ item }">
            <v-chip size="small" color="primary" variant="tonal">
              {{ item.credits }} Credits
            </v-chip>
          </template>
          
          <template #item.actions="{ item }">
            <div class="d-flex">
              <v-btn
                icon
                variant="text"
                size="small"
                color="primary"
                @click="editCourse(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                color="error"
                @click="deleteCourse(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <!-- Card View -->
      <div v-else class="d-flex flex-wrap">
        <v-card
          v-for="course in filteredCourses"
          :key="course.id"
          class="ma-2"
          width="300"
          variant="outlined"
          hover
        >
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="primary" size="40">
                <span class="text-h6 text-white">{{ course.name.charAt(0) }}</span>
              </v-avatar>
            </template>
            <v-card-title>{{ course.name }}</v-card-title>
            <v-card-subtitle>{{ course.code }}</v-card-subtitle>
          </v-card-item>
          
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="grey" class="mr-2">mdi-domain</v-icon>
              <span>
                {{ getDepartmentName(course.department) }}
              </span>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="grey" class="mr-2">mdi-account-tie</v-icon>
              <span>
                {{ getLecturerName(course.lecturer) }}
              </span>
            </div>
            <div class="d-flex align-center">
              <v-icon size="small" color="grey" class="mr-2">mdi-book-open-page-variant</v-icon>
              <span>{{ course.credits }} Credits</span>
            </div>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              color="primary"
              size="small"
              @click="editCourse(course)"
            >
              Edit
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              size="small"
              @click="deleteCourse(course)"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </template>
  </ListViewLayout>

  <!-- Add/Edit Course Dialog -->
  <v-dialog v-model="dialogVisible" max-width="600px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center pa-4 bg-primary text-white">
        <v-icon color="white" class="mr-2">{{ editingCourse ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
        <span>{{ editingCourse ? 'Edit Course' : 'New Course' }}</span>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" color="white" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Error Alert -->
      <v-alert
        v-if="formError"
        type="error"
        class="mx-4 mt-4"
        closable
        variant="tonal"
        @click:close="formError = ''"
      >
        {{ formError }}
      </v-alert>

      <v-card-text class="pt-4">
        <v-form ref="form" v-model="isValid">
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.code"
                  label="Course Code"
                  required
                  :rules="[v => !!v || 'Course code is required']"
                  hint="A unique identifier for the course (e.g., CS101)"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.credits"
                  label="Credits"
                  type="number"
                  min="1"
                  required
                  :rules="[v => !!v || 'Credits are required']"
                  hint="Number of credit hours"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formData.name"
                  label="Course Name"
                  required
                  :rules="[v => !!v || 'Course name is required']"
                  hint="Full name of the course"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="formData.department"
                  :items="departmentStore.items"
                  item-title="name"
                  item-value="id"
                  label="Department"
                  required
                  :rules="[v => !!v || 'Department is required']"
                  hint="Department offering this course"
                  persistent-hint
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="formData.lecturer"
                  :items="lecturerStore.items"
                  item-title="full_name"
                  item-value="id"
                  label="Lecturer (Optional)"
                  clearable
                  hint="You can assign a lecturer later if needed"
                  persistent-hint
                >
                  <template #item="{ item }">
                    <v-list-item :title="`${item.raw.first_name} ${item.raw.last_name}`" :subtitle="item.raw.email || ''"></v-list-item>
                  </template>
                  <template #selection="{ item }">
                    {{ item.raw.first_name }} {{ item.raw.last_name }}
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Description"
                  rows="3"
                  hint="Brief description of the course content"
                  persistent-hint
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn 
          color="grey-darken-1" 
          variant="text" 
          @click="closeDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="saveCourse"
          :loading="courseStore.loading"
          :disabled="!isValid"
        >
          {{ editingCourse ? 'Update' : 'Create' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="deleteDialog" max-width="400px">
    <v-card>
      <v-card-title class="bg-error text-white pa-4">
        <v-icon color="white" class="mr-2">mdi-alert</v-icon>
        Confirm Deletion
      </v-card-title>
      <v-card-text class="pa-4 pt-5">
        <p>Are you sure you want to delete this course?</p>
        <p class="text-body-2 mt-2">
          <strong>{{ courseToDelete?.name }}</strong> ({{ courseToDelete?.code }})
        </p>
        <p class="text-caption text-grey mt-3">This action cannot be undone.</p>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="deleteDialog = false">
          Cancel
        </v-btn>
        <v-btn 
          color="error" 
          @click="confirmDelete"
          :loading="courseStore.loading"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from '@/utils/stores/college/courseStore';
import { useLecturerStore } from '@/utils/stores/users/lecturerStore';
import { useDepartmentStore } from '@/utils/stores/college/departmentStore';
import ListViewLayout from '../../../../components/layouts/ListViewLayout.vue';
import type { Course, PopulatedCourse } from '@/utils/interfaces/college/courseInterface';

const courseStore = useCourseStore();
const lecturerStore = useLecturerStore();
const departmentStore = useDepartmentStore();
const router = useRouter();

// Table headers
const headers = [
  { title: 'Code', key: 'code', sortable: true },
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Lecturer', key: 'lecturer', sortable: false },
  { title: 'Credits', key: 'credits', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as 'end' }
];

// State
const dialogVisible = ref(false);
const deleteDialog = ref(false);
const editingCourse = ref<Course | null>(null);
const courseToDelete = ref<Course | null>(null);
const isValid = ref(false);
const form = ref<any>(null);
const viewType = ref('table');
const formError = ref('');
const searchQuery = ref('');
const searchTimeout = ref<number | null>(null);

const formData = ref({
  code: '',
  name: '',
  description: '',
  department: null as number | null,
  credits: 3,
  lecturer: undefined as number | undefined
});

// Computed properties for lecturers with full name
const lecturersWithFullName = computed(() => {
  return lecturerStore.items.map(lecturer => ({
    ...lecturer,
    full_name: `${lecturer.first_name} ${lecturer.last_name}`
  }));
});

// Filtered courses based on search
const filteredCourses = computed(() => {
  if (!searchQuery.value) return courseStore.items;
  
  const query = searchQuery.value.toLowerCase();
  return courseStore.items.filter(course => {
    const departmentName = getDepartmentName(course.department).toLowerCase();
    const lecturerName = getLecturerName(course.lecturer).toLowerCase();
    
    return course.name.toLowerCase().includes(query) || 
      course.code.toLowerCase().includes(query) ||
      departmentName.includes(query) ||
      lecturerName.includes(query);
  });
});

// Methods
function getDepartmentName(department: any): string {
  if (!department) return 'No Department';
  
  if (typeof department === 'object' && department && 'name' in department) {
    return department.name;
  }
  
  // If we have a department ID but not the object, try to find it in the store
  if (typeof department === 'number') {
    const departmentObj = departmentStore.items.find(d => d.id === department);
    if (departmentObj) {
      return departmentObj.name;
    }
  }
  
  return 'No Department';
}

function getLecturerName(lecturer: any): string {
  if (!lecturer) return 'No Lecturer Assigned';
  
  if (typeof lecturer === 'object' && lecturer && 'first_name' in lecturer && 'last_name' in lecturer) {
    return `${lecturer.first_name} ${lecturer.last_name}`;
  }
  
  // If we have a lecturer ID but not the object, try to find it in the store
  if (typeof lecturer === 'number') {
    const lecturerObj = lecturerStore.items.find(l => l.id === lecturer);
    if (lecturerObj) {
      return `${lecturerObj.first_name} ${lecturerObj.last_name}`;
    }
  }
  
  return 'No Lecturer Assigned';
}

function debounceSearch() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  
  searchTimeout.value = setTimeout(() => {
    fetchCourses();
  }, 300) as unknown as number;
}

async function fetchCourses() {
  try {
    const params: Record<string, any> = {};
    
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    
    await courseStore.fetchCourses(params);
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
}

function openAddCourseDialog() {
  editingCourse.value = null;
  resetForm();
  dialogVisible.value = true;
}

function editCourse(course: Course | PopulatedCourse) {
  const departmentId = typeof course.department === 'number' 
    ? course.department 
    : (course.department as any).id;
    
  editingCourse.value = {
    id: course.id,
    code: course.code,
    name: course.name,
    description: course.description,
    credits: course.credits,
    department: departmentId,
    is_active: course.is_active,
    lecturer: typeof course.lecturer === 'number' ? course.lecturer : (course.lecturer as any)?.id,
    created_at: course.created_at,
    updated_at: course.updated_at
  };
  
  formData.value = {
    code: course.code,
    name: course.name,
    description: course.description || '',
    department: departmentId,
    credits: course.credits,
    lecturer: typeof course.lecturer === 'number' ? course.lecturer : (course.lecturer as any)?.id
  };
  
  dialogVisible.value = true;
}

function deleteCourse(course: Course | PopulatedCourse) {
  // Create a normalized course object to handle both Course and PopulatedCourse types
  const normalizedCourse: Course = {
    id: course.id,
    code: course.code,
    name: course.name,
    description: course.description,
    credits: course.credits,
    department: typeof course.department === 'number' ? course.department : (course.department as any).id,
    is_active: course.is_active,
    lecturer: typeof course.lecturer === 'number' ? course.lecturer : (course.lecturer as any)?.id,
    created_at: course.created_at,
    updated_at: course.updated_at
  };
  
  courseToDelete.value = normalizedCourse;
  deleteDialog.value = true;
}

async function confirmDelete() {
  if (!courseToDelete.value) return;
  
  try {
    await courseStore.deleteCourse(courseToDelete.value.id);
    deleteDialog.value = false;
    courseToDelete.value = null;
  } catch (error) {
    console.error('Error deleting course:', error);
  }
}

async function saveCourse() {
  if (!isValid.value) return;
  
  formError.value = '';

  try {
    const courseData: Partial<Course> = {
      code: formData.value.code,
      name: formData.value.name,
      description: formData.value.description,
      credits: formData.value.credits,
    };
    
    // Include department if it's not null
    if (formData.value.department !== null) {
      courseData.department = formData.value.department;
    }
    
    // Only include lecturer if it's defined
    if (formData.value.lecturer !== undefined) {
      courseData.lecturer = formData.value.lecturer;
    }

    console.log('Submitting course data:', courseData);

    if (editingCourse.value) {
      await courseStore.updateCourse(editingCourse.value.id, courseData);
    } else {
      await courseStore.createCourse(courseData);
    }
    closeDialog();
  } catch (error: any) {
    console.error('Error saving course:', error);
    formError.value = courseStore.error || 'Failed to save course. Please check your inputs and try again.';
  }
}

function closeDialog() {
  dialogVisible.value = false;
  resetForm();
}

function resetForm() {
  formData.value = {
    code: '',
    name: '',
    description: '',
    department: null,
    credits: 3,
    lecturer: undefined
  };
  if (form.value) {
    form.value.resetValidation();
  }
}

function viewCourseDetails(course: Course | PopulatedCourse) {
  router.push({
    name: 'course-details',
    params: { id: course.id }
  });
}

function handleSearch(query: string) {
  searchQuery.value = query;
}

function loadCourses() {
  courseStore.fetchCourses();
}

// Watch for search query changes
watch(searchQuery, () => {
  debounceSearch();
});

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      courseStore.fetchCourses(),
      lecturerStore.fetchLecturers(),
      departmentStore.fetchDepartments()
    ]);
  } catch (error) {
    console.error('Error loading data:', error);
    courseStore.resetState();
    lecturerStore.resetState();
    departmentStore.resetState();
  }
});
</script>

<style scoped>
.v-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>
