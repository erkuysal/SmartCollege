<template>
  <div class="schedule-details-view">
    <PageHeader title="Schedule Details">
      <template #subtitle>
        {{ scheduleDetails.course_name }} - {{ scheduleDetails.time_slot_display }}
      </template>
      <div class="header-actions">
        <v-btn
          color="primary"
          icon="mdi-pencil"
          @click="editSchedule"
          title="Edit Schedule"
        />
        <v-btn
          color="error"
          icon="mdi-delete"
          @click="confirmDelete"
          title="Delete Schedule"
        />
      </div>
    </PageHeader>

    <!-- Main Content -->
    <div class="view-content">
      <!-- Loading State -->
      <v-progress-circular
        v-if="schedulesStore.isLoading"
        indeterminate
        color="primary"
        class="loading-spinner"
      />

      <!-- Error State -->
      <v-alert
        v-else-if="schedulesStore.error"
        type="error"
        variant="tonal"
        class="error-alert"
      >
        {{ schedulesStore.error }}
      </v-alert>

      <!-- Schedule Details -->
      <v-row v-else>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="d-flex align-center py-3 px-4 bg-primary text-white">
              <span>Schedule Information</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" sm="6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Section</h3>
                  <p class="text-body-1">{{ scheduleDetails.course_name }}</p>
                  <p class="text-caption text-medium-emphasis">{{ schedule.day }}</p>
                </v-col>
                <v-col cols="12" sm="6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-2">Classroom</h3>
                  <p class="text-body-1">{{ scheduleDetails.classroom_name }}</p>
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
                    {{ scheduleDetails.time_slot_display }}
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
                  :to="{ name: 'enrollments', query: { course: schedule.course } }"
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
    </div>

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
            :loading="schedulesStore.isLoading"
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
            <p><strong>Section:</strong> {{ scheduleDetails.course_name }}</p>
            <p><strong>Time Slot:</strong> {{ scheduleDetails.time_slot_display }}</p>
            <p><strong>Classroom:</strong> {{ scheduleDetails.classroom_name }}</p>
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
            :loading="schedulesStore.isLoading"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSchedulesStore } from '@/client/stores/schedules.ts'
import { useCoursesStore } from '@/client/stores/courses.ts'
import { useClassroomsStore } from '@/client/stores/classrooms.ts'
import type { Schedule } from '@/client/api.ts'
import PageHeader from '@/components/common/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const schedulesStore = useSchedulesStore()
const coursesStore = useCoursesStore()
const classroomsStore = useClassroomsStore()

const scheduleId = computed(() => Number(route.params.id))
const schedule = ref<Schedule>({
  id: 0,
  course: 0,
  classroom: 0,
  day: '',
  time_slot: 0,
  is_active: true,
  notes: '',
  created_at: '',
  updated_at: ''
})

// Computed properties for derived data
const scheduleDetails = computed(() => {
  const course = coursesStore.courses.find(c => c.id === schedule.value.course)
  const classroom = classroomsStore.classrooms.find(c => c.id === schedule.value.classroom)
  const timeSlot = timeSlots.find(t => t.id === schedule.value.time_slot)

  return {
    course_name: course?.name || 'Unknown Course',
    classroom_name: classroom?.name || 'Unknown Classroom',
    time_slot_display: timeSlot?.display || 'Unknown Time'
  }
})

const courseId = computed(() => schedule.value.course)
const enrolledCount = ref(0)

// Time slots definition
const timeSlots = [
  { id: 1, display: '08:00 - 08:30' },
  { id: 2, display: '08:30 - 09:00' },
  { id: 3, display: '09:00 - 09:30' },
  { id: 4, display: '09:30 - 10:00' },
  { id: 5, display: '10:00 - 10:30' },
  { id: 6, display: '10:30 - 11:00' },
  { id: 7, display: '11:00 - 11:30' },
  { id: 8, display: '11:30 - 12:00' },
  { id: 9, display: '12:00 - 12:30' },
  { id: 10, display: '12:30 - 13:00' },
  { id: 11, display: '13:00 - 13:30' },
  { id: 12, display: '13:30 - 14:00' },
  { id: 13, display: '14:00 - 14:30' },
  { id: 14, display: '14:30 - 15:00' },
  { id: 15, display: '15:00 - 15:30' },
  { id: 16, display: '15:30 - 16:00' },
  { id: 17, display: '16:00 - 16:30' },
  { id: 18, display: '16:30 - 17:00' },
  { id: 19, display: '17:00 - 17:30' },
  { id: 20, display: '17:30 - 18:00' }
]

// Edit Dialog
const editDialog = ref(false)
const editedItem = ref({
  is_active: true,
  notes: ''
})

// Delete Dialog
const deleteDialog = ref(false)

