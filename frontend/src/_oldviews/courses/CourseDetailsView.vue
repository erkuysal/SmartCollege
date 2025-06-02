<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCourseStore } from '../../utils/stores/college/courseStore';
import { getNavItemColor } from '../../utils/navigation';
import { DAY_OF_WEEK } from '../../utils/interfaces/college/scheduleInterface';
import type { Course, CourseSchedule, CourseEnrollment } from '../../utils/interfaces/college/courseInterface';

const route = useRoute();
const router = useRouter();
const courseStore = useCourseStore();
const courseColor = getNavItemColor('Courses');

// Course ID from route params
const courseId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? parseInt(id, 10) : (typeof id === 'number' ? id : 0);
});

// Loading state and error handling
const loading = ref(false);
const error = ref('');
const schedulesLoading = ref(false);
const enrollmentsLoading = ref(false);

// Computed property for course data and related information
const course = computed(() => courseStore.selectedItem);
const schedules = computed(() => courseStore.schedules);
const enrollments = computed(() => courseStore.enrollments);

// Add a debugging flag that can be toggled
const showDebugInfo = ref(false);

// Toggle debug information
const toggleDebugInfo = () => {
  showDebugInfo.value = !showDebugInfo.value;
};

// Load course data
const loadCourseData = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await courseStore.fetchCourseById(courseId.value);
    if (!courseStore.selectedItem) {
      error.value = `Course with ID ${courseId.value} not found`;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
};

// Load course schedules
const loadSchedules = async () => {
  schedulesLoading.value = true;
  
  try {
    await courseStore.fetchCourseSchedules(courseId.value);
    console.log('Schedule data loaded:', courseStore.schedules);
  } catch (err) {
    console.error('Error loading schedules:', err);
  } finally {
    schedulesLoading.value = false;
  }
};

// Load course enrollments
const loadEnrollments = async () => {
  enrollmentsLoading.value = true;
  
  try {
    await courseStore.fetchCourseEnrollments(courseId.value);
    console.log('Enrollment data loaded:', courseStore.enrollments);
  } catch (err) {
    console.error('Error loading enrollments:', err);
  } finally {
    enrollmentsLoading.value = false;
  }
};

// Handle edit button click
const handleEdit = () => {
  router.push(`/dashboard/courses/edit/${courseId.value}`);
};

// Handle back button click
const handleBack = () => {
  router.push('/dashboard/courses');
};

// Format date
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Invalid Date';
  
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (err) {
    console.error('Error formatting date:', err);
    return 'Invalid Date';
  }
};

// Get day of week as string
const getDayOfWeek = (day: number) => {
  if (!day && day !== 0) return 'Not specified';
  
  // First handle raw numeric values (most common response from API)
  if (day === 0) return 'Sunday';
  if (day === 1) return 'Monday';
  if (day === 2) return 'Tuesday';
  if (day === 3) return 'Wednesday';
  if (day === 4) return 'Thursday';
  if (day === 5) return 'Friday';
  if (day === 6) return 'Saturday';
  if (day === 7) return 'Sunday';
  
  // Using the enum as backup if indexing doesn't match server values
  switch (day) {
    case DAY_OF_WEEK.MONDAY: return 'Monday';
    case DAY_OF_WEEK.TUESDAY: return 'Tuesday';
    case DAY_OF_WEEK.WEDNESDAY: return 'Wednesday';
    case DAY_OF_WEEK.THURSDAY: return 'Thursday';
    case DAY_OF_WEEK.FRIDAY: return 'Friday';
    case DAY_OF_WEEK.SATURDAY: return 'Saturday';
    case DAY_OF_WEEK.SUNDAY: return 'Sunday';
    default: return `Day ${day}`; // Show raw value as fallback
  }
};

// Format time for display
const formatTime = (timeString: string) => {
  if (!timeString) return 'Not specified';
  
  try {
    // Parse HH:MM:SS format to 12-hour format with AM/PM
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const amPm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Convert 0 to 12
    return `${hour12}:${minutes} ${amPm}`;
  } catch (err) {
    console.error('Error formatting time:', err);
    return timeString;
  }
};

// Safe access to object properties with type checking
const getPropertySafely = <T, K extends string>(obj: any, key: K): T | undefined => {
  if (obj && typeof obj === 'object' && key in obj) {
    return obj[key] as T;
  }
  return undefined;
};

// Get classroom information
const getClassroomInfo = (classroom: any): string => {
  if (classroom && typeof classroom === 'object') {
    return getPropertySafely<string, 'name'>(classroom, 'name') || 
           `Classroom ID: ${getPropertySafely<number, 'id'>(classroom, 'id') || 'Unknown'}`;
  } else if (typeof classroom === 'number') {
    return `Classroom ID: ${classroom}`;
  }
  return 'Not assigned';
};

