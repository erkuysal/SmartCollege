<template>
  <div class="courses-view">
    <PageHeader title="Courses">
      <template #subtitle>
        Manage and organize course information
      </template>
      <template #actions>
        <v-btn
          color="primary"
          icon="mdi-plus"
          @click="showAddModal = true"
          title="Add Course"
        />
      </template>
    </PageHeader>
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

      <!-- Courses Table -->
      <List
        v-else
        :headers="courseTableHeaders"
        :rows="coursesStore.courses"
        :actions="courseTableActions"
        :showActions="true"
        :loading="isLoading"
        :itemsPerPage="itemsPerPage"
        :sortableColumns="['Course Code', 'Course Name', 'Lecturer']"
        @sort="handleSort"
      />
    </div>

    <!-- Edit Course Dialog -->
    <v-dialog
      :model-value="!!editingCourse"
      @update:model-value="val => editingCourse = val ? editingCourse : null"
      max-width="500px"
    >
      <v-card v-if="editingCourse">
        <v-card-title>Edit Course</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleUpdateCourse">
            <v-text-field
              v-model="editingCourse.code"
              label="Course Code"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="editingCourse.name"
              label="Course Name"
              required
              variant="outlined"
            />
            <v-textarea
              v-model="editingCourse.description"
              label="Description"
              variant="outlined"
            />
            <v-select
              v-model="editingCourse.instructor"
              :items="lecturerSelectItems"
              label="Lecturer"
              item-title="label"
              item-value="value"
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
            @click="editingCourse = null"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="handleUpdateCourse"
            :loading="isLoading"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Course Dialog -->
    <v-dialog
      :model-value="showAddModal"
      @update:model-value="val => showAddModal = val"
      max-width="500px"
    >
      <v-card>
        <v-card-title>Add Course</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleAddCourse">
            <v-text-field
              v-model="newCourse.code"
              label="Course Code"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="newCourse.name"
              label="Course Name"
              required
              variant="outlined"
            />
            <v-textarea
              v-model="newCourse.description"
              label="Description"
              variant="outlined"
            />
            <v-select
              v-model="newCourse.instructor"
              :items="lecturerSelectItems"
              label="Lecturer"
              item-title="label"
              item-value="value"
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
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="handleAddCourse"
            :loading="isLoading"
          >
            Add Course
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
          Are you sure you want to delete this course?
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
            @click="deleteCourse"
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
import { useCoursesStore } from '@/client/stores/courses'
import { getLecturers, type Lecturer } from '@/client/api.ts'
import type { Course, PaginatedResponse } from '@/client/api.ts'
import List from '@/components/common/List.vue'
import Filter from '@/components/common/Filter.vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/client/stores/ui.ts'
import PageHeader from '@/components/common/PageHeader.vue'

const router = useRouter()
const uiStore = useUIStore()
const coursesStore = useCoursesStore()

// State
const lecturers = ref<Lecturer[]>([])
const searchQuery = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isLoading = computed(() => coursesStore.isLoading)
const error = computed(() => coursesStore.error)
const currentPage = ref(1)
const itemsPerPage = 12
const totalPages = computed(() => Math.ceil(coursesStore.totalCount / itemsPerPage))
const editingCourse = ref<Course | null>(null)

type SortField = 'code' | 'name' | 'instructor_name'
const sortBy = ref<SortField>('code')

const filters = ref([
  {
    type: 'search' as const,
    label: 'Search courses...',
    value: searchQuery.value
  },
  {
    type: 'select' as const,
    label: 'Sort by',
    value: sortBy.value,
    items: [
      { title: 'Sort by Course Code', value: 'code' },
      { title: 'Sort by Course Name', value: 'name' },
      { title: 'Sort by Lecturer', value: 'instructor_name' }
    ]
  }
])

interface CourseForm {
  id: number;
  code: string;
  name: string;
  description: string;
  instructor: number;
  is_active: boolean;
}

const currentCourse = reactive<CourseForm>({
  id: 0,
  code: '',
  name: '',
  description: '',
  instructor: 0,
  is_active: true
})

const courseToDelete = ref<Course | null>(null)

const newCourse = ref({
  code: '',
  name: '',
  description: '',
  instructor: null as number | null
})

// Fetch courses with pagination
async function fetchCourses() {
  try {
    await coursesStore.fetchCourses();
  } catch (err) {
    uiStore.showError(error.value);
  }
}

// Fetch lecturers for the select dropdown
async function fetchLecturers() {
  try {
    const response = await getLecturers();
    const data = response.data as PaginatedResponse<Lecturer>;
    lecturers.value = data.results;
  } catch (err) {
    coursesStore.setError(err instanceof Error ? err.message : 'Failed to fetch lecturers');
    uiStore.showError(coursesStore.error);
  }
}

