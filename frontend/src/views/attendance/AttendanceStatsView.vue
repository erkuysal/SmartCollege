<template>
  <div class="attendance-stats">
    <PageHeader title="Attendance Statistics">
      <template #subtitle>
        View attendance analytics and insights
      </template>
      <v-btn
        color="primary"
        prepend-icon="mdi-refresh"
        @click="fetchData"
        :loading="isLoading"
      >
        Refresh
      </v-btn>
    </PageHeader>

    <!-- Date Range Filter -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filters.startDate"
              label="Start Date"
              type="date"
              @update:model-value="fetchData"
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filters.endDate"
              label="End Date"
              type="date"
              @update:model-value="fetchData"
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filters.session"
              label="Session"
              :items="sessions"
              item-title="name"
              item-value="id"
              @update:model-value="fetchData"
              clearable
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="36" color="primary" class="me-3">mdi-account-group</v-icon>
              <div>
                <div class="text-h6">Total Records</div>
                <div class="text-h3">{{ totalRecords }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="36" color="primary" class="me-3">mdi-calendar-check</v-icon>
              <div>
                <div class="text-h6">Attendance Rate</div>
                <div class="text-h3">{{ attendanceRate }}%</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="36" color="primary" class="me-3">mdi-clock-outline</v-icon>
              <div>
                <div class="text-h6">Average Time</div>
                <div class="text-h3">{{ averageTime }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="36" color="primary" class="me-3">mdi-account-multiple</v-icon>
              <div>
                <div class="text-h6">Unique Students</div>
                <div class="text-h3">{{ uniqueStudents }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Attendance by Day</v-card-title>
          <v-card-text>
            <div class="chart-container">
              <!-- Add your preferred charting library here -->
              <div class="placeholder-chart">
                <p>Chart visualization coming soon...</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Attendance by Session</v-card-title>
          <v-card-text>
            <div class="chart-container">
              <!-- Add your preferred charting library here -->
              <div class="placeholder-chart">
                <p>Chart visualization coming soon...</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAttendanceStore } from '@/client/stores/attendance'
import { useSessionsStore } from '@/client/stores/sessions'
import type { AttendanceRecord } from '@/client/api'
import PageHeader from '@/components/common/PageHeader.vue'

const attendanceStore = useAttendanceStore()
const sessionsStore = useSessionsStore()

// State
const isLoading = ref(false)
const filters = ref({
  startDate: '',
  endDate: '',
  session: null as number | null
})

// Computed properties
const records = computed(() => attendanceStore.records)
const sessions = computed(() => sessionsStore.sessions)

const totalRecords = computed(() => records.value.length)

const attendanceRate = computed(() => {
  if (records.value.length === 0) return 0
  // This is a placeholder calculation. You might want to adjust this based on your requirements
  return Math.round((records.value.length / (sessions.value.length * 30)) * 100)
})

const averageTime = computed(() => {
  if (records.value.length === 0) return 'N/A'
  // This is a placeholder calculation. You might want to adjust this based on your requirements
  return '9:30 AM'
})

const uniqueStudents = computed(() => {
  const uniqueStudentIds = new Set(records.value.map(record => record.student.id))
  return uniqueStudentIds.size
})

// Methods
const fetchData = async () => {
  isLoading.value = true
  try {
    const params: { timestamp_date?: string; session?: number } = {}
    if (filters.value.startDate) {
      params.timestamp_date = filters.value.startDate
    }
    if (filters.value.session) {
      params.session = filters.value.session
    }
    await Promise.all([
      attendanceStore.fetchRecords(params),
      sessionsStore.fetchSessions()
    ])
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    isLoading.value = false
  }
}

// Lifecycle hooks
onMounted(fetchData)
</script>

<style scoped>
.attendance-stats {
  padding: 20px;
}

.stat-card {
  height: 100%;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-chart {
  text-align: center;
  color: #666;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  width: 100%;
}

.text-h3 {
  font-size: 2rem;
  font-weight: 500;
  color: var(--v-theme-primary);
}
</style> 