// Lifecycle Hooks
onMounted(async () => {
  await Promise.all([
    fetchSchedule(),
    fetchEnrolledCount(),
    coursesStore.fetchCourses(),
    classroomsStore.fetchClassrooms()
  ])
})

// Methods
async function fetchSchedule() {
  try {
    const data = await schedulesStore.fetchSchedule(scheduleId.value)
    schedule.value = data
  } catch (error) {
    console.error('Error fetching schedule:', error)
  }
}

async function fetchEnrolledCount() {
  try {
    // In a real implementation, this would fetch the count from the API
    enrolledCount.value = 25
  } catch (error) {
    console.error('Error fetching enrolled count:', error)
    enrolledCount.value = 0
  }
}

function editSchedule() {
  editedItem.value = {
    is_active: schedule.value.is_active,
    notes: schedule.value.notes
  }
  editDialog.value = true
}

async function saveSchedule() {
  try {
    await schedulesStore.updateSchedule(scheduleId.value, editedItem.value)
    schedule.value.is_active = editedItem.value.is_active
    schedule.value.notes = editedItem.value.notes
    editDialog.value = false
  } catch (error) {
    console.error('Error saving schedule:', error)
  }
}

function confirmDelete() {
  deleteDialog.value = true
}

async function deleteSchedule() {
  try {
    await schedulesStore.deleteSchedule(scheduleId.value)
    router.push({ name: 'schedules' })
  } catch (error) {
    console.error('Error deleting schedule:', error)
  }
}

async function changeTimeSlot() {
  // This would be implemented with a dialog to select a new time slot
  console.log('Change time slot')
}

async function toggleStatus() {
  editedItem.value = {
    is_active: !schedule.value.is_active,
    notes: schedule.value.notes
  }
  saveSchedule()
}
</script>

<style lang="scss">
@use '../../styles/theme/index' as theme;

.schedule-details-view {
  padding: theme.$spacing-xl;
  background-color: theme.$theme-surface-0;
  min-height: 100vh;
}

.view-header {
  margin-bottom: theme.$spacing-xl;
  background-color: theme.$theme-surface-2;
  border-radius: theme.$border-radius-lg;
  padding: theme.$spacing-lg;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: theme.$spacing-md;
}

.header-title {
  color: theme.$theme-text-primary;
  font-size: theme.$font-size-2xl;
  font-weight: theme.$font-weight-bold;
  margin: 0;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  margin: theme.$spacing-xl 0;
}

.error-alert {
  margin: theme.$spacing-md 0;
}

.v-card {
  background: theme.$theme-surface-1 !important;
  color: theme.$theme-text-primary !important;
  border-radius: theme.$border-radius-lg;
  box-shadow: 0 2px 8px theme.$theme-shadow-color;
}

.v-card-title {
  color: theme.$theme-text-primary !important;
  font-size: theme.$font-size-lg !important;
  font-weight: theme.$font-weight-semibold !important;
}

.v-card-text {
  color: theme.$theme-text-secondary !important;
}

.v-list {
  background: theme.$theme-surface-1 !important;
}

.v-list-item {
  color: theme.$theme-text-primary !important;
}

.v-list-item-subtitle {
  color: theme.$theme-text-secondary !important;
}

.v-chip {
  font-weight: theme.$font-weight-medium !important;
}

.text-subtitle-1 {
  color: theme.$theme-text-primary;
  font-size: theme.$font-size-base;
  font-weight: theme.$font-weight-semibold;
}

.text-body-1 {
  color: theme.$theme-text-primary;
  font-size: theme.$font-size-base;
}

.text-caption {
  color: theme.$theme-text-secondary;
  font-size: theme.$font-size-xs;
}

.text-medium-emphasis {
  opacity: 0.7;
}

.bg-primary {
  background-color: theme.$theme-primary !important;
}

.bg-primary-lighten-1 {
  background-color: rgba(theme.$theme-primary, 0.8) !important;
}

.text-white {
  color: theme.$theme-primary-contrast !important;
}

.d-flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.justify-space-between {
  justify-content: space-between;
}

.py-3 {
  padding-top: theme.$spacing-md;
  padding-bottom: theme.$spacing-md;
}

.px-4 {
  padding-left: theme.$spacing-lg;
  padding-right: theme.$spacing-lg;
}

.pa-4 {
  padding: theme.$spacing-lg;
}

.my-4 {
  margin-top: theme.$spacing-lg;
  margin-bottom: theme.$spacing-lg;
}

.mb-2 {
  margin-bottom: theme.$spacing-xs;
}

.mr-2 {
  margin-right: theme.$spacing-xs;
}

.mt-4 {
  margin-top: theme.$spacing-lg;
}
</style>
