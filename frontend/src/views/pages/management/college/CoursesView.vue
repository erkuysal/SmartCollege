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
      v-if="collegeStore.error"
      type="error"
      class="mt-4"
      closable
    >
      {{ collegeStore.error }}
    </v-alert>

    <!-- Table View -->
    <v-data-table
      v-if="viewType === 'table'"
      :headers="headers"
      :items="collegeStore.courses"
      :loading="collegeStore.loading"
      class="mt-4"
    >
      <template #item.teacher="{ item }">
        {{ getTeacherName(item.teacher) }}
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
        v-for="course in collegeStore.courses"
        :key="course.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card>
          <v-card-title class="text-h6">
            {{ course.title }}
          </v-card-title>

          <v-card-text>
            <p class="mb-2">{{ course.description || 'No description available' }}</p>
            <v-chip class="mb-2">
              <v-icon start>mdi-account-tie</v-icon>
              {{ getTeacherName(course.teacher) }}
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
                    v-model="formData.title"
                    label="Course Code"
                    required
                    :rules="[v => !!v || 'Course code is required']"
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
                    v-model="formData.teacher"
                    :items="teacherStore.teachers"
                    item-title="first_name"
                    item-value="id"
                    label="Teacher"
                    required
                    :rules="[v => !!v || 'Teacher is required']"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        {{ item.raw.first_name }} {{ item.raw.last_name }}
                      </v-list-item>
                    </template>
                    <template #selection="{ item }">
                      {{ item.first_name }} {{ item.last_name }}
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
            :loading="collegeStore.loading"
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
import { useCollegeStore } from '@/utils/stores/collegeStore';
import { useTeacherStore } from '@/utils/stores/users/teacherStore';
import type { Course } from '@/utils/interfaces/collegeInterface';

const collegeStore = useCollegeStore();
const teacherStore = useTeacherStore();
const router = useRouter();

// State
const dialogVisible = ref(false);
const editingCourse = ref<Course | null>(null);
const isValid = ref(false);
const form = ref<any>(null);
const viewType = ref('table');

const formData = ref({
  title: '',
  description: '',
  teacher: null as number | null
});

// Table headers
const headers = [
  { title: 'Course Code', key: 'title', align: 'start' },
  { title: 'Description', key: 'description' },
  { title: 'Teacher', key: 'teacher' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

// Methods
function getTeacherName(teacherId: number | null): string {
  if (!teacherId) return 'Not Assigned';
  const teacher = teacherStore.teacherById(teacherId);
  return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown Teacher';
}

function openAddCourseDialog() {
  editingCourse.value = null;
  resetForm();
  dialogVisible.value = true;
}

function editCourse(course: Course) {
  editingCourse.value = course;
  formData.value = {
    title: course.title,
    description: course.description || '',
    teacher: course.teacher
  };
  dialogVisible.value = true;
}

async function saveCourse() {
  if (!isValid.value) return;

  try {
    if (editingCourse.value) {
      await collegeStore.updateCourse(editingCourse.value.id, {
        title: formData.value.title,
        description: formData.value.description,
        teacher: formData.value.teacher
      });
    } else {
      await collegeStore.addCourse({
        title: formData.value.title,
        description: formData.value.description,
        teacher: formData.value.teacher!
      });
    }
    closeDialog();
  } catch (error) {
    console.error('Error saving course:', error);
  }
}

async function deleteCourse(course: Course) {
  if (confirm('Are you sure you want to delete this course?')) {
    try {
      await collegeStore.deleteCourse(course.id);
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
    title: '',
    description: '',
    teacher: null
  };
  if (form.value) {
    form.value.resetValidation();
  }
}

function viewCourseDetails(course: Course) {
  router.push({
    name: 'course-details',
    params: { id: course.id }
  });
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      collegeStore.fetchCourses(),
      teacherStore.fetchTeachers()
    ]);
  } catch (error) {
    console.error('Error loading data:', error);
  }
});
</script>
