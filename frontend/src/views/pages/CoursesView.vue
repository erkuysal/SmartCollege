<template>
  <v-container fluid class="py-4 px-4">
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon left class="mr-2">mdi-book-education</v-icon>
        <span class="text-h6">Courses</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

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

    <!-- Courses Table -->
    <v-data-table
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
import { useCollegeStore } from '@/utils/stores/collegeStore';
import { useTeacherStore } from '@/utils/stores/teacherStore';
import type { Course } from '@/utils/interfaces/collegeInterface';

const collegeStore = useCollegeStore();
const teacherStore = useTeacherStore();

// State
const dialogVisible = ref(false);
const editingCourse = ref<Course | null>(null);
const isValid = ref(false);
const form = ref<any>(null);

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
