<template>
  <div class="student-details-view">
    <!-- Header Section with Student Info -->
    <div class="view-header">
      <div class="header-content">
        <div class="header-left">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="router.back()"
            class="back-button"
          />
          <div class="student-header-info">
            <h1 class="header-title">{{ student?.first_name }} {{ student?.last_name }}</h1>
            <div class="student-subtitle">
              <v-chip
                size="small"
                color="primary"
                variant="tonal"
                class="student-number"
              >
                {{ student?.student_number }}
              </v-chip>
              <v-chip size="small" :color="student?.is_active ? 'success' : 'error'" variant="tonal">
                {{ student?.is_active ? 'Active' : 'Inactive' }}
              </v-chip>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <v-btn
            color="primary"
            prepend-icon="mdi-pencil"
            @click="showEditModal = true"
          >
            Edit Student
          </v-btn>
        </div>
      </div>
    </div>

    <v-card class="mt-4">
      <v-tabs v-model="tab" color="primary" background-color="transparent">
        <v-tab>Profile</v-tab>
        <v-tab>Account</v-tab>
        <v-tab>Attendance</v-tab>
        <v-tab>Courses</v-tab>
      </v-tabs>
      <v-divider />
      <v-card-text>
        <v-window v-model="tab">
          <v-window-item :value="0">
            <!-- Profile Tab: Modern Card Layout -->
            <ProfileCard
              :first-name="student?.first_name"
              :last-name="student?.last_name"
              :info-items="infoItems"
            >
              <template #chips>
                <v-chip
                  size="small"
                  color="primary"
                  variant="tonal"
                  class="student-number"
                >
                  {{ student?.student_number }}
                </v-chip>
                <v-chip
                  size="small"
                  :color="student?.is_active ? 'success' : 'error'"
                  variant="tonal"
                >
                  {{ student?.is_active ? 'Active' : 'Inactive' }}
                </v-chip>
              </template>
            </ProfileCard>
          </v-window-item>
          <v-window-item :value="1">
            <!-- Account Tab -->
            <div class="account-tab">
              <div><strong>User Number:</strong> {{ student?.user_number }}</div>
              <div><strong>User Type:</strong> {{ student?.user_type }}</div>
              <div><strong>Created At:</strong> {{ formatDate(student?.created_at) }}</div>
              <div><strong>Last Updated:</strong> {{ formatDate(student?.updated_at) }}</div>
            </div>
          </v-window-item>
          <v-window-item :value="2">
            <!-- Attendance Tab Placeholder -->
            <div class="placeholder-tab">Attendance records will appear here.</div>
          </v-window-item>
          <v-window-item :value="3">
            <!-- Courses Tab Placeholder -->
            <div class="placeholder-tab">Enrolled courses will appear here.</div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <!-- Edit Student Dialog -->
    <v-dialog
      v-model="showEditModal"
      max-width="500px"
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start color="primary">mdi-account-edit</v-icon>
          Edit Student
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleUpdateStudent">
            <v-text-field
              v-model="editingFirstName"
              label="First Name"
              required
              variant="outlined"
              prepend-inner-icon="mdi-account"
            />
            <v-text-field
              v-model="editingLastName"
              label="Last Name"
              required
              variant="outlined"
              prepend-inner-icon="mdi-account"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showEditModal = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="handleUpdateStudent"
            prepend-icon="mdi-content-save"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import { getStudent, updateStudent } from '@/client/api.ts'
import { useRfidStore } from '@/client/stores/rfid.ts'
import type { Student, AttendanceRecord } from '@/client/api.ts'
import ProfileCard from '@/components/users/ProfileCard.vue'
import { useUIStore } from '@/client/stores/ui.ts'
import { useStudentsStore } from '@/client/stores/students.ts'

// Types
interface StudentWithAttendance extends Student {
  attendance_records: AttendanceRecord[]
}

const route = useRoute()
const router = useRouter()
const rfidStore = useRfidStore()
const uiStore = useUIStore()
const studentsStore = useStudentsStore()

// State
const student = ref<StudentWithAttendance | null>(null)
const editingStudent = ref<StudentWithAttendance | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const showEditModal = ref(false)
const searchQuery = ref('')
const tab = ref(0)

// Computed for v-model fields
const editingFirstName = computed({
  get: () => editingStudent.value?.first_name ?? '',
  set: (val: string) => { if (editingStudent.value) editingStudent.value.first_name = val }
})
const editingLastName = computed({
  get: () => editingStudent.value?.last_name ?? '',
  set: (val: string) => { if (editingStudent.value) editingStudent.value.last_name = val }
})

// Table headers for attendance history
const attendanceHeaders = [
  { title: 'Date', key: 'timestamp', sortable: true },
  { title: 'Session', key: 'session', sortable: true },
]

