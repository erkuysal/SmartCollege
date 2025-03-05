<template>
  <v-dialog v-model="isVisible" max-width="600px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center pa-4 bg-primary text-white">
        <v-icon color="white" class="mr-2">{{ isEditing ? 'mdi-pencil' : 'mdi-plus-circle' }}</v-icon>
        <span>{{ modalTitle }}</span>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" color="white" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Error Alert -->
      <v-alert
        v-if="errorMessage"
        type="error"
        class="mx-4 mt-4"
        closable
        variant="tonal"
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <v-card-text class="pt-4">
        <v-form ref="form" v-model="isValid">
          <v-container>
            <v-row>
              <!-- Course Code and Credits in the same row -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.code"
                  label="Course Code"
                  required
                  :rules="[v => !!v || 'Course code is required']"
                  hint="A unique identifier for the course (e.g., CS101)"
                  persistent-hint
                  prepend-inner-icon="mdi-identifier"
                  density="comfortable"
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
                  prepend-inner-icon="mdi-counter"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <!-- Course Title -->
              <v-col cols="12">
                <v-text-field
                  v-model="formData.name"
                  label="Course Title"
                  required
                  :rules="[v => !!v || 'Title is required']"
                  hint="Full name of the course"
                  persistent-hint
                  prepend-inner-icon="mdi-format-title"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <!-- Department Selection -->
              <v-col cols="12">
                <v-select
                  v-model="formData.department"
                  :items="departments"
                  label="Department"
                  item-title="name"
                  item-value="id"
                  :loading="departmentStore.loading"
                  required
                  :rules="[v => !!v || 'Department is required']"
                  hint="Department offering this course"
                  persistent-hint
                  prepend-inner-icon="mdi-domain"
                  density="comfortable"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-avatar color="primary" variant="tonal" size="32">
                          <span class="text-caption">{{ item.raw.code }}</span>
                        </v-avatar>
                      </template>
                      <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>

              <!-- Teacher Selection -->
              <v-col cols="12">
                <v-select
                  v-model="formData.lecturer"
                  :items="lecturers"
                  label="Assign Teacher (Optional)"
                  item-title="full_name"
                  item-value="id"
                  :loading="lecturerStore.loading"
                  clearable
                  hint="You can assign a lecturer later if needed"
                  persistent-hint
                  prepend-inner-icon="mdi-account-tie"
                  density="comfortable"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-avatar size="32" color="primary" variant="tonal">
                          <v-icon size="small">mdi-account</v-icon>
                        </v-avatar>
                      </template>
                      <v-list-item-title>{{ item.raw.full_name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.raw.email }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>

              <!-- Course Description -->
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Description"
                  rows="3"
                  hint="Brief description of the course content"
                  persistent-hint
                  prepend-inner-icon="mdi-text-box-outline"
                  density="comfortable"
                  auto-grow
                  counter
                  max-length="500"
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
          :disabled="isLoading"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="saveCourse"
          :loading="isLoading"
          :disabled="!isValid"
          prepend-icon="mdi-content-save"
        >
          {{ submitButtonText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { PropType } from 'vue';
import { useLecturerStore } from '@/utils/stores/users/lecturerStore';
import { useCourseStore } from '@/utils/stores/college/courseStore';
import { useDepartmentStore } from '@/utils/stores/college/departmentStore';
import type { Course, PopulatedCourse } from '@/utils/interfaces/college/courseInterface';
import type { Lecturer } from '@/utils/interfaces/users/lecturerInterface';

// Props and emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  editingCourse: {
    type: Object as PropType<PopulatedCourse | null>,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'saved']);

// Store instances
const lecturerStore = useLecturerStore();
const courseStore = useCourseStore();
const departmentStore = useDepartmentStore();

// Form state
const form = ref<any>(null);
const isValid = ref(false);

// Form data
const formData = ref({
  name: '',
  code: '',
  description: '',
  credits: 3,
  department: null as number | null,
  lecturer: undefined as number | undefined
});

// Loading state
const isSubmitting = ref(false);
const isLoading = computed(() => lecturerStore.loading || courseStore.loading);

// Computed properties
const isEditing = computed(() => !!props.editingCourse);
const modalTitle = computed(() => isEditing.value ? 'Edit Course' : 'Add New Course');
const submitButtonText = computed(() => isEditing.value ? 'Update Course' : 'Create Course');

// Modal visibility
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const lecturers = computed(() =>
  lecturerStore.items.map(lecturer => ({
    id: lecturer.id,
    full_name: `${lecturer.first_name} ${lecturer.last_name}`,
    email: lecturer.email
  }))
);

const departments = computed(() => departmentStore.items);

// Add error state
const errorMessage = ref('');

// Watch for editing course changes
watch(() => props.editingCourse, (newCourse) => {
  if (newCourse) {
    formData.value = {
      name: newCourse.name,
      code: newCourse.code,
      description: newCourse.description || '',
      credits: newCourse.credits || 3,
      department: typeof newCourse.department === 'object' ? newCourse.department.id : newCourse.department,
      lecturer: newCourse.lecturers?.[0]?.id
    };
  } else {
    resetForm();
  }
}, { immediate: true });

// Methods
function resetForm() {
  formData.value = {
    name: '',
    code: '',
    description: '',
    credits: 3,
    department: null,
    lecturer: undefined
  };
  if (form.value) {
    form.value.resetValidation();
  }
}

async function saveCourse() {
  if (!isValid.value) return;
  
  errorMessage.value = '';

  try {
    // Create a properly typed course object
    const courseData: Partial<Course> = {
      name: formData.value.name,
      code: formData.value.code,
      description: formData.value.description,
      credits: formData.value.credits,
    };
    
    // Only include department if it's not null
    if (formData.value.department !== null) {
      courseData.department = formData.value.department;
    }
    
    // Only include lecturer if it's defined
    if (formData.value.lecturer !== undefined) {
      courseData.lecturer = formData.value.lecturer;
    }

    console.log('Submitting course data:', courseData);

    if (props.editingCourse) {
      await courseStore.updateCourse(props.editingCourse.id, courseData);
    } else {
      await courseStore.createCourse(courseData);
    }
    emit('saved');
    closeDialog();
  } catch (error: any) {
    console.error('Error saving course:', error);
    errorMessage.value = courseStore.error || 'Failed to save course. Please check your inputs and try again.';
  }
}

function closeDialog() {
  isVisible.value = false;
  resetForm();
}

// Add onMounted hook
onMounted(async () => {
  try {
    if (departmentStore.items.length === 0) {
      await departmentStore.fetchDepartments();
    }
    if (lecturerStore.items.length === 0) {
      await lecturerStore.fetchLecturers();
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
});
</script>

<style scoped>
.v-card-title {
  word-break: break-word;
}

.v-list-item-title {
  font-weight: 500;
}
</style>

