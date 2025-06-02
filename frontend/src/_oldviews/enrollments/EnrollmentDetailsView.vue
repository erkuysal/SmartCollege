<template>
  <div class="enrollment-details-view">
    <PageHeader
      title="Enrollment Details"
      subtitle="View and manage student enrollment information"
      :actions="headerActions"
    />

    <v-row v-if="isLoading">
      <v-col cols="12" class="d-flex justify-center py-12">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </v-col>
    </v-row>

    <template v-else>
      <v-row>
        <v-col cols="12" md="8">
          <v-card class="mb-4">
            <v-card-title class="d-flex align-center py-3 px-4 bg-primary text-white">
              <span>Enrollment Information</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" sm="6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Student</h3>
                  <div class="d-flex align-center">
                    <v-avatar color="primary" size="32" class="mr-2">
                      <span class="text-subtitle-2 font-weight-medium text-white">
                        {{ enrollment.student_name.charAt(0) }}
                      </span>
                    </v-avatar>
                    <router-link 
                      :to="{ name: 'student-details', params: { id: enrollment.student } }"
                      class="text-decoration-none font-weight-medium"
                    >
                      {{ enrollment.student_name }}
                    </router-link>
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Course Section</h3>
                  <p class="text-body-1">{{ sectionData.name || 'Unknown Section' }}</p>
                </v-col>
              </v-row>

              <v-divider class="my-4"></v-divider>

              <v-row>
                <v-col cols="12" sm="6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Enrollment Status</h3>
                  <div class="d-flex align-center">
                    <v-chip
                      :color="getStatusColor(enrollment.status)"
                      size="small"
                      class="text-capitalize mr-2"
                    >
                      {{ enrollment.status }}
                    </v-chip>
                    <v-icon 
                      :color="getStatusColor(enrollment.status)" 
                      :icon="getStatusIcon(enrollment.status)"
                      class="ml-1"
                    ></v-icon>
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Date Enrolled</h3>
                  <p class="text-body-1">{{ formatDate(enrollment.date_enrolled) }}</p>
                </v-col>
              </v-row>

              <v-divider class="my-4"></v-divider>

              <v-row v-if="enrollment.grade !== null">
                <v-col cols="12" sm="6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Grade</h3>
                  <v-chip
                    color="info"
                    size="small"
                  >
                    {{ enrollment.grade }}
                  </v-chip>
                </v-col>
              </v-row>

              <v-row v-if="enrollment.notes">
                <v-col cols="12">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Notes</h3>
                  <p class="text-body-2">{{ enrollment.notes }}</p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card>
            <v-card-title class="d-flex align-center py-3 px-4 bg-primary-lighten-1 text-white">
              <span>Status History</span>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                color="white"
                size="small"
                @click="updateEnrollmentStatus"
              >
                Update Status
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-timeline align="start" line-thickness="thin" line-color="grey-lighten-1">
                <v-timeline-item
                  v-for="(status, index) in statusHistory"
                  :key="index"
                  :dot-color="getStatusColor(status.status)"
                  size="small"
                  class="pb-4"
                >
                  <template v-slot:opposite>
                    <div class="text-caption">
                      {{ formatDate(status.date) }}
                    </div>
                  </template>
                  <div class="d-flex flex-column">
                    <span class="text-subtitle-2 font-weight-medium">
                      {{ status.status.charAt(0).toUpperCase() + status.status.slice(1) }}
                    </span>
                    <span class="text-caption" v-if="status.notes">
                      {{ status.notes }}
                    </span>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-title class="d-flex align-center py-3 px-4 bg-info text-white">
              <span>Actions</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-list>
                <v-list-item
                  prepend-icon="mdi-pencil"
                  title="Edit Enrollment"
                  @click="editEnrollment"
                  class="mb-2"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-clipboard-edit"
                  title="Update Grade"
                  @click="updateGrade"
                  class="mb-2"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-clipboard-text-clock"
                  title="Update Status"
                  @click="updateEnrollmentStatus"
                  class="mb-2"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-delete"
                  title="Delete Enrollment"
                  color="error"
                  @click="confirmDelete"
                ></v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <v-card class="mt-4">
            <v-card-title class="d-flex align-center py-3 px-4 bg-primary-lighten-1 text-white">
              <span>Related Information</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-list>
                <v-list-item
                  prepend-icon="mdi-account-school"
                  title="View Student Profile"
                  :to="{ name: 'student-details', params: { id: enrollment.student } }"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-book-open-page-variant"
                  title="View Course Details"
                  :to="{ name: 'course-details', params: { id: sectionData.course_id } }"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-calendar-clock"
                  title="View Schedule"
                  :to="{ name: 'schedules', query: { section: enrollment.section } }"
                ></v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5 bg-primary text-white py-3 px-4">
          Update Enrollment Status
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="form" @submit.prevent="saveEnrollment">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.status"
                  label="Status"
                  :items="statusOptions"
                  variant="outlined"
                  :rules="[v => !!v || 'Status is required']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.notes"
                  label="Notes"
                  variant="outlined"
                  rows="3"
                  placeholder="Reason for status change"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="editDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveEnrollment"
            :loading="saveLoading"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Grade Dialog -->
    <v-dialog v-model="gradeDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 bg-primary text-white py-3 px-4">
          Update Grade
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="gradeForm" @submit.prevent="saveGrade">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="gradeItem.grade"
                  label="Grade"
                  variant="outlined"
                  placeholder="e.g. A, B+, 98, etc."
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="gradeItem.notes"
                  label="Notes"
                  variant="outlined"
                  rows="3"
                  placeholder="Additional notes about the grade"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="gradeDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveGrade"
            :loading="gradeLoading"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 bg-error text-white py-3 px-4">
          Confirm Deletion
        </v-card-title>
        <v-card-text class="pa-4 pt-6">
          Are you sure you want to delete this enrollment record?
          <div class="mt-3 pa-3 bg-error-lighten-5 rounded">
            <p><strong>Student:</strong> {{ enrollment.student_name }}</p>
            <p><strong>Course:</strong> {{ sectionData.name }}</p>
            <p><strong>Status:</strong> {{ enrollment.status }}</p>
          </div>
          <p class="mt-3 text-caption text-medium-emphasis">
            This will permanently remove this student's enrollment from the system.
            This action cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            @click="deleteEnrollment"
            :loading="deleteLoading"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageHeader from '@/views/components/PageHeader.vue';