// Computed properties
const filteredAttendanceRecords = computed(() => {
  if (!student.value || !student.value.attendance_records) return []
  return student.value.attendance_records.filter((record: AttendanceRecord) => {
    const searchLower = searchQuery.value.toLowerCase()
    return (
      record.session.name.toLowerCase().includes(searchLower) ||
      formatDate(record.timestamp).toLowerCase().includes(searchLower)
    )
  })
})

const attendanceStats = computed(() => {
  if (!student.value || !student.value.attendance_records) {
    return {
      totalSessions: 0,
      presentCount: 0,
      attendanceRate: 0
    }
  }
  const records = student.value.attendance_records
  const totalSessions = records.length
  const attendanceRate = 100 // Since all records in the system are present records
  return {
    totalSessions,
    presentCount: totalSessions,
    attendanceRate
  }
})

const infoItems = computed(() => [
  {
    label: 'Student Number:',
    icon: 'mdi-card-account-details',
    value: student.value?.student_number || '',
    displayValue: student.value?.student_number || '',
  },
  {
    label: 'Email:',
    icon: 'mdi-email',
    value: student.value ? `mailto:${student.value.email}` : '',
    displayValue: student.value?.email || '',
    isLink: true,
  },
  {
    label: 'User Number:',
    icon: 'mdi-account',
    value: student.value?.user_number || '',
    displayValue: student.value?.user_number || '',
  },
  {
    label: 'User Type:',
    icon: 'mdi-account-badge',
    value: student.value?.user_type || '',
    displayValue: student.value?.user_type || '',
  },
])

// Methods
function formatDate(dt: string | undefined) {
  if (!dt) return ''
  return new Date(dt as string).toLocaleString()
}

const fetchStudentDetails = async () => {
  try {
    isLoading.value = true
    error.value = null
    // Ensure students are loaded
    if (!studentsStore.students.length) {
      await studentsStore.fetchStudents()
    }
    // Lookup by user_number
    const userNumber = route.params.user_number as string
    const found = studentsStore.getStudentByUserNumber(userNumber)
    if (!found) {
      error.value = 'Student not found'
      return
    }
    // Use the id for backend calls
    const response = await getStudent(found.id)
    student.value = response.data as StudentWithAttendance
    editingStudent.value = { ...response.data } as StudentWithAttendance
  } catch (err) {
    error.value = 'Failed to fetch student details'
  } finally {
    isLoading.value = false
  }
}

const handleUpdateStudent = async () => {
  if (!editingStudent.value) return
  try {
    const response = await updateStudent(editingStudent.value.id, {
      first_name: editingStudent.value.first_name,
      last_name: editingStudent.value.last_name,
    })
    student.value = response.data as StudentWithAttendance
    editingStudent.value = { ...response.data } as StudentWithAttendance
    showEditModal.value = false
  } catch (err) {
    error.value = 'Failed to update student'
  }
}

const scanRFID = async () => {
  try {
    await rfidStore.scanRFID();
    // handle result if needed
  } catch (e) {
    // handle error
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchStudentDetails()
})
</script>

<style lang="scss">
@use '../../styles/theme/index' as theme;

.student-details-view {
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
}

.header-left {
  display: flex;
  align-items: center;
  gap: theme.$spacing-md;
}

.student-header-info {
  display: flex;
  flex-direction: column;
  gap: theme.$spacing-xs;
}

.header-title {
  color: theme.$theme-text-primary;
  font-size: theme.$font-size-2xl;
  font-weight: theme.$font-weight-bold;
  margin: 0;
}

.student-subtitle {
  display: flex;
  gap: theme.$spacing-xs;
}

.student-number {
  font-weight: theme.$font-weight-medium;
}

.back-button {
  margin-right: theme.$spacing-xs;
}

.profile-tab, .account-tab, .placeholder-tab {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: theme.$spacing-md;
  padding: theme.$spacing-lg 0;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: theme.$spacing-xs;
}

.avatar-initials {
  color: theme.$theme-primary-contrast;
  font-size: theme.$font-size-xl;
  font-weight: theme.$font-weight-bold;
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

.v-chip {
  font-weight: theme.$font-weight-medium !important;
}

.mt-4 {
  margin-top: theme.$spacing-lg;
}

// Modern Card Layout for Profile Tab
.profile-tab.modern-card {
  background: rgba(255,255,255,0.05);
  border-radius: theme.$border-radius-xl;
  box-shadow: none;
  padding: theme.$spacing-xl;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: theme.$spacing-xl;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: theme.$spacing-lg;
}
.profile-avatar {
  box-shadow: 0 2px 12px theme.$theme-shadow-color;
  border: 4px solid theme.$theme-primary;
}
.profile-name {
  font-size: theme.$font-size-2xl;
  font-weight: theme.$font-weight-bold;
  color: theme.$theme-text-primary;
}
.profile-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: theme.$spacing-md;
  width: 100%;
}
.info-item {
  display: flex;
  align-items: center;
  font-size: theme.$font-size-base;
  color: theme.$theme-text-secondary;
}
.profile-info-grid a {
  color: theme.$theme-text-primary;
  text-decoration: none;
}
</style>
