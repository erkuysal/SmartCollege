<template>
  <div class="sessions-view">
    <PageHeader title="Attendance Sessions">
      <template #subtitle>
        Manage and monitor attendance sessions
      </template>
      <Filter :filters="filters" @change="handleFilterChange" />
    </PageHeader>

    <!-- Main Content -->
    <div class="view-content">
      <div class="sessions-grid">
        <v-card
          v-for="session in sessions"
          :key="session.id"
          @click="openAttendanceModal(session)"
          class="session-card"
        >
          <v-card-item>
            <v-card-title class="d-flex align-center justify-space-between">
              {{ session.name || 'Unnamed Session' }}
              <v-chip
                :color="session.is_active ? 'success' : 'grey'"
                size="small"
                class="status-chip"
              >
                {{ session.is_active ? 'Active' : 'Ended' }}
              </v-chip>
            </v-card-title>
            <v-card-text>
              <div class="session-info">
                <div class="info-item">
                  <span class="info-label">Course:</span>
                  <span class="info-value">{{ getCourseInfo(session.course) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Started:</span>
                  <span class="info-value">{{ formatDate(session.start_time) }}</span>
                </div>
                <div v-if="session.end_time" class="info-item">
                  <span class="info-label">Ended:</span>
                  <span class="info-value">{{ formatDate(session.end_time) }}</span>
                </div>
                <div v-if="sessionAttendance[session.id]" class="info-item">
                  <span class="info-label">Attendees:</span>
                  <span class="info-value">{{ sessionAttendance[session.id].length }} students</span>
                </div>
              </div>
              <div class="view-details">
                Click to view details →
              </div>
            </v-card-text>
            <v-card-actions v-if="session.is_active">
              <v-spacer />
              <v-btn
                color="secondary"
                variant="text"
                @click.stop="handleEndSession(session.id)"
                class="end-btn"
              >
                End Session
              </v-btn>
            </v-card-actions>
          </v-card-item>
        </v-card>
      </div>

      <!-- Error Alert -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="error-alert"
      >
        {{ error }}
      </v-alert>
    </div>

    <!-- Attendance Dialog -->
    <v-dialog
      :model-value="!!selectedSession"
      @update:model-value="val => selectedSession = val ? selectedSession : null"
      max-width="800px"
    >
      <v-card v-if="selectedSession" class="attendance-dialog">
        <v-card-title class="d-flex align-center justify-space-between">
          {{ selectedSession.name || 'Unnamed Session' }} - Attendance Records
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="closeModal"
            class="close-btn"
          />
        </v-card-title>
        <v-card-text>
          <div class="stats-grid">
            <v-card class="stat-card">
              <v-card-text>
                <div class="stat-label">Total Attendees</div>
                <div class="stat-value">
                  {{ sessionAttendance[selectedSession.id]?.length || 0 }}
                </div>
              </v-card-text>
            </v-card>
            <v-card class="stat-card">
              <v-card-text>
                <div class="stat-label">Session Duration</div>
                <div class="stat-value">
                  {{ calculateDuration(selectedSession) }}
                </div>
              </v-card-text>
            </v-card>
          </div>

          <v-list class="attendance-list">
            <v-list-item
              v-for="record in sessionAttendance[selectedSession.id]"
              :key="record.id"
              class="attendance-item"
            >
              <template v-slot:prepend>
                <v-avatar color="primary" size="40" class="student-avatar">
                  {{ record.student.first_name.charAt(0) }}{{ record.student.last_name.charAt(0) }}
                </v-avatar>
              </template>
              <v-list-item-title class="student-name">
                {{ record.student.first_name }} {{ record.student.last_name }}
              </v-list-item-title>
              <v-list-item-subtitle class="student-number">
                {{ record.student.user_number }}
              </v-list-item-subtitle>
              <template v-slot:append>
                <div class="timestamp">
                  {{ formatDate(record.timestamp) }}
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import {
  getSessions,
  createSession,
  endSession,
  getAttendanceRecords,
  type AttendanceSession,
  type AttendanceRecord,
  type PaginatedResponse
} from '@/client/api.ts';
import { getCourses, type Course } from '@/client/api.ts';
import Filter from '@/components/common/Filter.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { useUIStore } from '@/client/stores/ui.ts';

const uiStore = useUIStore();
const sessions = ref<AttendanceSession[]>([]);
const courses = ref<Course[]>([]);
const sessionAttendance = ref<Record<number, AttendanceRecord[]>>({});
const newSessionName = ref('');
const selectedCourseId = ref<number | null>(null);
const error = ref('');
const selectedSession = ref<AttendanceSession | null>(null);
const isLoading = ref(false);

const filters = ref<{
  type: 'select' | 'search',
  label: string,
  value: any,
  items?: { title: string; value: number }[]
}[]>([
  {
    type: 'select',
    label: 'Select Course',
    value: selectedCourseId.value,
    items: []
  },
  {
    type: 'search',
    label: 'Session name (optional)',
    value: newSessionName.value
  }
]);

watch([selectedCourseId, newSessionName, courses], () => {
  filters.value[0].value = selectedCourseId.value;
  filters.value[0].items = courses.value.map(c => ({ title: c.name, value: c.id }));
  filters.value[1].value = newSessionName.value;
});

function handleFilterChange(values: any[]) {
  selectedCourseId.value = values[0];
  newSessionName.value = values[1];
}

const fetchSessions = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    const response = await getSessions();
    const data = response.data as PaginatedResponse<AttendanceSession>;
    sessions.value = data.results;

    // Fetch attendance records for each session
    for (const session of sessions.value) {
      const attendanceResponse = await getAttendanceRecords({ session: session.id });
      sessionAttendance.value[session.id] = attendanceResponse.data.results;
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load sessions';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
};

const fetchCourses = async () => {
  try {
    const response = await getCourses();
    courses.value = response.data.results;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load courses';
    uiStore.showError(error.value);
  }
};

const handleStartSession = async () => {
  error.value = '';
  if (!selectedCourseId.value) {
    error.value = 'Please select a course';
    uiStore.showError(error.value);
    return;
  }
  try {
    isLoading.value = true;
    await createSession({
      name: newSessionName.value,
      course: selectedCourseId.value
    });
    newSessionName.value = '';
    selectedCourseId.value = null;
    await fetchSessions();
    uiStore.showSuccess('Session started successfully');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to start session';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
};

const handleEndSession = async (id: number) => {
  error.value = '';
  try {
    isLoading.value = true;
    await endSession(id);
    await fetchSessions();
    uiStore.showSuccess('Session ended successfully');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to end session';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dt: string) => {
  if (!dt) return '';
  return new Date(dt).toLocaleString();
};

const openAttendanceModal = (session: AttendanceSession) => {
  selectedSession.value = session;
};

const closeModal = () => {
  selectedSession.value = null;
};

const calculateDuration = (session: AttendanceSession) => {
  if (!session.start_time) return 'N/A';
  const start = new Date(session.start_time);
  const end = session.end_time ? new Date(session.end_time) : new Date();
  const duration = end.getTime() - start.getTime();
  const minutes = Math.floor(duration / (1000 * 60));
  return `${minutes} minutes`;
};

const getCourseInfo = (courseId: number) => {
  const course = courses.value.find(c => c.id === courseId);
  return course ? `${course.code} - ${course.name}` : 'Unknown Course';
};

// Add body scroll lock when modal is open
watch(selectedSession, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(async () => {
  await Promise.all([
    fetchSessions(),
    fetchCourses()
  ]);
});
</script>

<style lang="scss">
@use '../../styles/theme/index' as theme;

.sessions-view {
  padding: theme.$spacing-xl;
  background-color: theme.$theme-surface-0;
  min-height: 100vh;
  font-family: theme.$font-family-primary;
}

.view-header {
  margin-bottom: theme.$spacing-xl;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: theme.$spacing-lg;
}

.header-title {
  color: theme.$theme-text-primary;
  font-size: theme.$font-size-2xl;
  font-weight: theme.$font-weight-bold;
  margin: 0;
}

.session-form {
  display: flex;
  gap: theme.$spacing-md;
  align-items: center;
}

.course-select {
  width: 250px;
}

.session-input {
  width: 300px;
}

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: theme.$spacing-lg;
}

.session-card {
  background-color: theme.$theme-surface-1;
  color: theme.$theme-text-primary;
  transition: transform theme.$theme-transition-fast, box-shadow theme.$theme-transition-fast;
  cursor: pointer;
  border-radius: theme.$border-radius-lg;
  box-shadow: 0 2px 8px theme.$theme-shadow-color;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px theme.$theme-shadow-color;
  }
}

.status-chip {
  font-size: theme.$font-size-xs;
  font-weight: theme.$font-weight-medium;
}

.session-info {
  margin-top: theme.$spacing-md;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: theme.$spacing-xs;
  font-size: theme.$font-size-sm;
}

.info-label {
  color: theme.$theme-text-secondary;
}

.info-value {
  color: theme.$theme-text-primary;
  font-weight: theme.$font-weight-medium;
}

.view-details {
  margin-top: theme.$spacing-md;
  color: theme.$theme-text-secondary;
  font-size: theme.$font-size-sm;
  text-align: right;
}

.end-btn {
  color: theme.$theme-error;
}

.error-alert {
  margin-top: theme.$spacing-lg;
}

.attendance-dialog {
  background-color: theme.$theme-surface-1;
  color: theme.$theme-text-primary;
}

.close-btn {
  color: theme.$theme-text-secondary;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: theme.$spacing-md;
  margin-bottom: theme.$spacing-lg;
}

.stat-card {
  background-color: theme.$theme-surface-0;
  border: 1px solid theme.$theme-border-medium;
}

.stat-label {
  color: theme.$theme-text-secondary;
  font-size: theme.$font-size-sm;
  margin-bottom: theme.$spacing-xs;
}

.stat-value {
  color: theme.$theme-text-primary;
  font-size: theme.$font-size-xl;
  font-weight: theme.$font-weight-bold;
}

.attendance-list {
  background-color: transparent;
}

.attendance-item {
  background-color: theme.$theme-surface-0;
  margin-bottom: theme.$spacing-xs;
  border-radius: theme.$border-radius-md;
}

.student-avatar {
  font-weight: theme.$font-weight-medium;
}

.student-name {
  color: theme.$theme-text-primary;
  font-weight: theme.$font-weight-medium;
}

.student-number {
  color: theme.$theme-text-secondary;
}

.timestamp {
  color: theme.$theme-text-secondary;
  font-size: theme.$font-size-sm;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .session-form {
    flex-direction: column;
  }

  .course-select,
  .session-input {
    width: 100%;
  }

  .sessions-grid {
    grid-template-columns: 1fr;
  }
}

// Improve input and select contrast in dark mode
.course-select .v-input__control,
.session-input .v-input__control {
  background: theme.$theme-surface-2;
  color: theme.$theme-text-primary;
  border-radius: theme.$border-radius-md;
  border: 1px solid theme.$theme-border-light;

  @include theme.theme-dark {
    background: theme.$theme-surface-1;
    color: theme.$theme-text-primary;
    border: 1px solid theme.$theme-border-medium;
  }
}

.course-select input,
.session-input input,
.course-select .v-field__input,
.session-input .v-field__input {
  background: transparent;
  color: theme.$theme-text-primary;
}

.course-select .v-label,
.session-input .v-label {
  color: theme.$theme-text-secondary;
}
</style>
