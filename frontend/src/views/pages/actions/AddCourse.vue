<template>
  <v-dialog v-model="isVisible" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ modalTitle }}</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="isValid">
          <v-container>
            <v-row>
              <!-- Course Title -->
              <v-col cols="12">
                <v-text-field
                  v-model="formData.name"
                  label="Course Title"
                  required
                  :rules="[v => !!v || 'Title is required']"
                ></v-text-field>
              </v-col>

              <!-- Course Description -->
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Description"
                  rows="3"
                ></v-textarea>
              </v-col>

              <!-- Teacher Selection -->
              <v-col cols="12">
                <v-select
                  v-model="formData.lecturer"
                  :items="lecturers"
                  label="Assign Teacher"
                  item-title="full_name"
                  item-value="id"
                  :loading="isLoading"
                  clearable
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-avatar size="32">
                          <v-icon>mdi-account</v-icon>
                        </v-avatar>
                      </template>
                      <v-list-item-title>{{ item.raw.full_name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.raw.email }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          variant="text"
          @click="closeDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="text"
          @click="saveCourse"
          :loading="isLoading"
          :disabled="!isValid"
        >
          {{ submitButtonText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { PropType } from 'vue';
import { useLecturerStore } from '@/utils/stores/users/lecturerStore';
import { useCourseStore } from '@/utils/stores/college/courseStore';
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

// Form state
const form = ref<any>(null);
const isValid = ref(false);

// Form data
const formData = ref({
  name: '',
  description: '',
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

// Watch for editing course changes
watch(() => props.editingCourse, (newCourse) => {
  if (newCourse) {
    formData.value = {
      name: newCourse.name,
      description: newCourse.description || '',
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
    description: '',
    lecturer: undefined
  };
  if (form.value) {
    form.value.resetValidation();
  }
}

async function saveCourse() {
  if (!isValid.value) return;

  try {
    // Create a properly typed course object
    const courseData: Partial<Course> = {
      name: formData.value.name,
      description: formData.value.description,
    };
    
    // Only include lecturer if it's defined
    if (formData.value.lecturer !== undefined) {
      courseData.lecturer = formData.value.lecturer;
    }

    if (props.editingCourse) {
      await courseStore.updateCourse(props.editingCourse.id, courseData);
    } else {
      await courseStore.createCourse(courseData);
    }
    emit('saved');
    closeDialog();
  } catch (error) {
    console.error('Error saving course:', error);
  }
}

function closeDialog() {
  isVisible.value = false;
  resetForm();
}
</script>

<style scoped>
.v-card-title {
  word-break: break-word;
}
</style>

