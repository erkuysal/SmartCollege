<template>
  <v-dialog v-model="dialogModel" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ editingCourse ? 'Edit Course' : 'Add New Course' }}</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="isValid">
          <v-container>
            <v-row>
              <!-- Course Title -->
              <v-col cols="12">
                <v-text-field
                  v-model="formData.title"
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
                  v-model="formData.teacher"
                  :items="teachers"
                  label="Assign Teacher"
                  item-title="full_name"
                  item-value="id"
                  :loading="teacherStore.isLoading"
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
          :loading="collegeStore.isLoading"
          :disabled="!isValid"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { PropType } from 'vue';
import { useTeacherStore } from '@/utils/stores/teacherStore';
import { useCollegeStore } from '@/utils/stores/collegeStore';
import type { Course, CourseFormData } from '@/utils/interfaces/collegeInterface';

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  editingCourse: {
    type: Object as PropType<Course | null>,
    default: null
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'saved']);

// Store instances
const teacherStore = useTeacherStore();
const collegeStore = useCollegeStore();

// Form state
const form = ref<any>(null);
const isValid = ref(false);
const formData = ref<CourseFormData>({
  title: '',
  description: '',
  teacher: undefined
});

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const teachers = computed(() => 
  teacherStore.teachers.map(teacher => ({
    id: teacher.id,
    full_name: `${teacher.first_name} ${teacher.last_name}`,
    email: teacher.email
  }))
);

// Watch for editing course changes
watch(() => props.editingCourse, (newCourse) => {
  if (newCourse) {
    formData.value = {
      title: newCourse.title,
      description: newCourse.description || '',
      teacher: newCourse.teacher
    };
  } else {
    resetForm();
  }
}, { immediate: true });

// Methods
function resetForm() {
  formData.value = {
    title: '',
    description: '',
    teacher: undefined
  };
  if (form.value) {
    form.value.resetValidation();
  }
}

async function saveCourse() {
  if (!isValid.value) return;

  try {
    if (props.editingCourse) {
      await collegeStore.updateCourse(props.editingCourse.id, formData.value);
    } else {
      await collegeStore.createCourse(formData.value);
    }
    emit('saved');
    closeDialog();
  } catch (error) {
    console.error('Error saving course:', error);
  }
}

function closeDialog() {
  dialogModel.value = false;
  resetForm();
}
</script>

<style scoped>
.v-card-title {
  word-break: break-word;
}
</style>