// Add this helper function to safely split and process text
const safeTextProcess = (text: string | undefined, index: number = 0): string => {
  if (!text) return 'Not specified';
  const parts = text.split(' ');
  return parts[index] || 'Not specified';
};

const safeTimeProcess = (text: string | undefined): string => {
  if (!text) return 'Not specified';
  const parts = text.split(' ');
  if (parts.length <= 1) return 'Not specified';
  return parts.slice(1).join(' ') || 'Not specified';
};

// Load data on component mount
onMounted(() => {
  loadCourseData();
  loadSchedules();
  loadEnrollments();
});

// Add to the top with other refs
const debugTab = ref('firstItem');

// Add to the script section at the top with other data properties
const showEnrollmentDebug = ref(false);

// Toggle enrollment debug data
const toggleEnrollmentDebug = () => {
  showEnrollmentDebug.value = !showEnrollmentDebug.value;
};

// Helper functions for student data display
const getInitials = (student: any): string => {
  if (!student) return '?';
  
  if (typeof student === 'object') {
    const firstName = getPropertySafely<string, 'first_name'>(student, 'first_name') || '';
    const lastName = getPropertySafely<string, 'last_name'>(student, 'last_name') || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
  }
  
  return '#';
};

const getStudentName = (student: any): string => {
  if (!student) return 'Unknown Student';
  
  if (typeof student === 'object') {
    const firstName = getPropertySafely<string, 'first_name'>(student, 'first_name') || '';
    const lastName = getPropertySafely<string, 'last_name'>(student, 'last_name') || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    }
  }
  
  return `Student ID: ${student}`;
};

// Get student number (with proper formatting)
const getStudentNumber = (student: any): string => {
  if (!student) return '';
  
  if (typeof student === 'object') {
    // First try to get student_number which should be in the format S20250001
    const studentNumber = getPropertySafely<string, 'student_number'>(student, 'student_number');
    if (studentNumber) {
      return studentNumber;
    }
    
    // If there's a number but not in proper format, use it
    const idNumber = getPropertySafely<string|number, 'id'>(student, 'id');
    if (idNumber) {
      // Format numeric IDs with proper formatting (S + current year + padded number)
      if (typeof idNumber === 'number') {
        const year = new Date().getFullYear();
        return `S${year}${idNumber.toString().padStart(4, '0')}`;
      }
      return `ID: ${idNumber}`;
    }
  }
  
  // For numeric student values, create a formatted student number
  if (typeof student === 'number') {
    const year = new Date().getFullYear();
    return `S${year}${student.toString().padStart(4, '0')}`;
  }
  
  return `ID: ${student}`;
};

// Add to the script section at the top with other data properties
const enrollmentDebugTab = ref('firstItem');
</script>

