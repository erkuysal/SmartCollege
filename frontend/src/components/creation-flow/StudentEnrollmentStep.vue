<template>
  <div class="student-enrollment-step">
    <v-alert
      v-if="error"
      type="error"
      class="mb-4"
      closable
    >
      {{ error }}
    </v-alert>
    
    <v-row>
      <!-- Student Creation -->
      <!-- Removed from template -->

      <!-- Course Enrollment -->
      <v-col cols="12" md="6">
        <v-card class="h-100" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-book-plus</v-icon>
            Course Enrollment
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="enrollStudent" v-model="enrollmentFormValid">
              <v-select
                v-model="enrollmentForm.studentId"
                :items="students"
                item-title="name"
                item-value="id"
                label="Select Student"
                :rules="[(v: any) => !!v || 'Student selection is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:title>
                      {{ item.raw.first_name }} {{ item.raw.last_name }}
                    </template>
                    <template v-slot:subtitle>
                      {{ getDepartmentName(item.raw.faculty) }}
                    </template>
                  </v-list-item>
                </template>
              </v-select>
              <v-select
                v-model="enrollmentForm.courseId"
                :items="availableCourses"
                item-title="name"
                item-value="id"
                label="Select Course"
                :rules="[(v: any) => !!v || 'Course selection is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />
              <v-select
                v-model="enrollmentForm.termId"
                :items="activeTerms"
                item-title="name"
                item-value="id"
                label="Select Term"
                :rules="[(v: any) => !!v || 'Term selection is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />
              <v-select
                v-model="enrollmentForm.sectionId"
                :items="availableSections"
                item-title="section_number"
                item-value="id"
                label="Select Section"
                :rules="[(v: any) => !!v || 'Section selection is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :disabled="!enrollmentForm.courseId || !enrollmentForm.termId"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:title>
                      Section {{ item.raw.section_number }}
                    </template>
                    <template v-slot:subtitle>
                      Capacity: {{ item.raw.capacity }}
                    </template>
                  </v-list-item>
                </template>
              </v-select>
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="!enrollmentFormValid"
                block
              >
                <v-icon left>mdi-plus</v-icon>
                Enroll Student
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Section Creation -->
      <v-col cols="12" md="6">
        <v-card class="h-100" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-book-multiple</v-icon>
            Section Creation
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="createSection" v-model="sectionFormValid">
              <v-select
                v-model="sectionForm.courseId"
                :items="courses"
                item-title="name"
                item-value="id"
                label="Select Course"
                :rules="[(v: any) => !!v || 'Course selection is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />
              <v-select
                v-model="sectionForm.termId"
                :items="activeTerms"
                item-title="name"
                item-value="id"
                label="Select Term"
                :rules="[(v: any) => !!v || 'Term selection is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />
              <v-text-field
                v-model="sectionForm.section_number"
                label="Section Number"
                :rules="[(v: any) => !!v || 'Section number is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />
              <v-text-field
                v-model.number="sectionForm.capacity"
                label="Capacity"
                type="number"
                :rules="[
                  (v: any) => !!v || 'Capacity is required',
                  (v: any) => v > 0 || 'Capacity must be greater than 0'
                ]"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="!sectionFormValid"
                block
              >
                <v-icon left>mdi-plus</v-icon>
                Create Section
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Student List -->
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-account-group</v-icon>
            Student List
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="enrollmentTableHeaders"
              :items="enrollments"
              :loading="loading"
              class="elevation-1"
            >
              <template v-slot:item.student="{ item }">
                {{ getStudentName(item.student) }}
              </template>
              <template v-slot:item.section="{ item }">
                {{ getCourseName(item.section) }}
              </template>
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="item.status === 'registered' ? 'success' : 'warning'"
                  size="small"
                >
                  {{ item.status }}
                </v-chip>
              </template>
              <template v-slot:item.date_enrolled="{ item }">
                {{ new Date(item.date_enrolled).toLocaleDateString() }}
              </template>
              <template v-slot:item.grade="{ item }">
                {{ item.grade || 'Not Graded' }}
              </template>
              <template v-slot:item.notes="{ item }">
                {{ item.notes || '-' }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  variant="text"
                  color="error"
                  size="small"
                  @click="enrollmentStore.deleteEnrollment(item.id)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Progress Summary -->
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-chart-box</v-icon>
            Setup Progress
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-card variant="tonal" color="primary" class="text-center">
                  <v-card-text>
                    <div class="text-h4 mb-2">{{ students.length }}</div>
                    <div class="text-subtitle-1">Total Students</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="tonal" color="primary" class="text-center">
                  <v-card-text>
                    <div class="text-h4 mb-2">{{ totalEnrollments }}</div>
                    <div class="text-subtitle-1">Total Enrollments</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="tonal" color="primary" class="text-center">
                  <v-card-text>
                    <div class="text-h4 mb-2">{{ averageEnrollments }}</div>
                    <div class="text-subtitle-1">Avg. Enrollments/Student</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            <v-btn
              color="success"
              size="large"
              block
              class="mt-6"
              :disabled="!canCompleteStep"
              @click="completeStep"
            >
              <v-icon left>mdi-check-circle</v-icon>
              Complete Student Enrollment Setup
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStudentStore } from '@/utils/stores/users/studentStore';
import { useCourseStore } from '@/utils/stores/college/courseStore';
import { useDepartmentStore } from '@/utils/stores/college/departmentStore';
import { useTermStore } from '@/utils/stores/academics/termStore';
import { useEnrollmentStore } from '@/utils/stores/academics/enrollmentStore';
import { useSectionStore } from '@/utils/stores/academics/sectionStore';
import type { Section } from '@/utils/services/academics/sectionService';

