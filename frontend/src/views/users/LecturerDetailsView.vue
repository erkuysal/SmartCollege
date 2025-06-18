<template>
  <div class="lecturer-details-view">
    <!-- Header Section with Lecturer Info -->
    <div class="view-header">
      <div class="header-content">
        <div class="header-left">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="router.back()"
            class="back-button"
          />
          <div class="lecturer-header-info">
            <h1 class="header-title">{{ lecturer?.first_name }} {{ lecturer?.last_name }}</h1>
            <div class="lecturer-subtitle">
              <v-chip
                size="small"
                color="primary"
                variant="tonal"
                class="lecturer-code"
              >
                {{ lecturer?.lecturer_number }}
              </v-chip>
              <v-chip
                size="small"
                color="info"
                variant="tonal"
                class="lecturer-email"
              >
                {{ lecturer?.email }}
              </v-chip>
              <v-chip
                size="small"
                color="secondary"
                variant="tonal"
                v-if="lecturer?.title"
              >
                {{ lecturer?.title }}
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
            Edit Lecturer
          </v-btn>
        </div>
      </div>
    </div>

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

      <template v-else>
        <v-card class="mt-4">
          <v-tabs v-model="tab" color="primary" background-color="transparent">
            <v-tab>Profile</v-tab>
            <v-tab>Courses</v-tab>
            <v-tab>Account</v-tab>
          </v-tabs>
          <v-divider />
          <v-card-text>
            <v-window v-model="tab">
              <v-window-item :value="0">
                <!-- Profile Tab: Modern Card Layout -->
                <ProfileCard
                  :first-name="lecturer?.first_name"
                  :last-name="lecturer?.last_name"
                  :info-items="infoItems"
                >
                  <template #chips>
                    <v-chip
                      size="small"
                      color="primary"
                      variant="tonal"
                      class="lecturer-code"
                    >
                      {{ lecturer?.lecturer_number }}
                    </v-chip>
                  </template>
                </ProfileCard>
              </v-window-item>
              <v-window-item :value="1">
                <!-- Courses Tab -->
                <v-data-table
                  :headers="coursesHeaders"
                  :items="lecturerCourses"
                  :items-per-page="10"
                  class="elevation-1 courses-table"
                  v-if="lecturerCourses.length > 0"
                >
                  <template v-slot:item.code="{ item }">
                    <v-chip
                      size="small"
                      color="primary"
                      variant="tonal"
                      class="course-code"
                    >
                      {{ item.code }}
                    </v-chip>
                  </template>
                  <template v-slot:item.name="{ item }">
                    <div class="d-flex flex-column">
                      <span class="course-name">{{ item.name }}</span>
                      <span class="course-description text-caption">{{ item.description }}</span>
                    </div>
                  </template>
                  <template v-slot:item.semester="{ item }">
                    <v-chip
                      size="small"
                      color="info"
                      variant="tonal"
                    >
                      {{ item.semester }}
                    </v-chip>
                  </template>
                </v-data-table>
                <div v-else class="empty-courses">
                  <v-icon size="large" color="grey">mdi-book-off</v-icon>
                  <p>No courses found for this lecturer.</p>
                </div>
              </v-window-item>
              <v-window-item :value="2">
                <!-- Account Tab -->
                <div class="account-tab">
                  <div><strong>Created At:</strong> {{ formatDate(lecturer?.created_at) }}</div>
                  <div><strong>Last Updated:</strong> {{ formatDate(lecturer?.updated_at) }}</div>
                </div>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </template>
    </div>

    <!-- Edit Lecturer Dialog -->
    <v-dialog
      v-model="showEditModal"
      max-width="500px"
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start color="primary">mdi-account-edit</v-icon>
          Edit Lecturer
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleUpdateLecturer">
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
            <v-text-field
              v-model="editingTitle"
              label="Title"
              variant="outlined"
              prepend-inner-icon="mdi-school"
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
            @click="handleUpdateLecturer"
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
import { getLecturer, updateLecturer } from '@/client/api.ts'
import { useCoursesStore } from '@/client/stores/courses.ts'
import { format } from 'date-fns'
import ProfileCard from '@/components/users/ProfileCard.vue'
import { useLecturersStore } from '@/client/stores/lecturers.ts'

const route = useRoute()
const router = useRouter()
const coursesStore = useCoursesStore()
const lecturersStore = useLecturersStore()

// State
const lecturer = ref<any>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const showEditModal = ref(false)
const editingLecturer = ref<any>(null)

// Computed for v-model fields
const editingFirstName = computed({
  get: () => editingLecturer.value?.first_name ?? '',
  set: (val: string) => { if (editingLecturer.value) editingLecturer.value.first_name = val }
})
const editingLastName = computed({
  get: () => editingLecturer.value?.last_name ?? '',
  set: (val: string) => { if (editingLecturer.value) editingLecturer.value.last_name = val }
})
const editingTitle = computed({
  get: () => editingLecturer.value?.title ?? '',
  set: (val: string) => { if (editingLecturer.value) editingLecturer.value.title = val }
})