<template>
  <div class="course-details">
    <!-- Error message -->
    <v-alert v-if="error" type="error" class="mb-4">
      {{ error }}
      <div class="mt-2">
        <v-btn color="white" variant="text" @click="handleBack">
          Back to Courses
        </v-btn>
      </div>
    </v-alert>
    
    <!-- Loading state -->
    <v-skeleton-loader
      v-if="loading && !error"
      type="card, list-item-three-line, divider, table"
      class="mx-auto"
    ></v-skeleton-loader>
    
    <!-- Course details -->
    <div v-else-if="course && !error">
      <!-- Header with back button -->
      <div class="d-flex align-center mb-4">
        <v-btn
          icon
          class="mr-2"
          @click="handleBack"
          title="Back to courses"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h1 class="text-h4 mb-0">Course Details</h1>
        <v-spacer></v-spacer>
        <v-btn
          :color="courseColor"
          @click="handleEdit"
          prepend-icon="mdi-pencil"
        >
          Edit Course
        </v-btn>
      </div>
      
      <v-row>
        <!-- Basic information -->
        <v-col cols="12" md="6">
          <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
              <v-icon
                :color="courseColor"
                class="mr-2"
                icon="mdi-book-open-page-variant"
                size="large"
              ></v-icon>
              <div>
                <span class="text-h5">{{ course.name }}</span>
                <span class="text-subtitle-1 ml-2">({{ course.code }})</span>
                <v-chip
                  class="ml-2"
                  :color="course.is_active ? 'success' : 'error'"
                  size="small"
                >
                  {{ course.is_active ? 'ACTIVE' : 'INACTIVE' }}
                </v-chip>
              </div>
            </v-card-title>
            
            <v-card-text>
              <v-list>
                <v-list-item v-if="course.department">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-domain" class="mr-2"></v-icon>
                  </template>
                  <v-list-item-title>Department</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ typeof course.department === 'object' 
                      ? getPropertySafely(course.department, 'name') || `Department ID: ${getPropertySafely(course.department, 'id')}`
                      : `Department ID: ${course.department}` }}
                  </v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-school" class="mr-2"></v-icon>
                  </template>
                  <v-list-item-title>Credits</v-list-item-title>
                  <v-list-item-subtitle>{{ course.credits }} credits</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item v-if="course.description">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-information" class="mr-2"></v-icon>
                  </template>
                  <v-list-item-title>Description</v-list-item-title>
                  <v-list-item-subtitle>{{ course.description }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item v-if="course.prerequisites && course.prerequisites.length > 0">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-lightning-bolt" class="mr-2"></v-icon>
                  </template>
                  <v-list-item-title>Prerequisites</v-list-item-title>
                  <v-list-item-subtitle>
                    <div v-if="Array.isArray(course.prerequisites) && course.prerequisites.length > 0 && 
                         typeof course.prerequisites[0] === 'object'">
                      <v-chip-group>
                        <v-chip v-for="(prereq, idx) in course.prerequisites" :key="idx" size="small">
                          {{ getPropertySafely(prereq, 'code') || 'No code' }}: {{ getPropertySafely(prereq, 'name') || 'No name' }}
                        </v-chip>
                      </v-chip-group>
                    </div>
                    <div v-else>
                      <span>{{ course.prerequisites.length }} prerequisite(s)</span>
                    </div>
                  </v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-calendar" class="mr-2"></v-icon>
                  </template>
                  <v-list-item-title>Created</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(course.created_at) }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-update" class="mr-2"></v-icon>
                  </template>
                  <v-list-item-title>Last Updated</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(course.updated_at) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
        
        <!-- Schedule information -->
        <v-col cols="12" md="6">
          <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
              <v-icon
                :color="courseColor"
                class="mr-2"
                icon="mdi-calendar-clock"
                size="large"
              ></v-icon>
              <span class="text-h5">Course Schedule</span>
            </v-card-title>
            
            <v-card-text>
              <v-progress-circular
                v-if="schedulesLoading"
                indeterminate
                :color="courseColor"
                class="ma-4"
              ></v-progress-circular>
              
              <div v-else-if="schedules.length === 0" class="text-center pa-4">
                <p class="text-subtitle-1">No schedules found for this course.</p>
                <v-btn
                  :color="courseColor"
                  variant="outlined"
                  class="mt-2"
                  @click="loadSchedules"
                  prepend-icon="mdi-refresh"
                  size="small"
                >
                  Refresh
                </v-btn>
              </div>
              
              <v-table v-else>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Classroom</th>
                    <th>Semester</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="schedule in schedules" :key="schedule.id">
                    <td>
                      <template v-if="'day_of_week' in schedule">
                        {{ getDayOfWeek(schedule.day_of_week) }}
                      </template>
                      <template v-else-if="'time_slot_display' in schedule">
                        {{ safeTextProcess(getPropertySafely<string, 'time_slot_display'>(schedule, 'time_slot_display')) }}
                      </template>
                      <template v-else>
                        Not specified
                      </template>
                    </td>
                    <td>
                      <template v-if="'start_time' in schedule && 'end_time' in schedule">
                        {{ formatTime(schedule.start_time) }} - {{ formatTime(schedule.end_time) }}
                      </template>
                      <template v-else-if="'time_slot_display' in schedule">
                        {{ safeTimeProcess(getPropertySafely<string, 'time_slot_display'>(schedule, 'time_slot_display')) }}
                      </template>
                      <template v-else>
                        Not specified
                      </template>
                    </td>
                    <td>{{ getClassroomInfo(schedule.classroom) }}</td>
                    <td>{{ schedule.semester || 'Current' }}</td>
                  </tr>
                </tbody>
              </v-table>
              
              <!-- Add this after the schedule table but before the end of the v-card-text -->
              <div v-if="schedules.length > 0" class="mt-4">
                <v-divider></v-divider>
                <div class="d-flex align-center mt-2">
                  <v-btn
                    size="small"
                    variant="text"
                    :color="courseColor"
                    @click="toggleDebugInfo"
                    class="text-caption"
                  >
                    {{ showDebugInfo ? 'Hide' : 'Show' }} Raw Data
                  </v-btn>
                  <v-spacer></v-spacer>
                  <div class="text-caption text-grey">
                    Found {{ schedules.length }} schedule(s)
                  </div>
                </div>
                
                <div v-if="showDebugInfo" class="mt-2 pa-2 bg-grey-lighten-4 rounded">
                  <v-tabs v-model="debugTab" class="mb-2">
                    <v-tab value="firstItem">First Item</v-tab>
                    <v-tab value="fullArray">Full Array</v-tab>
                  </v-tabs>
                  
                  <v-window v-model="debugTab">
                    <v-window-item value="firstItem">
                      <pre class="text-caption">{{ JSON.stringify(schedules[0], null, 2) }}</pre>
                    </v-window-item>
                    <v-window-item value="fullArray">
                      <pre class="text-caption">{{ JSON.stringify(schedules, null, 2) }}</pre>
                    </v-window-item>
                  </v-window>
                </div>
              </div>
            </v-card-text>
          </v-card>
          
          <!-- Enrollments -->
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon
                :color="courseColor"
                class="mr-2"
                icon="mdi-account-group"
                size="large"
              ></v-icon>
              <span class="text-h5">Enrolled Students</span>
              <v-spacer></v-spacer>
              <span class="text-caption text-grey">{{ enrollments.length }} student(s)</span>
            </v-card-title>
            
            <v-card-text>
              <v-progress-circular
                v-if="enrollmentsLoading"
                indeterminate
                :color="courseColor"
                class="ma-4"
              ></v-progress-circular>
              
              <div v-else-if="enrollments.length === 0" class="text-center pa-4">
                <p class="text-subtitle-1">No students enrolled in this course.</p>
                <v-btn
                  :color="courseColor"
                  variant="outlined"
                  class="mt-2"
                  @click="loadEnrollments"
                  prepend-icon="mdi-refresh"
                  size="small"
                >
                  Refresh
                </v-btn>
              </div>
              
              <v-table v-else>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Enrollment Date</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="enrollment in enrollments" :key="enrollment.id">
                    <td>
                      <div class="d-flex align-center">
                        <v-avatar size="36" class="mr-2" color="primary">
                          <span class="text-h6 text-white">
                            {{ getInitials(enrollment.student) }}
                          </span>
                        </v-avatar>
                        <div>
                          <div class="font-weight-medium">
                            {{ getStudentName(enrollment.student) }}
                          </div>
                          <div class="text-caption text-grey">
                            {{ getStudentNumber(enrollment.student) }}
                            <span v-if="enrollment.student_name && 
                                        enrollment.student_name !== getStudentName(enrollment.student)" 
                                  class="ml-1">
                              ({{ enrollment.student_name }})
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <v-chip
                        :color="enrollment.status === 'active' ? 'success' : 
                               (enrollment.status === 'completed' ? 'info' : 'warning')"
                        size="small"
                      >
                        {{ enrollment.status }}
                      </v-chip>
                    </td>
                    <td>
                      {{ formatDate(enrollment.enrollment_date || enrollment.date_enrolled) }}
                    </td>
                    <td>{{ enrollment.grade || 'N/A' }}</td>
                  </tr>
                </tbody>
              </v-table>
              
              <!-- Add debug toggle for enrollment data -->
              <div v-if="enrollments.length > 0" class="mt-4">
                <v-divider></v-divider>
                <div class="d-flex align-center mt-2">
                  <v-btn
                    size="small"
                    variant="text"
                    :color="courseColor"
                    @click="toggleEnrollmentDebug"
                    class="text-caption"
                  >
                    {{ showEnrollmentDebug ? 'Hide' : 'Show' }} Raw Enrollment Data
                  </v-btn>
                </div>
                
                <div v-if="showEnrollmentDebug" class="mt-2 pa-2 bg-grey-lighten-4 rounded">
                  <v-tabs v-model="enrollmentDebugTab" class="mb-2">
                    <v-tab value="firstItem">First Enrollment</v-tab>
                    <v-tab value="studentData">Student Data</v-tab>
                    <v-tab value="fullData">All Enrollments</v-tab>
                  </v-tabs>
                  
                  <v-window v-model="enrollmentDebugTab">
                    <v-window-item value="firstItem">
                      <pre class="text-caption">{{ JSON.stringify(enrollments[0], null, 2) }}</pre>
                    </v-window-item>
                    <v-window-item value="studentData">
                      <pre class="text-caption">{{ JSON.stringify(enrollments[0]?.student, null, 2) }}</pre>
                    </v-window-item>
                    <v-window-item value="fullData">
                      <pre class="text-caption">{{ JSON.stringify(enrollments, null, 2) }}</pre>
                    </v-window-item>
                  </v-window>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style scoped>
.course-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}
</style> 