<template>
  <div class="schedules-view">
    <PageHeader title="Class Schedule">
      <template #subtitle>
        Manage and view class timetables
      </template>
      <template #actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openAddDialog"
        >
          Add Schedule
        </v-btn>
      </template>
    </PageHeader>

    <!-- Main Content -->
    <div class="view-content">
      <!-- Loading State -->
      <v-progress-circular
        v-if="isLoading"
        indeterminate
        color="primary"
        class="loading-spinner"
      />

      <!-- Error State -->
      <v-alert
        v-else-if="error"
        type="error"
        variant="tonal"
        class="error-alert"
      >
        {{ error }}
      </v-alert>

      <!-- Timetable -->
      <ScheduleTimetable
        v-else
        :schedules="schedules"
        :sessions="sessions"
        :courses="courses"
        :classrooms="classrooms"
        @cell-click="handleCellClick"
      />
    </div>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5 bg-primary text-white py-3 px-4">
          {{ editedItem.id ? 'Edit Schedule' : 'Add Schedule' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row v-if="lastClickedDay && lastClickedTimeSlotId !== null" class="mb-4">
            <v-col cols="12">
              <div class="text-h6">
                {{ lastClickedDay }}
                <span v-if="timeSlots.find(t => t.id === lastClickedTimeSlotId)">
                  - {{ timeSlots.find(t => t.id === lastClickedTimeSlotId)?.display }}
                </span>
              </div>
            </v-col>
          </v-row>
          <v-form ref="form" @submit.prevent="saveSchedule">
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.course"
                  :items="courses"
                  item-title="name"
                  item-value="id"
                  label="Course"
                  :loading="isLoading"
                  :disabled="isLoading"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.classroom"
                  :items="classrooms"
                  item-title="name"
                  item-value="id"
                  label="Classroom"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.start_date"
                  label="Start Date"
                  type="date"
                  required
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.end_date"
                  label="End Date"
                  type="date"
                  required
                />
              </v-col>
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
            @click="dialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveSchedule"
            :loading="isSaving"
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
            <p><strong>Course:</strong> {{ selectedSchedule ? getScheduleDetails(selectedSchedule).course_name : '' }}</p>
            <p><strong>Time:</strong> {{ selectedSchedule ? getScheduleDetails(selectedSchedule).time_slot_display : '' }}</p>
            <p><strong>Classroom:</strong> {{ selectedSchedule ? getScheduleDetails(selectedSchedule).classroom_name : '' }}</p>
          </div>
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
            :loading="isLoading"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Replace the actions dialog with this menu -->
    <v-menu
      v-model="menu"
      absolute
      location="start"
      location-strategy="connected"
      :target="[menuX, menuY]"
      :close-on-content-click="false"
      transition="scale-transition"
    >
      <v-card min-width="200" class="pa-2">
        <v-list>
          <v-list-item
            v-if="!getSessionForCell(selectedScheduleForActions?.time_slot || 0, selectedScheduleForActions?.day || '')"
            @click="startSession"
            :disabled="isLoading"
          >
            <template v-slot:prepend>
              <v-icon color="success">mdi-play-circle</v-icon>
            </template>
            <v-list-item-title>Start Attendance</v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="getSessionForCell(selectedScheduleForActions?.time_slot || 0, selectedScheduleForActions?.day || '')?.is_active"
            @click="endSession"
            :disabled="isLoading"
          >
            <template v-slot:prepend>
              <v-icon color="error">mdi-stop-circle</v-icon>
            </template>
            <v-list-item-title>End Attendance</v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="getSessionForCell(selectedScheduleForActions?.time_slot || 0, selectedScheduleForActions?.day || '')"
            @click="viewAttendance"
          >
            <template v-slot:prepend>
              <v-icon color="primary">mdi-account-group</v-icon>
            </template>
            <v-list-item-title>View Attendance</v-list-item-title>
          </v-list-item>

          <v-list-item @click="goToCourse">
            <template v-slot:prepend>
              <v-icon color="info">mdi-book-open-page-variant</v-icon>
            </template>
            <v-list-item-title>Go to Course</v-list-item-title>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item @click="editSchedule">
            <template v-slot:prepend>
              <v-icon color="primary">mdi-pencil</v-icon>
            </template>
            <v-list-item-title>Edit Schedule</v-list-item-title>
          </v-list-item>

          <v-list-item @click="deleteSchedule">
            <template v-slot:prepend>
              <v-icon color="error">mdi-delete</v-icon>
            </template>
            <v-list-item-title>Delete Schedule</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSchedulesStore } from '@/client/stores/schedules.ts'
import { useSessionsStore } from '@/client/stores/sessions.ts'
import { useCoursesStore } from '@/client/stores/courses.ts'
import { useClassroomsStore } from '@/client/stores/classrooms.ts'
import { useUIStore } from '@/client/stores/ui.ts'
import { useAttendanceStore } from '@/client/stores/attendance'
import type { Schedule, AttendanceSession } from '@/client/api.ts'
import ScheduleTimetable from '@/components/academics/ScheduleTimetable.vue'
import PageHeader from '@/components/common/PageHeader.vue'

const router = useRouter()
const schedulesStore = useSchedulesStore()
const sessionsStore = useSessionsStore()
const coursesStore = useCoursesStore()
const classroomsStore = useClassroomsStore()
const uiStore = useUIStore()
const attendanceStore = useAttendanceStore()

// State
const search = ref('')
const sortBy = ref('day')
const sortDesc = ref(false)
const itemsPerPage = ref(10)
const page = ref(1)
const dialog = ref(false)
const editMode = ref(false)
const selectedSchedule = ref<Schedule | null>(null)
const deleteDialog = ref(false)
const actionsDialog = ref(false)
const selectedScheduleForActions = ref<Schedule | null>(null)
const isSaving = ref(false)
const saveError = ref('')

// Computed properties
const schedules = computed(() => schedulesStore.schedules)
const sessions = computed(() => sessionsStore.sessions)
const courses = computed(() => coursesStore.courses)
const classrooms = computed(() => classroomsStore.classrooms)
const isLoading = computed(() => schedulesStore.isLoading || sessionsStore.isLoading)
const error = computed(() => schedulesStore.error || sessionsStore.error)

// Time slots and days
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

// Form data
const editedItem = ref({
  id: 0,
  course: 0,
  classroom: 0,
  is_active: true,
  notes: '',
  start_date: '',
  end_date: ''
})

// Menu state
const menu = ref(false)
const menuX = ref(0)
const menuY = ref(0)

// Last clicked cell state
const lastClickedTimeSlotId = ref<number | null>(null)
const lastClickedDay = ref<string | null>(null)

// Add computed properties for schedule details
const getScheduleDetails = computed(() => (schedule: Schedule) => {
  const course = courses.value.find(c => c.id === schedule.course)
  const classroom = classrooms.value.find(c => c.id === schedule.classroom)
  const timeSlot = timeSlots.find(t => t.id === schedule.time_slot)

  return {
    course_name: course?.name || 'Unknown Course',
    classroom_name: classroom?.name || 'Unknown Classroom',
    time_slot_display: timeSlot?.display || 'Unknown Time'
  }
})

// Methods
async function fetchData() {
  try {
    await Promise.all([
      schedulesStore.fetchSchedules(),
      sessionsStore.fetchSessions(),
      coursesStore.fetchCourses(),
      classroomsStore.fetchClassrooms()
    ])
  } catch (err: any) {
    uiStore.showError(err.response?.data?.message || 'Failed to fetch data')
  }
}

async function handleCreateSchedule(schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>) {
  try {
    await schedulesStore.createSchedule(schedule)
    uiStore.showSuccess('Schedule created successfully')
    dialog.value = false
  } catch (err: any) {
    uiStore.showError(err.response?.data?.message || 'Failed to create schedule')
  }
}

async function handleUpdateSchedule(id: number, updates: Partial<Omit<Schedule, 'id' | 'created_at' | 'updated_at'>>) {
  try {
    await schedulesStore.updateSchedule(id, updates)
    uiStore.showSuccess('Schedule updated successfully')
    dialog.value = false
  } catch (err: any) {
    uiStore.showError(err.response?.data?.message || 'Failed to update schedule')
  }
}

async function handleDeleteSchedule(id: number) {
  try {
    await schedulesStore.deleteSchedule(id)
    uiStore.showSuccess('Schedule deleted successfully')
  } catch (err: any) {
    uiStore.showError(err.response?.data?.message || 'Failed to delete schedule')
  }
}

async function handleStartSession(schedule: Schedule) {
  try {
    const course = courses.value.find(c => c.id === schedule.course)
    await sessionsStore.startNewSession({
      course: schedule.course,
      name: `${course?.name || 'Unknown Course'} - ${schedule.day}`
    })
    uiStore.showSuccess('Session started successfully')
  } catch (err: any) {
    uiStore.showError(err.response?.data?.message || 'Failed to start session')
  }
}

async function handleEndSession(schedule: Schedule) {
  const session = getSessionForCell(schedule.time_slot, schedule.day)
  if (!session) return

  try {
    await sessionsStore.endSession(session.id)
    uiStore.showSuccess('Session ended successfully')
  } catch (err: any) {
    uiStore.showError(err.response?.data?.message || 'Failed to end session')
  }
}

function getScheduleForCell(timeSlotId: number, day: string): Schedule | undefined {
  return schedules.value.find(schedule =>
    schedule.time_slot === timeSlotId && schedule.day === day
  )
}

function isScheduleActive(timeSlotId: number, day: string): boolean {
  const schedule = getScheduleForCell(timeSlotId, day)
  return schedule?.is_active ?? false
}

function getSessionForCell(timeSlotId: number, day: string): AttendanceSession | undefined {
  const schedule = getScheduleForCell(timeSlotId, day)
  if (!schedule) return undefined

  return sessions.value.find(session =>
    session.course === schedule.course &&
    schedule.day === day &&
    new Date(session.start_time).getHours() === parseInt(timeSlots.find(t => t.id === timeSlotId)?.display.split(':')[0] || '0')
  )
}

const handleCellClick = (event: MouseEvent, timeSlotId: number, day: string) => {
  lastClickedTimeSlotId.value = timeSlotId
  lastClickedDay.value = day
  const schedule = getScheduleForCell(timeSlotId, day)
  if (schedule) {
    menu.value = false
    selectedScheduleForActions.value = schedule
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    menuX.value = rect.right + 50
    menuY.value = rect.bottom - 15
    setTimeout(() => { menu.value = true }, 0)
  } else {
    selectedSchedule.value = null
    const today = new Date().toISOString().slice(0, 10)
    editedItem.value = {
      id: 0,
      course: 0,
      classroom: 0,
      is_active: true,
      notes: '',
      start_date: today,
      end_date: today
    }
    dialog.value = true
  }
}

function openAddDialog() {
  const today = new Date().toISOString().slice(0, 10)
  editedItem.value = {
    id: 0,
    course: 0,
    classroom: 0,
    is_active: true,
    notes: '',
    start_date: today,
    end_date: today
  }
  dialog.value = true
}

async function saveSchedule() {
  console.log('saveSchedule called', {
    editedItem: editedItem.value,
    lastClickedDay: lastClickedDay.value,
    lastClickedTimeSlotId: lastClickedTimeSlotId.value,
    start_date: editedItem.value.start_date,
    end_date: editedItem.value.end_date
  })
  if (!editedItem.value.course || !editedItem.value.classroom || !editedItem.value.start_date || !editedItem.value.end_date) {
    console.warn('Missing required field:', {
      course: editedItem.value.course,
      classroom: editedItem.value.classroom,
      start_date: editedItem.value.start_date,
      end_date: editedItem.value.end_date
    })
    return
  }

  try {
    isSaving.value = true
    saveError.value = ''

    if (editedItem.value.id) {
      await handleUpdateSchedule(editedItem.value.id, {
        time_slot: lastClickedTimeSlotId.value!,
        day: lastClickedDay.value!,
        course: editedItem.value.course,
        classroom: editedItem.value.classroom,
        is_active: editedItem.value.is_active,
        notes: editedItem.value.notes || '',
        start_date: editedItem.value.start_date,
        end_date: editedItem.value.end_date
      })
    } else {
      await handleCreateSchedule({
        time_slot: lastClickedTimeSlotId.value!,
        day: lastClickedDay.value!,
        course: editedItem.value.course,
        classroom: editedItem.value.classroom,
        is_active: editedItem.value.is_active,
        notes: editedItem.value.notes || '',
        start_date: editedItem.value.start_date,
        end_date: editedItem.value.end_date
      })
    }

    dialog.value = false
    await fetchData()
  } catch (err: any) {
    saveError.value = err.response?.data?.message || 'Failed to save schedule'
    uiStore.showError(saveError.value)
  } finally {
    isSaving.value = false
  }
}

function confirmDelete() {
  if (selectedSchedule.value) {
    deleteDialog.value = true
  }
}

function viewAttendance() {
  if (!selectedScheduleForActions.value) return;

  const session = getSessionForCell(selectedScheduleForActions.value.time_slot, selectedScheduleForActions.value.day)
  if (!session) return;

  router.push(`/attendance/${session.id}`)
  actionsDialog.value = false
}

function editSchedule() {
  if (!selectedScheduleForActions.value) return;

  selectedSchedule.value = selectedScheduleForActions.value
  editedItem.value = {
    id: selectedScheduleForActions.value.id,
    course: selectedScheduleForActions.value.course,
    classroom: selectedScheduleForActions.value.classroom,
    is_active: selectedScheduleForActions.value.is_active,
    notes: selectedScheduleForActions.value.notes || '',
    start_date: selectedScheduleForActions.value.start_date,
    end_date: selectedScheduleForActions.value.end_date
  }
  actionsDialog.value = false
  dialog.value = true
}

async function deleteSchedule() {
  if (!selectedSchedule.value) return

  try {
    await handleDeleteSchedule(selectedSchedule.value.id)
    deleteDialog.value = false
    selectedSchedule.value = null
  } catch (err: any) {
    uiStore.showError(err.response?.data?.message || 'Failed to delete schedule')
  }
}

async function startSession() {
  if (!selectedScheduleForActions.value) return

  try {
    await handleStartSession(selectedScheduleForActions.value)
    menu.value = false
  } catch (err: any) {
    uiStore.showError(err.response?.data?.message || 'Failed to start session')
  }
}

async function endSession() {
  if (!selectedScheduleForActions.value) return

  try {
    await handleEndSession(selectedScheduleForActions.value)
    menu.value = false
  } catch (err: any) {
    uiStore.showError(err.response?.data?.message || 'Failed to end session')
  }
}

function goToCourse() {
  if (!selectedScheduleForActions.value) return;
  
  const courseId = selectedScheduleForActions.value.course;
  router.push(`/courses/${courseId}`);
  menu.value = false;
}

// Lifecycle Hooks
onMounted(() => {
  fetchData()
})
</script>

<style lang="scss">
@use '../../styles/theme/index' as theme;

.schedules-view {
  min-height: calc(100vh - 120px);
}

.view-header {
  margin-bottom: theme.$spacing-xl;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: theme.$spacing-md;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  margin: theme.$spacing-xl 0;
}

.error-alert {
  margin: theme.$spacing-md 0;
}
</style>