import apiClient from '@/utils/apiClient';
import { API_ROUTES } from '@/utils/config/apiRoutes';
import { format, parseISO } from 'date-fns';

// Route and router
const route = useRoute();
const router = useRouter();

// Data
const enrollmentId = computed(() => route.params.id as string);
const isLoading = ref(true);

// Type definitions to fix linter errors
interface EnrollmentType {
  id: number | null;
  student: number | null;
  student_name: string;
  section: number | null;
  status: string;
  date_enrolled: string;
  date_status_changed: string;
  grade: string | null;
  notes: string | null;
}

interface SectionType {
  name: string;
  course_id: number | null;
}

// Initialize with type
const enrollment = ref<EnrollmentType>({
  id: null,
  student: null,
  student_name: '',
  section: null,
  status: 'registered',
  date_enrolled: '',
  date_status_changed: '',
  grade: null,
  notes: null
});

const sectionData = ref<SectionType>({
  name: '',
  course_id: null
});

// Status history
const statusHistory = ref([
  // This would be populated from the API in a real implementation
]);

// Edit Dialog
const editDialog = ref(false);
const saveLoading = ref(false);
const editedItem = ref({
  status: 'registered',
  notes: ''
});

// Grade Dialog
const gradeDialog = ref(false);
const gradeLoading = ref(false);
const gradeItem = ref({
  grade: '',
  notes: ''
});

// Delete Dialog
const deleteDialog = ref(false);
const deleteLoading = ref(false);

// Header Actions
const headerActions = [
  {
    icon: 'mdi-arrow-left',
    text: 'Back to Enrollments',
    handler: () => router.push({ name: 'enrollments' })
  },
  {
    icon: 'mdi-pencil',
    text: 'Edit',
    color: 'primary',
    handler: editEnrollment
  }
];

// Status options
const statusOptions = [
  { title: 'Registered', value: 'registered' },
  { title: 'Waitlisted', value: 'waitlisted' },
  { title: 'Dropped', value: 'dropped' }
];

// Lifecycle hooks
onMounted(async () => {
  await fetchEnrollment();
  await fetchStatusHistory();
});

