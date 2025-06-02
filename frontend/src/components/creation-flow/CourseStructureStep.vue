<template>
  <div class="course-structure-step">
    <v-row>
      <!-- Course Creation -->
      <v-col cols="12" md="6">
        <v-card class="h-100" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-book-open-page-variant</v-icon>
            Course Creation
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="createCourse" v-model="courseFormValid">
              <v-select
                v-model="courseForm.department"
                :items="departments"
                item-title="name"
                item-value="id"
                label="Select Department"
                :rules="[v => !!v || 'Department selection is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                hint="Select the department this course belongs to."
                persistent-hint
              />
              <v-text-field
                v-model="courseForm.name"
                label="Course Name"
                :rules="[v => !!v || 'Course name is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                hint="Enter the full name of the course (e.g., 'Introduction to Programming')."
                persistent-hint
              />
              <v-text-field
                v-model="courseForm.code"
                label="Course Code"
                :rules="[v => !!v || 'Course code is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                hint="Enter a unique code for the course (e.g., 'CS101')."
                persistent-hint
              />
              <v-text-field
                v-model="courseForm.credits"
                label="Credits"
                type="number"
                :rules="[v => !!v || 'Credits are required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                hint="Specify the number of credits students earn for this course."
                persistent-hint
              />
              <v-textarea
                v-model="courseForm.description"
                label="Description"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                rows="3"
                hint="Provide a brief description of the course content and objectives."
                persistent-hint
              />
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="!courseFormValid"
                block
              >
                <v-icon left>mdi-plus</v-icon>
                Create Course
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Course Package Creation -->
      <v-col cols="12" md="6">
        <v-card class="h-100" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-package-variant</v-icon>
            Course Package Creation
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="createPackage" v-model="packageFormValid">
              <v-text-field
                v-model="packageForm.name"
                label="Package Name"
                :rules="[v => !!v || 'Package name is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />
              <v-select
                v-model="packageForm.courseIds"
                :items="availableCourses"
                item-title="name"
                item-value="id"
                label="Select Courses"
                :rules="[v => v.length > 0 || 'At least one course is required']"
                variant="outlined"
                density="comfortable"
                multiple
                chips
                class="mb-4"
              />
              <v-textarea
                v-model="packageForm.description"
                label="Description"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                rows="3"
              />
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="!packageFormValid"
                block
              >
                <v-icon left>mdi-plus</v-icon>
                Create Package
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Classroom Setup -->
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-door</v-icon>
            Classroom Setup
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="createClassroom" v-model="classroomFormValid">
              <v-row>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="classroomForm.department"
                    :items="departments"
                    item-title="name"
                    item-value="id"
                    label="Select Department *"
                    :rules="[v => !!v || 'Department is required']"
                    hint="Select the department this classroom belongs to."
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="classroomForm.facility"
                    :items="facilities"
                    item-title="name"
                    item-value="id"
                    label="Select Facility *"
                    :rules="[v => !!v || 'Facility is required']"
                    hint="Select the facility/building for this classroom."
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="classroomForm.capacity"
                    label="Capacity *"
                    type="number"
                    :rules="[v => !!v || 'Capacity is required']"
                    hint="Enter the maximum number of students for this classroom."
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="classroomForm.name"
                    label="Classroom Name *"
                    :rules="[v => !!v || 'Classroom name is required']"
                    hint="Enter a unique name for this classroom."
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="classroomForm.building"
                    label="Building"
                    hint="Optional: Specify the building name."
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-switch
                    v-model="classroomForm.has_projector"
                    label="Has Projector"
                    color="primary"
                    hide-details
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-switch
                    v-model="classroomForm.has_whiteboard"
                    label="Has Whiteboard"
                    color="primary"
                    hide-details
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-switch
                    v-model="classroomForm.is_active"
                    label="Active"
                    color="primary"
                    hide-details
                    class="mb-4"
                  />
                </v-col>
              </v-row>
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="!classroomFormValid"
                block
                class="mt-4"
              >
                <v-icon left>mdi-plus</v-icon>
                Create Classroom
              </v-btn>
            </v-form>
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
                    <div class="text-h4 mb-2">{{ courses.length }}</div>
                    <div class="text-subtitle-1">Courses Created</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="tonal" color="primary" class="text-center">
                  <v-card-text>
                    <div class="text-h4 mb-2">{{ packages.length }}</div>
                    <div class="text-subtitle-1">Course Packages</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="tonal" color="primary" class="text-center">
                  <v-card-text>
                    <div class="text-h4 mb-2">{{ classrooms.length }}</div>
                    <div class="text-subtitle-1">Classrooms Setup</div>
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
              Complete Course Structure Setup
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Facility Creation -->
      <v-col cols="12">
        <v-card elevation="2" class="mb-6">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-office-building</v-icon>
            Facility Creation
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="createFacility" v-model="facilityFormValid">
              <v-row>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="facilityForm.name"
                    label="Facility Name *"
                    :rules="[v => !!v || 'Name is required']"
                    variant="outlined"
                    density="comfortable"
                    class="mb-4"
                    hint="Enter a unique name for the facility."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="facilityForm.type"
                    :items="FACILITY_TYPE_CHOICES"
                    item-title="text"
                    item-value="value"
                    label="Type *"
                    :rules="[v => !!v || 'Type is required']"
                    variant="outlined"
                    density="comfortable"
                    class="mb-4"
                    hint="Select the type of facility."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="facilityForm.location"
                    label="Location"
                    variant="outlined"
                    density="comfortable"
                    class="mb-4"
                    hint="Optional: Specify the location."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="facilityForm.capacity"
                    label="Capacity"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="comfortable"
                    class="mb-4"
                    hint="Optional: Maximum capacity."
                    persistent-hint
                  />
                </v-col>
              </v-row>
              <v-alert v-if="facilityFormError" type="error" class="mb-2">{{ facilityFormError }}</v-alert>
              <v-btn
                type="submit"
                color="primary"
                :loading="facilityStore.loading"
                :disabled="!facilityFormValid"
              >
                <v-icon left>mdi-plus</v-icon>
                Create Facility
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCourseStore } from '@/utils/stores/college/courseStore';
import { useClassroomStore } from '@/utils/stores/college/classroomStore';
import { useDepartmentStore } from '@/utils/stores/college/departmentStore';
import { useFacilityStore } from '@/utils/stores/college/facultyStore';
import type { Course } from '@/utils/interfaces/college/courseInterface';
import type { Classroom } from '@/utils/interfaces/college/classroomInterface';