// Interfaces
interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  faculty: number | { id: number; name: string; [key: string]: any };
  student_status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  semester: number;
  balance_points: number;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

interface Term {
  id: number;
  name: string;
  term: string | null;
  academic_year: string;
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  is_active: boolean;
}

interface Department {
  id: number;
  name: string;
}

interface Enrollment {
  id: number;
  student: number;
  section: number;
  status: string;
  date_enrolled: string;
  date_status_changed: string;
  grade: string;
  notes: string;
}

interface SectionForm {
  courseId: number;
  termId: number;
  section_number: string;
  capacity: number;
}

// Constants
const enrollmentTableHeaders = [
  { title: 'Student', key: 'student' },
  { title: 'Course', key: 'section' },
  { title: 'Status', key: 'status' },
  { title: 'Date Enrolled', key: 'date_enrolled' },
  { title: 'Grade', key: 'grade' },
  { title: 'Notes', key: 'notes' },
  { title: 'Actions', key: 'actions', sortable: false }
];

// Store initialization
const studentStore = useStudentStore();
const courseStore = useCourseStore();
const departmentStore = useDepartmentStore();
const termStore = useTermStore();
const enrollmentStore = useEnrollmentStore();
const sectionStore = useSectionStore();

// Form validation
const enrollmentFormValid = ref(false);
const sectionFormValid = ref(false);

// Form data
const enrollmentForm = ref({
  studentId: 0,
  courseId: 0,
  termId: 0,
  sectionId: 0
});

const sectionForm = ref<SectionForm>({
  courseId: 0,
  termId: 0,
  section_number: '',
  capacity: 30
});

// Data storage
const courses = ref<Course[]>([]);
const terms = ref<Term[]>([]);
const departments = ref<Department[]>([]);
const sections = computed(() => sectionStore.items);
const enrollments = computed(() => Array.isArray(enrollmentStore.items) ? enrollmentStore.items : []);
const loading = computed(() => studentStore.loading || courseStore.loading || termStore.loading || enrollmentStore.loading || sectionStore.loading);
const error = computed(() => studentStore.error || courseStore.error || termStore.error || enrollmentStore.error || sectionStore.error);

// Computed properties
const students = computed(() => studentStore.items);

const availableCourses = computed(() => {
  return courses.value;
});

const activeTerms = computed(() => {
  return Array.isArray(termStore.terms)
    ? termStore.terms.filter(term => term && typeof term.name === 'string')
    : [];
});

