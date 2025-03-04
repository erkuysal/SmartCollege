<template>
  <v-container fluid class="py-4 px-4">
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon left class="mr-2">mdi-book-education</v-icon>
        <span class="text-h6">Courses</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Add view toggle button -->
      <v-btn-toggle
        v-model="viewType"
        mandatory
        class="me-4"
      >
        <v-btn value="table" size="small">
          <v-icon>mdi-table</v-icon>
        </v-btn>
        <v-btn value="card" size="small">
          <v-icon>mdi-view-grid</v-icon>
        </v-btn>
      </v-btn-toggle>

      <v-btn color="primary" @click="openAddCourseDialog">
        <v-icon>mdi-plus</v-icon>
        Add Course
      </v-btn>
    </v-toolbar>

    <!-- Error Alert -->
    <v-alert
      v-if="courseStore.error"
      type="error"
      class="mt-4"
      closable
    >
      {{ courseStore.error }}
    </v-alert>

    <!-- Table View -->
    <v-data-table
      v-if="viewType === 'table'"
      :headers="headers"
      :items="courseStore.items"
      :loading="courseStore.loading"
      class="mt-4"
    >
      <template #item.lecturer="{ item }">
        {{ getLecturerName(item.lecturer) }}
      </template>

      <template #item.actions="{ item }">
        <v-btn
          color="info"
          size="small"
          variant="text"
          class="me-2"
          @click="viewCourseDetails(item)"
        >
          <v-icon>mdi-eye</v-icon>
          View
        </v-btn>
        <v-btn
          color="primary"
          size="small"
          variant="text"
          class="me-2"
          @click="editCourse(item)"
        >
          <v-icon>mdi-pencil</v-icon>
          Edit
        </v-btn>
        <v-btn
          color="error"
          size="small"
          variant="text"
          @click="deleteCourse(item)"
        >
          <v-icon>mdi-delete</v-icon>
          Delete
        </v-btn>
      </template>
    </v-data-table>

    <!-- Card View -->
    <v-row v-else class="mt-4">
      <v-col
        v-for="course in courseStore.items"
        :key="course.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card>
          <v-card-title class="text-h6">
            {{ course.name }}
          </v-card-title>

          <v-card-text>
            <p class="mb-2">{{ course.description || 'No description available' }}</p>
            <v-chip class="mb-2">
              <v-icon start>mdi-account-tie</v-icon>
              {{ getLecturerName(course.lecturer) }}
            </v-chip>
          </v-card-text>

          <v-card-actions>
            <v-btn
              color="info"
              variant="text"
              size="small"
              @click="viewCourseDetails(course)"
            >
              <v-icon>mdi-eye</v-icon>
              View
            </v-btn>
            <v-btn
              color="primary"
              variant="text"
              size="small"
              @click="editCourse(course)"
            >
              <v-icon>mdi-pencil</v-icon>
              Edit
            </v-btn>
            <v-btn
              color="error"
              variant="text"
              size="small"
              @click="deleteCourse(course)"
            >
              <v-icon>mdi-delete</v-icon>
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Course Dialog -->
    <v-dialog v-model="dialogVisible" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editingCourse ? 'Edit Course' : 'New Course' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="isValid">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.code"
                    label="Course Code"
                    required
                    :rules="[v => !!v || 'Course code is required']"
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.name"
                    label="Course Name"
                    required
                    :rules="[v => !!v || 'Course name is required']"
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="formData.description"
                    label="Description"
                    rows="3"
                  ></v-textarea>
                </v-col>

                <v-col cols="12">
                  <v-select
                    v-model="formData.lecturer"
                    :items="lecturerStore.items"
                    item-title="first_name"
                    item-value="id"
                    label="Lecturer"
                    required
                    :rules="[v => !!v || 'Lecturer is required']"
                  >
                    <template #item="{ item }">
                      {{ item.raw.first_name }} {{ item.raw.last_name }}
                    </template>
                    <template #selection="{ item }">
                      {{ item.raw.first_name }} {{ item.raw.last_name }}
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="saveCourse"
            :loading="courseStore.loading"
            :disabled="!isValid"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from '@/utils/stores/college/courseStore';
import { useLecturerStore } from '@/utils/stores/users/lecturerStore';
import type { Course, PopulatedCourse } from '@/utils/interfaces/college/courseInterface';

const courseStore = useCourseStore();
const lecturerStore = useLecturerStore();
const router = useRouter();

// Table headers
const headers = [
  { title: 'Course Code', key: 'code', sortable: true },
  { title: 'Course Name', key: 'name', sortable: true },
  { title: 'Description', key: 'description', sortable: true },
  { title: 'Lecturer', key: 'lecturer', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
];

// State
const dialogVisible = ref(false);
const editingCourse = ref<Course | null>(null);
const isValid = ref(false);
const form = ref<any>(null);
const viewType = ref('table');

const formData = ref({
  code: '',
  name: '',
  description: '',
  lecturer: undefined as number | undefined
});

// Methods
function getLecturerName(lecturer: number | { id: number; first_name: string; last_name: string; email: string; } | undefined): string {
  if (!lecturer) return 'Not Assigned';
  if (typeof lecturer === 'number') {
    const lecturerData = lecturerStore.lecturerById(lecturer);
    return lecturerData ? `${lecturerData.first_name} ${lecturerData.last_name}` : 'Unknown Lecturer';
  }
  return `${lecturer.first_name} ${lecturer.last_name}`;
}

function openAddCourseDialog() {
  editingCourse.value = null;
  resetForm();
  dialogVisible.value = true;
}

function editCourse(course: Course | PopulatedCourse) {
  const departmentId = typeof course.department === 'number' 
    ? course.department 
    : course.department.id;
    
  editingCourse.value = {
    id: course.id,
    code: course.code,
    name: course.name,
    description: course.description,
    credits: course.credits,
    department: departmentId,
    is_active: course.is_active,
    lecturer: typeof course.lecturer === 'number' ? course.lecturer : course.lecturer?.id,
    created_at: course.created_at,
    updated_at: course.updated_at
  };
  
  formData.value = {
    code: course.code,
    name: course.name,
    description: course.description || '',
    lecturer: typeof course.lecturer === 'number' ? course.lecturer : course.lecturer?.id
  };
  
  dialogVisible.value = true;
}

async function saveCourse() {
  if (!isValid.value) return;

  try {
    if (editingCourse.value) {
      await courseStore.updateCourse(editingCourse.value.id, {
        code: formData.value.code,
        name: formData.value.name,
        description: formData.value.description,
        lecturer: formData.value.lecturer
      });
    } else {
      await courseStore.createCourse({
        code: formData.value.code,
        name: formData.value.name,
        description: formData.value.description,
        lecturer: formData.value.lecturer!
      });
    }
    closeDialog();
  } catch (error) {
    console.error('Error saving course:', error);
  }
}

async function deleteCourse(course: Course | PopulatedCourse) {
  if (confirm('Are you sure you want to delete this course?')) {
    try {
      await courseStore.deleteCourse(course.id);
    } catch (error) {
      console.error('Error deleting course:', error);
    }
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

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      courseStore.fetchCourses(),
      lecturerStore.fetchLecturers()
    ]);
  } catch (error) {
    console.error('Error loading data:', error);
    courseStore.resetState();
    lecturerStore.resetState();
  }
});
</script>