// Interfaces
interface CoursePackage {
  id: number;
  name: string;
  courseIds: number[];
  description: string;
}

// Store initialization
const courseStore = useCourseStore();
const classroomStore = useClassroomStore();
const departmentStore = useDepartmentStore();
const facilityStore = useFacilityStore();

// Form validation
const courseFormValid = ref(false);
const packageFormValid = ref(false);
const classroomFormValid = ref(false);
const facilityFormValid = ref(false);

// Form data
const courseForm = ref<Partial<Course>>({
  department: undefined,
  name: '',
  code: '',
  credits: undefined,
  description: '',
  is_active: true
});

const packageForm = ref({
  name: '',
  courseIds: [],
  description: ''
});

const classroomForm = ref({
  name: '',
  building: '',
  room_number: '',
  capacity: undefined as number | undefined,
  has_projector: false,
  has_whiteboard: false,
  is_active: true,
  department: undefined as number | undefined,
  facility: undefined as number | undefined,
  notes: '',
  department_name: '',
  facility_name: '',
  is_in_use: false,
  type: '',
  features: ''
});

const facilityForm = ref({
  name: '',
  type: '',
  location: '',
  capacity: undefined as number | undefined
});

// Data storage
const packages = ref<CoursePackage[]>([]);
const departments = computed(() => departmentStore.items);

// Constants
const classroomTypes = [
  'Lecture Hall',
  'Seminar Room',
  'Laboratory',
  'Computer Lab',
  'Studio',
  'Workshop'
];

const FACILITY_TYPE_CHOICES = [
  { value: 'Lab', text: 'Laboratory' },
  { value: 'Lecture Hall', text: 'Lecture Hall' },
  { value: 'Library', text: 'Library' },
  { value: 'Cafeteria', text: 'Cafeteria' },
  { value: 'Amphitheater', text: 'Amphitheater' },
  { value: 'Hostel', text: 'Hostel' },
  { value: 'Sports Center', text: 'Sports Center' },
  { value: 'Other', text: 'Other' }
];

// Computed properties
const courses = computed(() => courseStore.items as Course[]);
const classrooms = computed(() => classroomStore.classrooms as Classroom[]);
const loading = computed(() => courseStore.loading || classroomStore.loading);

