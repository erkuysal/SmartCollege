<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStudentStore } from '../../utils/stores/users/studentStore';
import { useFacultyStore } from '../../utils/stores/college/facultyStore';
import { BaseFormCard, FormActions } from '../components/common';
import type { Student } from '../../utils/interfaces/users/studentInterface';

const router = useRouter();
const studentStore = useStudentStore();
const facultyStore = useFacultyStore();

// Form state
const student = ref<Partial<Student>>({
  first_name: '',
  last_name: '',
  email: '',
  faculty: undefined,
  student_status: 'ACTIVE',
  semester: 1,
  student_number: '',
  balance_points: 0
});

// UI state
const loading = ref(false);
const submitting = ref(false);
const formValid = ref(true);
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
});

// Form validation rules
const required = (v: any) => !!v || 'This field is required';
const emailRules = [
  required,
  (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'E-mail must be valid'
];

// Load faculties for dropdown
const loadFaculties = async () => {
  loading.value = true;
  try {
    await facultyStore.fetchFaculties();
  } catch (err) {
    console.error('Error loading faculties:', err);
    snackbar.value = {
      show: true,
      text: 'Unable to load faculties. Please try again.',
      color: 'error',
      timeout: 3000
    };
  } finally {
    loading.value = false;
  }
};

// Generate a student number
const generateStudentNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  student.value.student_number = `S${year}${random}`;
};

// Handle form submission
const handleSubmit = async () => {
  if (!formValid.value) return;
  
  submitting.value = true;
  
  try {
    await studentStore.createStudent(student.value);
    snackbar.value = {
      show: true,
      text: 'Student created successfully!',
      color: 'success',
      timeout: 3000
    };
    
    // Reset form after 2 seconds and navigate back
    setTimeout(() => {
      router.push('/dashboard/students');
    }, 2000);
  } catch (err: any) {
    console.error('Error creating student:', err);
    snackbar.value = {
      show: true,
      text: err.response?.data?.detail || 'Failed to create student. Please try again.',
      color: 'error',
      timeout: 3000
    };
  } finally {
    submitting.value = false;
  }
};

// Handle cancel
const handleCancel = () => {
  router.push('/dashboard/students');
};

// Handle generate student number
const handleGenerateStudentNumber = () => {
  generateStudentNumber();
};

onMounted(() => {
  loadFaculties();
  generateStudentNumber();
});
</script>

<template>
  <div class="add-student-container">
    <v-container>
      <v-row>
        <v-col cols="12">
          <BaseFormCard
            title="Add New Student"
            :loading="loading"
            :snackbar="snackbar"
            v-model="formValid"
          >
            <!-- Student details form -->
            <v-form v-model="formValid" @submit.prevent="handleSubmit">
              <v-row>
                <!-- Personal Information Section -->
                <v-col cols="12" class="py-2">
                  <div class="text-h6">Personal Information</div>
                  <v-divider class="mb-4"></v-divider>
                </v-col>

                <!-- First Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="student.first_name"
                    label="First Name"
                    :rules="[required]"
                    required
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>

                <!-- Last Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="student.last_name"
                    label="Last Name"
                    :rules="[required]"
                    required
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>

                <!-- Email -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="student.email"
                    label="Email"
                    :rules="emailRules"
                    required
                    variant="outlined"
                    density="comfortable"
                    autocomplete="email"
                  />
                </v-col>

                <!-- Academic Information Section -->
                <v-col cols="12" class="py-2">
                  <div class="text-h6">Academic Information</div>
                  <v-divider class="mb-4"></v-divider>
                </v-col>

                <!-- Student Number -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="student.student_number"
                    label="Student Number"
                    :rules="[required]"
                    required
                    variant="outlined"
                    density="comfortable"
                    append-inner-icon="mdi-refresh"
                    @click:append-inner="handleGenerateStudentNumber"
                  />
                </v-col>

                <!-- Faculty -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="student.faculty"
                    label="Faculty"
                    :items="facultyStore.items"
                    item-title="name"
                    item-value="id"
                    :rules="[required]"
                    required
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>

                <!-- Semester -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="student.semester"
                    label="Semester"
                    :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                    :rules="[required]"
                    required
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>

                <!-- Student Status -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="student.student_status"
                    label="Status"
                    :items="[
                      { title: 'Active', value: 'ACTIVE' },
                      { title: 'Inactive', value: 'INACTIVE' },
                      { title: 'Graduated', value: 'GRADUATED' }
                    ]"
                    item-title="title"
                    item-value="value"
                    :rules="[required]"
                    required
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>

                <!-- Balance Points -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="student.balance_points"
                    label="Balance Points"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
              
              <!-- Form Actions -->
              <FormActions 
                submit-text="Save Student"
                cancel-text="Cancel"
                :loading="submitting"
                @cancel="handleCancel"
              />
            </v-form>
          </BaseFormCard>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.add-student-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}
</style> 