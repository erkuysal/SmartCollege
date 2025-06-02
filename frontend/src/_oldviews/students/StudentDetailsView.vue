<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// import { useStudentStore } from '@/utils/stores/users/studentStore';
import { useStudentStore} from '../../utils/stores/users/studentStore'
// import { useFacultyStore } from '@/utils/stores/college/facultyStore';
import { useFacultyStore } from '../../utils/stores/college/facultyStore'
// import { BaseFormCard, FormActions } from '@/components/common';
import { BaseFormCard, FormActions } from '../components/common';
// import type { Student } from '@/utils/interfaces/users/studentInterface';
import type { Student } from '../../utils/interfaces/users/studentInterface';

const router = useRouter();
const route = useRoute();
const studentStore = useStudentStore();
const facultyStore = useFacultyStore();

// State
const loading = ref(false);
const student = ref<Student | null>(null);
const activeTab = ref(0);
const snackbarConfig = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
});

// Get student ID from route
const studentId = computed(() => {
  return route.params.id ? Number(route.params.id) : null;
});

// Fetch student data
const loadStudent = async () => {
  if (!studentId.value) {
    snackbarConfig.value = {
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
    student.value = studentStore.selectedItem;

    if (!student.value) {
      snackbarConfig.value = {
        show: true,
        text: 'Student not found',
        color: 'error',
        timeout: 3000
      };
      setTimeout(() => router.push('/dashboard/students'), 1500);
    }
  } catch (error) {
    console.error('Error loading student:', error);
    snackbarConfig.value = {
      show: true,
      text: 'Error loading student details',
      color: 'error',
      timeout: 3000
    };
  } finally {
    loading.value = false;
  }
};

// Actions
const handleEdit = () => {
  router.push(`/dashboard/students/edit/${studentId.value}`);
};

const handleBack = () => {
  router.push('/dashboard/students');
};

// Computed properties for formatted data
const facultyName = computed(() => {
  const s = student.value;
  if (!s) return 'N/A';
  return s.faculty_name || facultyStore.items.find(f => f.id === s.faculty)?.name || 'N/A';
});

const enrollmentDate = computed(() => {
  if (!student.value?.enrolled_at) return 'N/A';
  return new Date(student.value.enrolled_at).toLocaleDateString();
});

// Load data
onMounted(async () => {
  try {
    // Load faculties first if not already loaded
    if (!facultyStore.items?.length) {
      await facultyStore.fetchFaculties();
    }
    // Then load the student data
    await loadStudent();
  } catch (error) {
    console.error('Error in component initialization:', error);
    snackbarConfig.value = {
      show: true,
      text: 'Error loading data',
      color: 'error',
      timeout: 3000
    };
  }
});
</script>

<template>
  <div class="student-details-container">
    <!-- Header with actions -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="d-flex align-center">
        <v-btn icon class="mr-2" @click="handleBack">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h1 class="text-h4">Student Details</h1>
      </div>
      <v-btn 
        color="primary" 
        prepend-icon="mdi-pencil" 
        @click="handleEdit"
        :disabled="!student"
      >
        Edit Student
      </v-btn>
    </div>

    <!-- Loading state -->
    <v-progress-circular 
      v-if="loading" 
      indeterminate 
      class="mx-auto d-block my-8" 
      size="64"
    />

    <div v-else-if="student">
      <!-- Basic info card -->
      <BaseFormCard
        title="Student Information"
        :loading="false"
        :snackbar="snackbarConfig"
        max-width="100%"
      >
        <div class="student-profile d-flex flex-column flex-md-row">
          <!-- Left side - avatar and basic details -->
          <div class="student-avatar text-center pa-4">
            <v-avatar size="120" color="primary" class="mb-4">
              <span class="text-h4 text-white">
                {{ student.first_name[0] }}{{ student.last_name[0] }}
              </span>
            </v-avatar>
            <h2 class="text-h5 mb-1">{{ student.first_name }} {{ student.last_name }}</h2>
            <p class="text-subtitle-1 mb-2">{{ student.student_number }}</p>
            <v-chip :color="student.student_status === 'ACTIVE' ? 'success' : 'error'" class="mx-auto">
              {{ student.student_status }}
            </v-chip>
          </div>

          <!-- Right side - detailed info -->
          <div class="student-details flex-grow-1 pa-4">
            <v-row>
              <v-col cols="12" md="6">
                <v-list>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-email</v-icon>
                    </template>
                    <v-list-item-title>Email</v-list-item-title>
                    <v-list-item-subtitle>{{ student.email }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-school</v-icon>
                    </template>
                    <v-list-item-title>Faculty</v-list-item-title>
                    <v-list-item-subtitle>{{ facultyName }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" md="6">
                <v-list>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-calendar</v-icon>
                    </template>
                    <v-list-item-title>Enrolled Date</v-list-item-title>
                    <v-list-item-subtitle>{{ enrollmentDate }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-numeric</v-icon>
                    </template>
                    <v-list-item-title>Semester</v-list-item-title>
                    <v-list-item-subtitle>{{ student.semester || 'N/A' }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </div>
        </div>
      </BaseFormCard>

      <!-- Tabs for additional details -->
      <v-card class="mt-4">
        <v-tabs v-model="activeTab" bg-color="primary">
          <v-tab value="0">Enrolled Courses</v-tab>
          <v-tab value="1">Attendance</v-tab>
          <v-tab value="2">Grades</v-tab>
        </v-tabs>

        <v-card-text>
          <v-window v-model="activeTab">
            <!-- Enrolled Courses Tab -->
            <v-window-item value="0">
              <div v-if="student.courses && student.courses.length">
                <v-data-table
                  :headers="[
                    { title: 'Course Code', key: 'course_code' },
                    { title: 'Course Name', key: 'course_name' },
                    { title: 'Credits', key: 'credits' },
                    { title: 'Semester', key: 'semester' },
                    { title: 'Status', key: 'status' }
                  ]"
                  :items="student.courses"
                >
                  <template v-slot:item.status="{ item }">
                    <v-chip
                      :color="item.status === 'active' ? 'success' : 
                             item.status === 'completed' ? 'info' : 'error'"
                      size="small"
                    >
                      {{ item.status }}
                    </v-chip>
                  </template>
                </v-data-table>
              </div>
              <div v-else class="pa-4 text-center">
                <p>No courses enrolled</p>
              </div>
            </v-window-item>

            <!-- Attendance Tab -->
            <v-window-item value="1">
              <div v-if="student.attendance_records && student.attendance_records.length">
                <v-data-table
                  :headers="[
                    { title: 'Course', key: 'course_name' },
                    { title: 'Date', key: 'date' },
                    { title: 'Status', key: 'status' }
                  ]"
                  :items="student.attendance_records"
                >
                  <template v-slot:item.date="{ item }">
                    {{ new Date(item.date).toLocaleDateString() }}
                  </template>
                  <template v-slot:item.status="{ item }">
                    <v-chip
                      :color="item.status === 'present' ? 'success' : 
                             item.status === 'excused' ? 'warning' : 'error'"
                      size="small"
                    >
                      {{ item.status }}
                    </v-chip>
                  </template>
                </v-data-table>
              </div>
              <div v-else class="pa-4 text-center">
                <p>No attendance records</p>
              </div>
            </v-window-item>

            <!-- Grades Tab -->
            <v-window-item value="2">
              <div v-if="student.grades && student.grades.length">
                <v-data-table
                  :headers="[
                    { title: 'Course', key: 'course_name' },
                    { title: 'Semester', key: 'semester' },
                    { title: 'Credits', key: 'credits' },
                    { title: 'Grade', key: 'grade' },
                    { title: 'Date', key: 'grade_date' }
                  ]"
                  :items="student.grades"
                >
                  <template v-slot:item.grade_date="{ item }">
                    {{ new Date(item.grade_date).toLocaleDateString() }}
                  </template>
                </v-data-table>
              </div>
              <div v-else class="pa-4 text-center">
                <p>No grades available</p>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>

      <FormActions 
        submit-text="Back to List" 
        :show-cancel="false"
        @submit="handleBack"
        class="mt-4"
      />
    </div>

    <div v-else-if="!loading" class="text-center pa-8">
      <v-alert type="error" class="mx-auto" max-width="500">
        Student not found or could not be loaded
      </v-alert>
      <v-btn color="primary" class="mt-4" @click="handleBack">
        Back to Students List
      </v-btn>
    </div>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbarConfig.show"
      :color="snackbarConfig.color"
      :timeout="snackbarConfig.timeout"
    >
      {{ snackbarConfig.text }}
    </v-snackbar>
  </div>
</template>

<style scoped>
.student-details-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.student-profile {
  gap: 20px;
}

.student-avatar {
  min-width: 200px;
}

@media (max-width: 600px) {
  .student-avatar {
    margin-bottom: 24px;
  }
}
</style> 