const availableCourses = computed(() => {
  return courses.value;
});

const canCompleteStep = computed(() => {
  return courses.value.length > 0 && 
         packages.value.length > 0 && 
         classrooms.value.length > 0;
});

const facilities = computed(() => facilityStore.items);

const facilityFormError = ref('');

// Methods
const createCourse = async () => {
  if (!courseFormValid.value) return;
  
  try {
    if (courseForm.value.department === undefined || !courseForm.value.credits) {
      throw new Error('Department and credits are required');
    }

    const courseData = {
      ...courseForm.value,
      credits: parseInt(courseForm.value.credits.toString())
    };
    
    await courseStore.createCourse(courseData);
    courseForm.value = {
      department: undefined,
      name: '',
      code: '',
      credits: undefined,
      description: '',
      is_active: true
    };
  } catch (error) {
    console.error('Error creating course:', error);
  }
};

const createPackage = async () => {
  if (!packageFormValid.value) return;
  
  try {
    // API call to create package
    const response = await fetch('/api/course-packages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(packageForm.value)
    });
    
    if (response.ok) {
      const coursePackage = await response.json() as CoursePackage;
      packages.value.push(coursePackage);
      packageForm.value = {
        name: '',
        courseIds: [],
        description: ''
      };
    }
  } catch (error) {
    console.error('Error creating course package:', error);
  }
};

const createClassroom = async () => {
  if (!classroomFormValid.value) return;
  try {
    if (!classroomForm.value.department || !classroomForm.value.facility || !classroomForm.value.capacity) {
      throw new Error('Department, facility, and capacity are required');
    }
    const classroomData = {
      name: classroomForm.value.name,
      building: classroomForm.value.building,
      capacity: parseInt(classroomForm.value.capacity.toString()),
      has_projector: classroomForm.value.has_projector,
      has_whiteboard: classroomForm.value.has_whiteboard,
      is_active: classroomForm.value.is_active,
      department: classroomForm.value.department,
      facility: classroomForm.value.facility
    };
    await classroomStore.createClassroom(classroomData);
    classroomForm.value = {
      name: '',
      building: '',
      room_number: '',
      capacity: undefined,
      has_projector: false,
      has_whiteboard: false,
      is_active: true,
      department: undefined,
      facility: undefined,
      notes: '',
      department_name: '',
      facility_name: '',
      is_in_use: false,
      type: '',
      features: ''
    };
  } catch (error) {
    console.error('Error creating classroom:', error);
  }
};

const createFacility = async () => {
  facilityFormError.value = '';
  if (!facilityFormValid.value) return;
  try {
    const payload: any = {
      name: facilityForm.value.name,
      type: facilityForm.value.type,
      is_active: true,
      location: facilityForm.value.location || null
    };
    if (
      facilityForm.value.capacity !== undefined &&
      facilityForm.value.capacity !== null &&
      !isNaN(Number(facilityForm.value.capacity))
    ) {
      payload.capacity = parseInt(facilityForm.value.capacity.toString());
    }
    await facilityStore.createFacility(payload);
    facilityForm.value = { name: '', type: '', location: '', capacity: undefined };
    await facilityStore.fetchFacilities();
  } catch (error: any) {
    facilityFormError.value = error?.response?.data?.detail || error?.message || 'Failed to create facility.';
    console.error('Error creating facility:', error);
  }
};

const emit = defineEmits<{
  (e: 'step-completed', stepId: string): void;
  (e: 'step-error', error: Error): void;
}>();

const completeStep = () => {
  if (canCompleteStep.value) {
    emit('step-completed', 'course-structure');
  }
};

// Load initial data
const loadInitialData = async () => {
  try {
    // Load departments using store
    await departmentStore.fetchDepartments();

    // Load courses using store
    await courseStore.fetchCourses();

    // Load packages
    const packagesResponse = await fetch('/api/course-packages');
    if (packagesResponse.ok) {
      packages.value = await packagesResponse.json() as CoursePackage[];
    }

    // Load classrooms using store
    await classroomStore.fetchClassrooms();
  } catch (error) {
    console.error('Error loading initial data:', error);
  }
};

// Load data on component mount
onMounted(() => {
  loadInitialData();
  facilityStore.fetchFacilities();
});
</script>

<style scoped>
.course-structure-step {
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