// Table headers for courses
const coursesHeaders = [
  { title: 'Course Code', key: 'code', sortable: true },
  { title: 'Course Name', key: 'name', sortable: true },
  { title: 'Semester', key: 'semester', sortable: true },
]

// Computed property for lecturer's courses
const lecturerCourses = computed(() => {
  if (!lecturer.value) return []
  return coursesStore.courses.filter(course => course.instructor === lecturer.value.id)
})

// Add tab state
const tab = ref(0)

// Add formatDate function
function formatDate(dt: string | undefined) {
  if (!dt) return ''
  return new Date(dt as string).toLocaleString()
}

const infoItems = computed(() => [
  {
    label: 'Lecturer Number:',
    icon: 'mdi-card-account-details',
    value: lecturer.value?.lecturer_number || '',
    displayValue: lecturer.value?.lecturer_number || '',
  },
  {
    label: 'Email:',
    icon: 'mdi-email',
    value: lecturer.value ? `mailto:${lecturer.value.email}` : '',
    displayValue: lecturer.value?.email || '',
    isLink: true,
  },
  {
    label: 'Title:',
    icon: 'mdi-school',
    value: lecturer.value?.title || 'No title',
    displayValue: lecturer.value?.title || 'No title',
  },
])

const fetchLecturerDetails = async () => {
  try {
    isLoading.value = true
    error.value = null

    // 1. Ensure lecturers are loaded
    if (!lecturersStore.lecturers.length) {
      await lecturersStore.fetchLecturers()
    }

    // 2. Lookup by user_number
    const userNumber = route.params.user_number as string
    const found = lecturersStore.getLecturerByUserNumber(userNumber)
    if (!found) {
      error.value = 'Lecturer not found'
      return
    }

    // 3. Use the id for backend calls
    const response = await getLecturer(found.id)
    lecturer.value = response.data
    editingLecturer.value = { ...response.data }
    await coursesStore.fetchCourses()
  } catch (err) {
    error.value = 'Failed to fetch lecturer details'
  } finally {
    isLoading.value = false
  }
}

const handleUpdateLecturer = async () => {
  if (!editingLecturer.value) return
  try {
    const response = await updateLecturer(editingLecturer.value.id, {
      first_name: editingLecturer.value.first_name,
      last_name: editingLecturer.value.last_name,
      title: editingLecturer.value.title,
    })
    lecturer.value = response.data
    editingLecturer.value = { ...response.data }
    showEditModal.value = false
  } catch (err) {
    error.value = 'Failed to update lecturer'
  }
}

onMounted(() => {
  fetchLecturerDetails()
})
</script>

<style lang="scss">
@use '../../styles/theme/index' as theme;

.lecturer-details-view {
  padding: theme.$spacing-xl;
  background-color: theme.$theme-surface-0;
  min-height: 100vh;
}

.view-header {
  margin-bottom: theme.$spacing-xl;
  background-color: theme.$theme-surface-2;
  border-radius: theme.$border-radius-xl;
  padding: theme.$spacing-xl;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: theme.$spacing-lg;
}

.lecturer-header-info {
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

.lecturer-subtitle {
  display: flex;
  gap: theme.$spacing-xs;
}

.lecturer-code, .lecturer-email {
  font-weight: theme.$font-weight-medium;
}

.lecturer-email {
  color: theme.$theme-text-primary !important;
  text-decoration: none !important;
}

.back-button {
  margin-right: theme.$spacing-xs;
}

.courses-card {
  border-radius: theme.$border-radius-lg;
  margin-bottom: theme.$spacing-lg;
  background: theme.$theme-surface-1;
  box-shadow: none;
}

.courses-table {
  border-radius: theme.$border-radius-md;
  overflow: hidden;
  background: theme.$theme-surface-1;
}

.course-code {
  font-weight: theme.$font-weight-medium;
}

.course-name {
  font-weight: theme.$font-weight-medium;
  color: theme.$theme-text-primary;
}

.course-description {
  color: theme.$theme-text-secondary;
  margin-top: theme.$spacing-xs;
}

.empty-courses {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: theme.$spacing-2xl 0;
  color: theme.$theme-text-secondary;
  gap: theme.$spacing-md;
}

.empty-courses p {
  margin: 0;
  font-size: theme.$font-size-base;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.error-alert {
  margin: theme.$spacing-md 0;
}

.v-card {
  background: theme.$theme-surface-1 !important;
  color: theme.$theme-text-primary !important;
  border-radius: theme.$border-radius-lg;
  box-shadow: none;
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

.v-data-table {
  background: theme.$theme-surface-1 !important;
}

.v-data-table-header {
  background: theme.$theme-surface-2 !important;
}

.v-data-table-header th {
  color: theme.$theme-text-secondary !important;
  font-weight: theme.$font-weight-medium !important;
}

.v-data-table__td {
  color: theme.$theme-text-primary !important;
}

// Add new styles for tabs and profile
.profile-tab, .account-tab {
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
