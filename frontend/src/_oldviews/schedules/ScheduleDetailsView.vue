<template>
  <div class="schedule-details-view">
    <PageHeader
      title="Schedule Details"
      subtitle="View and manage class schedule information"
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
          <v-card>
            <v-card-title class="d-flex align-center py-3 px-4 bg-primary text-white">
              <span>Schedule Information</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" sm="6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Section</h3>
                  <p class="text-body-1">{{ schedule.section_name }}</p>
                  <p class="text-caption text-medium-emphasis">{{ schedule.course_name }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Classroom</h3>
                  <p class="text-body-1">{{ schedule.classroom_name }}</p>
                </v-col>
              </v-row>

              <v-divider class="my-4"></v-divider>

              <v-row>
                <v-col cols="12" sm="6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Time Slot</h3>
                  <v-chip
                    color="primary"
                    size="small"
                    variant="outlined"
                    class="mr-2"
                  >
                    {{ schedule.time_slot_display }}
                  </v-chip>
                </v-col>
                <v-col cols="12" sm="6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Status</h3>
                  <v-chip
                    :color="schedule.is_active ? 'success' : 'error'"
                    size="small"
                  >
                    {{ schedule.is_active ? 'Active' : 'Inactive' }}
                  </v-chip>
                </v-col>
              </v-row>

              <v-divider class="my-4"></v-divider>

              <v-row v-if="schedule.notes">
                <v-col cols="12">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Notes</h3>
                  <p class="text-body-2">{{ schedule.notes }}</p>
                </v-col>
              </v-row>
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
                  title="Edit Schedule"
                  @click="editSchedule"
                  class="mb-2"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-calendar-edit"
                  title="Change Time Slot"
                  @click="changeTimeSlot"
                  class="mb-2"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-toggle-switch"
                  :title="schedule.is_active ? 'Deactivate Schedule' : 'Activate Schedule'"
                  @click="toggleStatus"
                  class="mb-2"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-delete"
                  title="Delete Schedule"
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
                  :title="`View Enrolled Students (${enrolledCount})`"
                  :to="{ name: 'enrollments', query: { section: schedule.section } }"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-book-multiple"
                  title="View Course Details"
                  :to="{ name: 'course-details', params: { id: courseId } }"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-door-open"
                  title="View Classroom Details"
                  :to="{ name: 'classroom-details', params: { id: schedule.classroom } }"
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
          Edit Schedule
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="form" @submit.prevent="saveSchedule">
            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="editedItem.is_active"
                  label="Schedule Active"
                  color="success"
                ></v-switch>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.notes"
                  label="Notes"
                  variant="outlined"
                  rows="3"
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
            @click="saveSchedule"
            :loading="saveLoading"
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
          Are you sure you want to delete this schedule?
          <div class="mt-3 pa-3 bg-error-lighten-5 rounded">
            <p><strong>Section:</strong> {{ schedule.section_name }}</p>
            <p><strong>Time Slot:</strong> {{ schedule.time_slot_display }}</p>
            <p><strong>Classroom:</strong> {{ schedule.classroom_name }}</p>
          </div>
          <p class="mt-3 text-caption text-medium-emphasis">
            This will permanently remove the schedule from the system.
            Any students enrolled in this section will still be enrolled, but the schedule will be removed.
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
            @click="deleteSchedule"
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

// Route and Router
const route = useRoute();
const router = useRouter();

// Data
const scheduleId = computed(() => route.params.id as string);
const isLoading = ref(true);
const schedule = ref({
  id: 0,
  classroom: 0,
  classroom_name: '',
  section: 0,
  section_name: '',
  course_name: '',
  time_slot: 0,
  time_slot_display: '',
  is_active: true,
  notes: ''
});
const courseId = computed(() => 1); // This would be derived from the section in a real implementation
const enrolledCount = ref(0);

// Edit Dialog
const editDialog = ref(false);
const saveLoading = ref(false);
const editedItem = ref({
  is_active: true,
  notes: ''
});

// Delete Dialog
const deleteDialog = ref(false);
const deleteLoading = ref(false);

// Header Actions
const headerActions = [
  {
    icon: 'mdi-arrow-left',
    text: 'Back to Schedules',
    handler: () => router.push({ name: 'schedules' })
  },
  {
    icon: 'mdi-pencil',
    text: 'Edit',
    color: 'primary',
    handler: editSchedule
  }
];

// Lifecycle Hooks
onMounted(async () => {
  await fetchSchedule();
  await fetchEnrolledCount();
});

// Methods
async function fetchSchedule() {
  isLoading.value = true;
  try {
    const response = await apiClient.get(`${API_ROUTES.SCHEDULES_ROUTE}${scheduleId.value}/`);
    schedule.value = response.data;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    
    // Mock data for development
    schedule.value = {
      id: Number(scheduleId.value),
      classroom: 1,
      classroom_name: "Main-001",
      section: 1,
      section_name: "SCI100 - Section A (Fall 2024-2025)",
      course_name: "Course 1 in Computer Science",
      time_slot: 1,
      time_slot_display: "Monday 08:00:00-09:30:00",
      is_active: true,
      notes: "Regular schedule for Introduction to Computer Science"
    };
  } finally {
    isLoading.value = false;
  }
}

async function fetchEnrolledCount() {
  try {
    // In a real implementation, this would fetch the count from the API
    // const response = await apiClient.get(`${API_ROUTES.ENROLLMENT_ROUTE}?section=${schedule.value.section}`);
    // enrolledCount.value = response.data.count;
    
    // Mock data
    enrolledCount.value = 25;
  } catch (error) {
    console.error('Error fetching enrolled count:', error);
    enrolledCount.value = 0;
  }
}

function editSchedule() {
  editedItem.value = {
    is_active: schedule.value.is_active,
    notes: schedule.value.notes
  };
  editDialog.value = true;
}

async function saveSchedule() {
  saveLoading.value = true;
  
  try {
    await apiClient.patch(`${API_ROUTES.SCHEDULES_ROUTE}${scheduleId.value}/`, {
      is_active: editedItem.value.is_active,
      notes: editedItem.value.notes
    });
    
    // Update local data
    schedule.value.is_active = editedItem.value.is_active;
    schedule.value.notes = editedItem.value.notes;
    
    editDialog.value = false;
  } catch (error) {
    console.error('Error saving schedule:', error);
  } finally {
    saveLoading.value = false;
  }
}

function confirmDelete() {
  deleteDialog.value = true;
}

async function deleteSchedule() {
  deleteLoading.value = true;
  
  try {
    await apiClient.delete(`${API_ROUTES.SCHEDULES_ROUTE}${scheduleId.value}/`);
    router.push({ name: 'schedules' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
  } finally {
    deleteLoading.value = false;
  }
}

async function changeTimeSlot() {
  // This would be implemented with a dialog to select a new time slot
  console.log('Change time slot');
}

async function toggleStatus() {
  editedItem.value = {
    is_active: !schedule.value.is_active,
    notes: schedule.value.notes
  };
  saveSchedule();
}
</script>

<style scoped>
.schedule-details-view {
  min-height: calc(100vh - 120px);
}
</style> 