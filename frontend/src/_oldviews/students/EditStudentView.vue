<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStudentStore } from '../../utils/stores/users/studentStore';
import { useFacultyStore } from '../../utils/stores/college/facultyStore';
import { BaseFormCard, FormActions } from '../components/common';
import type { Student } from '../../utils/interfaces/users/studentInterface';

const router = useRouter();
const route = useRoute();
const studentStore = useStudentStore();
const facultyStore = useFacultyStore();

// State
const loading = ref(false);
const submitting = ref(false);
const formValid = ref(true);
const student = ref<Partial<Student> | null>(null);
const originalStudent = ref<Student | null>(null);
const activeTab = ref(0);
const isEditMode = ref(true);
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
});

// Get student ID from route
const studentId = computed(() => {
  return route.params.id ? Number(route.params.id) : null;
});

// Form validation rules
const required = (v: any) => !!v || 'This field is required';
const emailRules = [
  required,
  (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'E-mail must be valid'
];

// Computed properties for formatted data
const facultyName = computed(() => {
  if (!originalStudent.value) return 'N/A';
  
  if (typeof originalStudent.value.faculty === 'object') {
    return originalStudent.value.faculty.name;
  }
  
  return facultyStore.items.find(f => f.id === originalStudent.value?.faculty)?.name || 'N/A';
});

const enrollmentDate = computed(() => {
  if (!originalStudent.value?.enrolled_at) return 'N/A';
  return new Date(originalStudent.value.enrolled_at).toLocaleDateString();
});

// Load faculties for dropdown
const loadFaculties = async () => {
  try {
    if (!facultyStore.items.length) {
      await facultyStore.fetchFaculties();
    }
  } catch (err) {
    console.error('Error loading faculties:', err);
    snackbar.value = {
      show: true,
      text: 'Unable to load faculties. Please try again.',
      color: 'error',
      timeout: 3000
    };
  }
};

// Fetch student data
const loadStudent = async () => {
  if (!studentId.value) {
    snackbar.value = {
      show: true,
      text: 'Invalid student ID',
      color: 'error',
      timeout: 3000
    };
    return;
  }

  loading.value = true;
  try {
    await studentStore.fetchStudentById(studentId.value);
    originalStudent.value = studentStore.selectedItem;

    if (!originalStudent.value) {
      snackbar.value = {
        show: true,
        text: 'Student not found',
        color: 'error',
        timeout: 3000
      };
      setTimeout(() => router.push('/dashboard/students'), 1500);
      return;
    }

    // Store the original student_number separately for verification
    const originalStudentNumber = originalStudent.value.student_number;

    // Initialize the editable student data
    student.value = { 
      ...originalStudent.value,
      // Make sure to handle faculty correctly
      faculty: typeof originalStudent.value.faculty === 'object' 
        ? originalStudent.value.faculty.id 
        : originalStudent.value.faculty
    };

    // Add a watcher to prevent student_number from being changed even programmatically
    watch(() => student.value?.student_number, (newValue, oldValue) => {
      if (student.value && newValue !== originalStudentNumber) {
        // Revert any attempts to change student_number
        student.value.student_number = originalStudentNumber;
        console.warn('Attempt to modify student number was prevented');
        
        // Show warning to user
        snackbar.value = {
          show: true,
          text: 'Student number cannot be modified',
          color: 'warning',
          timeout: 3000
        };
      }
    });
  } catch (error) {
    console.error('Error loading student:', error);
    snackbar.value = {
      show: true,
      text: 'Error loading student details',
      color: 'error',
      timeout: 3000
    };
  } finally {
    loading.value = false;
  }
};

// Handle form submission (save changes)
const handleSubmit = async () => {
  if (!formValid.value || !student.value || !studentId.value) return;
  
  // Double check student number hasn't been tampered with
  if (originalStudent.value && student.value.student_number !== originalStudent.value.student_number) {
    snackbar.value = {
      show: true,
      text: 'Student number modification detected. Changes not saved.',
      color: 'error',
      timeout: 3000
    };
    return;
  }
  
  submitting.value = true;
  
  try {
    // Create a copy of student data without read-only fields
    const { student_number, enrolled_at, ...studentDataToUpdate } = student.value;
    
    // Add verification data for backend validation
    const verificationData = {
      ...studentDataToUpdate,
      _original_student_number: originalStudent.value?.student_number,
      _verify_id: studentId.value
    };
    
    await studentStore.safeUpdateStudent(studentId.value, verificationData);
    snackbar.value = {
      show: true,
      text: 'Student updated successfully!',
      color: 'success',
      timeout: 3000
    };
    
    // Navigate back to details immediately
    router.push(`/dashboard/students/${studentId.value}`);
  } catch (err: any) {
    console.error('Error updating student:', err);
    snackbar.value = {
      show: true,
      text: err.response?.data?.detail || 'Failed to update student. Please try again.',
      color: 'error',
      timeout: 3000
    };
  } finally {
    submitting.value = false;
  }
};

// Handle cancel
const handleCancel = () => {
  // Go back to details
  router.push(`/dashboard/students/${studentId.value}`);
};

// Load data
onMounted(async () => {
  try {
    await loadFaculties();
    await loadStudent();
  } catch (error) {
    console.error('Error in component initialization:', error);
    snackbar.value = {
      show: true,
      text: 'Error loading data',
      color: 'error',
      timeout: 3000
    };
  }
});
</script>

<template>
  <div class="student-edit-container">
    <!-- Header with actions -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="d-flex align-center">
        <v-btn icon class="mr-2" @click="handleCancel">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h1 class="text-h4">Edit Student</h1>
      </div>
    </div>

    <!-- Loading state -->
    <v-progress-circular 
      v-if="loading" 
      indeterminate 
      class="mx-auto d-block my-8" 
      size="64"
    />

    <div v-else-if="student && originalStudent">
      <!-- Edit form -->
      <v-form v-model="formValid">
        <BaseFormCard
          title="Student Information"
          :loading="false"
          :snackbar="snackbar"
          max-width="100%"
        >
          <div class="student-profile d-flex flex-column flex-md-row">
            <!-- Left side - avatar and basic details -->
            <div class="student-avatar text-center pa-4">
              <v-avatar size="120" color="primary" class="mb-4">
                <span class="text-h4 text-white">
                  {{ student.first_name?.[0] }}{{ student.last_name?.[0] }}
                </span>
              </v-avatar>
              
              <div>
                <v-text-field
                  v-model="student.first_name"
                  label="First Name"
                  :rules="[required]"
                  required
                  variant="outlined"
                  density="comfortable"
                  class="mb-2"
                />
                <v-text-field
                  v-model="student.last_name"
                  label="Last Name"
                  :rules="[required]"
                  required
                  variant="outlined"
                  density="comfortable"
                  class="mb-2"
                />
                <!-- Student number is now read-only -->
                <div class="mb-3">
                  <div class="text-subtitle-1 font-weight-medium">Student Number</div>
                  <div class="text-body-1">{{ student.student_number }}</div>
                </div>
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
              </div>
            </div>

            <!-- Right side - detailed info -->
            <div class="student-details flex-grow-1 pa-4">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="student.email"
                    label="Email"
                    :rules="emailRules"
                    required
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-email"
                    class="mb-4"
                  />
                  
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
                    prepend-inner-icon="mdi-school"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <!-- Enrolled Date (read-only) -->
                  <div class="mb-4">
                    <div class="text-subtitle-1 font-weight-medium">
                      <v-icon size="small" color="primary" class="me-1">mdi-calendar</v-icon>
                      Enrolled Date
                    </div>
                    <div class="text-body-1 pl-7">{{ enrollmentDate }}</div>
                  </div>

                  <v-select
                    v-model="student.semester"
                    label="Semester"
                    :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                    :rules="[required]"
                    required
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-numeric"
                    class="mb-4"
                  />
                  
                  <v-text-field
                    v-model="student.balance_points"
                    label="Balance Points"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-currency-usd"
                  />
                </v-col>
              </v-row>
            </div>
          </div>
          
          <div class="mt-4">
            <FormActions 
              submit-text="Save Changes"
              cancel-text="Cancel"
              :loading="submitting"
              @cancel="handleCancel"
              @submit="handleSubmit"
            />
          </div>
        </BaseFormCard>
      </v-form>
    </div>

    <div v-else-if="!loading" class="text-center pa-8">
      <v-alert type="error" class="mx-auto" max-width="500">
        Student not found or could not be loaded
      </v-alert>
      <v-btn color="primary" class="mt-4" @click="router.push('/dashboard/students')">
        Back to Students List
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.student-edit-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.student-profile {
  gap: 20px;
}

.student-avatar {
  min-width: 250px;
}

@media (max-width: 600px) {
  .student-avatar {
    margin-bottom: 24px;
  }
}
</style> 