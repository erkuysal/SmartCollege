<template>
  <div class="attendance-records">
    <PageHeader title="Attendance Records">
      <template #subtitle>
        View and manage detailed attendance records
      </template>
      <v-btn
        color="primary"
        prepend-icon="mdi-refresh"
        @click="fetchRecords"
        :loading="isLoading"
      >
        Refresh
      </v-btn>
    </PageHeader>

    <!-- Filters -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filters.date"
              label="Date"
              type="date"
              @update:model-value="fetchRecords"
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
              @update:model-value="fetchRecords"
              clearable
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Records Table -->
    <v-card>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="records"
          :loading="isLoading"
          :items-per-page="10"
          :items-per-page-options="[10, 20, 50, 100]"
          class="elevation-1"
        >
          <!-- Student Name Column -->
          <template v-slot:item.student="{ item }">
            {{ item.student.first_name }} {{ item.student.last_name }}
          </template>

          <!-- Timestamp Column -->
          <template v-slot:item.timestamp="{ item }">
            {{ formatDateTime(item.timestamp) }}
          </template>

          <!-- Actions Column -->
          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-eye"
              variant="text"
              size="small"
              color="primary"
              @click="viewRecord(item)"
            ></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Record Details Dialog -->
    <v-dialog v-model="showRecordDialog" max-width="600px">
      <v-card v-if="selectedRecord">
        <v-card-title class="text-h5">
          Attendance Record Details
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-account</v-icon>
              </template>
              <v-list-item-title>Student</v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedRecord.student.first_name }} {{ selectedRecord.student.last_name }}
                ({{ selectedRecord.student.user_number }})
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-clock</v-icon>
              </template>
              <v-list-item-title>Timestamp</v-list-item-title>
              <v-list-item-subtitle>
                {{ formatDateTime(selectedRecord.timestamp) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-book-open-variant</v-icon>
              </template>
              <v-list-item-title>Session</v-list-item-title>
              <v-list-item-subtitle>
                {{ getSessionName(selectedRecord.session) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showRecordDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAttendanceStore } from '@/client/stores/attendance'
import { useSessionsStore } from '@/client/stores/sessions'
import type { AttendanceRecord, AttendanceSession } from '@/client/api'
import PageHeader from '@/components/common/PageHeader.vue'

const attendanceStore = useAttendanceStore()
const sessionsStore = useSessionsStore()

// State
const isLoading = ref(false)
const showRecordDialog = ref(false)
const selectedRecord = ref<AttendanceRecord | null>(null)
const filters = ref({
  date: '',
  session: null as number | null
})

// Headers for the data table
const headers = [
  { title: 'Student', key: 'student', sortable: true },
  { title: 'Session', key: 'session', sortable: true },
  { title: 'Timestamp', key: 'timestamp', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Computed properties
const records = computed(() => attendanceStore.records)
const sessions = computed(() => sessionsStore.sessions)

// Methods
const fetchRecords = async () => {
  isLoading.value = true
  try {
    const params: { timestamp_date?: string; session?: number } = {}
    if (filters.value.date) {
      params.timestamp_date = filters.value.date
    }
    if (filters.value.session) {
      params.session = filters.value.session
    }
    await attendanceStore.fetchRecords(params)
  } catch (error) {
    console.error('Error fetching records:', error)
  } finally {
    isLoading.value = false
  }
}

const viewRecord = (record: AttendanceRecord) => {
  selectedRecord.value = record
  showRecordDialog.value = true
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

const getSessionName = (sessionId: number) => {
  const session = sessions.value.find(s => s.id === sessionId)
  return session ? session.name : 'Unknown Session'
}

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([
    fetchRecords(),
    sessionsStore.fetchSessions()
  ])
})
</script>

<style scoped>
.attendance-records {
  padding: 20px;
}

.v-data-table {
  background: transparent !important;
}
</style> 