const totalEnrollments = computed(() => {
  return enrollments.value.length;
});

const averageEnrollments = computed(() => {
  if (students.value.length === 0) return 0;
  return (totalEnrollments.value / students.value.length).toFixed(1);
});

const canCompleteStep = computed(() => {
  return students.value.length > 0 && enrollments.value.length > 0;
});

const availableSections = computed(() => {
  if (!enrollmentForm.value.courseId || !enrollmentForm.value.termId) return [];
  return sections.value.filter(section => 
    section.course === enrollmentForm.value.courseId && 
    section.academic_term === enrollmentForm.value.termId
  );
});

// Add helper methods for enrollment data
const getStudentName = (studentId: number) => {
  const student = students.value.find(s => s.id === studentId);
  return student ? `${student.first_name} ${student.last_name}` : 'Unknown Student';
};

const getCourseName = (sectionId: number) => {
  const section = sections.value.find(s => s.id === sectionId);
  if (!section) return 'Unknown Section';
  const course = courses.value.find(c => c.id === section.course);
  return course ? `${course.code} - ${course.name}` : 'Unknown Course';
};

// Methods
const enrollStudent = async () => {
  if (!enrollmentFormValid.value) return;
  try {
    const now = new Date().toISOString();
    const enrollmentData = {
      student: enrollmentForm.value.studentId,
      section: enrollmentForm.value.sectionId,
      status: 'registered',
      date_enrolled: now,
      date_status_changed: now,
      grade: '',
      notes: ''
    };
    await enrollmentStore.createEnrollment(enrollmentData);
    enrollmentForm.value = { studentId: 0, courseId: 0, termId: 0, sectionId: 0 };
  } catch (error) {
    console.error('Error enrolling student:', error);
  }
};

const getDepartmentName = (faculty: number | { id: number; name: string }) => {
  if (!faculty) return 'Unknown';
  const facultyId = typeof faculty === 'object' ? faculty.id : faculty;
  if (facultyId == null) return 'Unknown';
  const department = departments.value.find(d => d.id === facultyId);
  return department ? department.name : 'Unknown';
};

const viewEnrollments = (student: Student) => {
  // Implement view enrollments functionality
  console.log('View enrollments for:', student);
};

const deleteStudent = async (student: Student) => {
  if (!confirm('Are you sure you want to delete this student?')) return;
  
  try {
    await studentStore.deleteStudent(student.id);
  } catch (error) {
    console.error('Error deleting student:', error);
  }
};

const createSection = async () => {
  if (!sectionFormValid.value) return;
  try {
    const sectionData = {
      course: sectionForm.value.courseId,
      academic_term: sectionForm.value.termId,
      section_number: sectionForm.value.section_number,
      capacity: sectionForm.value.capacity
    };
    
    await sectionStore.createSection(sectionData);
    
    // Reset form
    sectionForm.value = {
      courseId: 0,
      termId: 0,
      section_number: '',
      capacity: 30
    };
  } catch (error) {
    console.error('Error creating section:', error);
  }
};

const emit = defineEmits<{
  (e: 'step-completed', stepId: string): void;
  (e: 'step-error', error: Error): void;
}>();

const completeStep = () => {
  if (canCompleteStep.value) {
    emit('step-completed', 'student-enrollment');
  }
};

// Load initial data
const loadInitialData = async () => {
  try {
    await Promise.all([
      departmentStore.fetchDepartments(),
      studentStore.fetchStudents(),
      courseStore.fetchCourses(),
      termStore.fetchTerms(),
      enrollmentStore.fetchEnrollments(),
      sectionStore.fetchSections()
    ]);
    
    departments.value = departmentStore.items;
    courses.value = courseStore.items;
    terms.value = termStore.terms;
  } catch (error) {
    console.error('Error loading initial data:', error);
    // You might want to show this error to the user
  }
};

// Load data on component mount
onMounted(() => {
  loadInitialData();
});
</script>

<style scoped>
.student-enrollment-step {
  transition: all 0.3s ease;
}

.v-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style> 