// Handle course creation/update
async function submitCourse() {
  try {
    if (showEditModal.value) {
      await coursesStore.updateCourseData(currentCourse.id, {
        code: currentCourse.code,
        name: currentCourse.name,
        description: currentCourse.description,
        instructor: currentCourse.instructor,
        is_active: currentCourse.is_active
      });
      uiStore.showSuccess('Course updated successfully');
    } else {
      await coursesStore.addCourse({
        code: currentCourse.code,
        name: currentCourse.name,
        description: currentCourse.description,
        instructor: currentCourse.instructor,
        is_active: currentCourse.is_active
      });
      uiStore.showSuccess('Course added successfully');
    }
    closeModal();
    await fetchCourses();
  } catch (err: any) {
    uiStore.showError(error.value);
  }
}

// Handle course deletion
async function deleteCourse() {
  if (!courseToDelete.value) return;

  try {
    await coursesStore.removeCourse(courseToDelete.value.id);
    showDeleteModal.value = false;
    courseToDelete.value = null;
    await fetchCourses();
    uiStore.showSuccess('Course deleted successfully');
  } catch (err: any) {
    uiStore.showError(error.value);
  }
}

// Handle search
function handleSearch() {
  currentPage.value = 1; // Reset to first page on search
  fetchCourses();
}

// Handle sort
function handleSort(column: string, direction: 'asc' | 'desc') {
  const fieldMap: Record<string, SortField> = {
    'Course Code': 'code',
    'Course Name': 'name',
    'Lecturer': 'instructor_name'
  };
  const field = fieldMap[column];
  if (field) {
    sortBy.value = field;
    currentPage.value = 1; // Reset to first page on sort
    fetchCourses();
  }
}

function handleFilterChange(newFilters: typeof filters.value) {
  searchQuery.value = newFilters[0].value;
  sortBy.value = newFilters[1].value as SortField;
  currentPage.value = 1; // Reset to first page on filter change
  fetchCourses();
}

function closeModal() {
  showAddModal.value = false;
  showEditModal.value = false;
  currentCourse.id = 0;
  currentCourse.code = '';
  currentCourse.name = '';
  currentCourse.description = '';
  currentCourse.instructor = 0;
  currentCourse.is_active = true;
}

function editCourse(course: Course) {
  currentCourse.id = course.id;
  currentCourse.code = course.code;
  currentCourse.name = course.name;
  currentCourse.description = course.description;
  currentCourse.instructor = course.instructor;
  currentCourse.is_active = course.is_active;
  showEditModal.value = true;
}

function confirmDelete(course: Course) {
  courseToDelete.value = course;
  showDeleteModal.value = true;
}

// Computed properties for filtering and sorting
const filteredCourses = computed(() => {
  let result = [...coursesStore.courses];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(course =>
      course.code.toLowerCase().includes(query) ||
      course.name.toLowerCase().includes(query) ||
      course.instructor_name.toLowerCase().includes(query)
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
const courseTableHeaders = [
  {
    title: 'Course Code',
    key: 'code',
    sortable: true
  },
  {
    title: 'Course Name',
    key: 'name',
    sortable: true
  },
  {
    title: 'Lecturer',
    key: 'instructor_name',
    sortable: true
  }
];

const courseTableActions = [
  {
    label: 'View',
    icon: 'mdi-eye',
    color: 'info',
    handler: (course: Course) => {
      router.push(`/courses/${course.id}`);
    }
  },
  {
    label: 'Edit',
    icon: 'mdi-pencil',
    color: 'primary',
    handler: (course: Course) => {
      editingCourse.value = { ...course };
    }
  },
  {
    label: 'Delete',
    icon: 'mdi-delete',
    color: 'error',
    handler: async (course: Course) => {
      if (confirm('Are you sure you want to delete this course?')) {
        try {
          await coursesStore.removeCourse(course.id);
          await fetchCourses();
          uiStore.showSuccess('Course deleted successfully');
        } catch (err) {
          uiStore.showError(error.value);
        }
      }
    }
  }
];

const lecturerSelectItems = computed(() => {
  return lecturers.value.map(lecturer => ({
    label: `${lecturer.first_name} ${lecturer.last_name}`,
    value: lecturer.id
  }));
});

// Lifecycle hooks
onMounted(() => {
  fetchCourses();
  fetchLecturers();
});

// Watch for pagination changes
watch(currentPage, () => {
  fetchCourses();
});

async function handleUpdateCourse() {
  if (!editingCourse.value) return;
  
  try {
    await coursesStore.updateCourseData(editingCourse.value.id, {
      code: editingCourse.value.code,
      name: editingCourse.value.name,
      description: editingCourse.value.description,
      instructor: editingCourse.value.instructor
    });
    await fetchCourses();
    editingCourse.value = null;
    uiStore.showSuccess('Course updated successfully');
  } catch (err) {
    uiStore.showError(error.value);
  }
}

async function handleAddCourse() {
  if (!newCourse.value.instructor) {
    uiStore.showError('Please select a lecturer');
    return;
  }

  try {
    await coursesStore.addCourse({
      ...newCourse.value,
      instructor: newCourse.value.instructor
    });
    await fetchCourses();
    showAddModal.value = false;
    newCourse.value = {
      code: '',
      name: '',
      description: '',
      instructor: null
    };
    uiStore.showSuccess('Course added successfully');
  } catch (err) {
    uiStore.showError(error.value);
  }
}
</script>

<style lang="scss">
@use '../../styles/theme/index' as theme;

.courses-view {
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