// Methods
async function fetchEnrollment() {
  isLoading.value = true;
  try {
    const response = await apiClient.get(`${API_ROUTES.ENROLLMENT_ROUTE}${enrollmentId.value}/`);
    enrollment.value = response.data as EnrollmentType;
    
    // Fetch section data
    await fetchSectionData(enrollment.value.section);
  } catch (error) {
    console.error('Error fetching enrollment:', error);

    // Mock data for development
    enrollment.value = {
      id: Number(enrollmentId.value),
      student: 1,
      student_name: 'John Doe',
      section: 1485,
      status: 'registered',
      date_enrolled: '2025-04-27T11:35:57.329528Z',
      date_status_changed: '2025-04-28T11:35:57.331754Z',
      grade: null,
      notes: 'Student has requested special consideration for assignments due to medical condition.'
    };
    
    // Mock section data
    sectionData.value = {
      name: 'SCI100 - Introduction to Computer Science (Section A)',
      course_id: 1
    };
  } finally {
    isLoading.value = false;
  }
}

async function fetchSectionData(sectionId: number | null) {
  try {
    // This would fetch real section data in a complete implementation
    // const response = await apiClient.get(`${API_ROUTES.SECTIONS_ROUTE}${sectionId}/`);
    // sectionData.value = response.data;
    
    // Mock data for development
    sectionData.value = {
      name: 'SCI100 - Introduction to Computer Science (Section A)',
      course_id: 1
    };
  } catch (error) {
    console.error('Error fetching section data:', error);
  }
}

function formatDate(dateString: string) {
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch (e) {
    return dateString;
  }
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    'registered': 'success',
    'waitlisted': 'warning',
    'dropped': 'error'
  };
  return colors[status] || 'grey';
}

function getStatusIcon(status: string) {
  const icons: Record<string, string> = {
    'registered': 'mdi-check-circle',
    'waitlisted': 'mdi-clock-outline',
    'dropped': 'mdi-close-circle'
  };
  return icons[status] || 'mdi-circle';
}

function editEnrollment() {
  editedItem.value = {
    status: enrollment.value.status,
    notes: enrollment.value.notes || ''
  };
  editDialog.value = true;
}

async function saveEnrollment() {
  saveLoading.value = true;
  
  try {
    await apiClient.patch(`${API_ROUTES.ENROLLMENT_ROUTE}${enrollmentId.value}/`, {
      status: editedItem.value.status,
      notes: editedItem.value.notes
    });
    
    // Update local data
    enrollment.value.status = editedItem.value.status;
    enrollment.value.notes = editedItem.value.notes;
    enrollment.value.date_status_changed = new Date().toISOString();
    
    // Add to status history
    statusHistory.value.unshift({
      status: editedItem.value.status,
      date: new Date().toISOString(),
      notes: editedItem.value.notes
    });
    
    editDialog.value = false;
  } catch (error) {
    console.error('Error saving enrollment:', error);
  } finally {
    saveLoading.value = false;
  }
}

async function fetchStatusHistory() {
  try {
    // This would fetch real status history in a complete implementation
    // const response = await apiClient.get(`${API_ROUTES.ENROLLMENT_ROUTE}${enrollmentId.value}/history/`);
    // statusHistory.value = response.data;
    
    // Mock data for development
    statusHistory.value = [
      {
        status: enrollment.value.status,
        date: enrollment.value.date_status_changed,
        notes: 'Initial status'
      }
    ];
  } catch (error) {
    console.error('Error fetching status history:', error);
  }
}

function updateEnrollmentStatus() {
  editedItem.value = {
    status: enrollment.value.status,
    notes: enrollment.value.notes || ''
  };
  editDialog.value = true;
}

function updateGrade() {
  gradeItem.value = {
    grade: enrollment.value.grade || '',
    notes: ''
  };
  gradeDialog.value = true;
}

async function saveGrade() {
  gradeLoading.value = true;
  
  try {
    await apiClient.patch(`${API_ROUTES.ENROLLMENT_ROUTE}${enrollmentId.value}/`, {
      grade: gradeItem.value.grade
    });
    
    // Update local data
    enrollment.value.grade = gradeItem.value.grade;
    
    gradeDialog.value = false;
  } catch (error) {
    console.error('Error updating grade:', error);
  } finally {
    gradeLoading.value = false;
  }
}

function confirmDelete() {
  deleteDialog.value = true;
}

async function deleteEnrollment() {
  deleteLoading.value = true;
  
  try {
    await apiClient.delete(`${API_ROUTES.ENROLLMENT_ROUTE}${enrollmentId.value}/`);
    router.push({ name: 'enrollments' });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
  } finally {
    deleteLoading.value = false;
  }
}
</script>

<style scoped>
.enrollment-details-view {
  min-height: calc(100vh - 120px);
}
</style> 