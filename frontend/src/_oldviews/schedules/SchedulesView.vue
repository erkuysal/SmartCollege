<template>
  <div class="schedules-view">
    <PageHeader
      title="Schedule Management"
      subtitle="View and manage class schedules"
      :actions="headerActions"
    />

    <!-- Filters -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filters.classroom"
              :items="classroomOptions"
              label="Classroom"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filters.day"
              :items="dayOptions"
              label="Day"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filters.search"
              label="Search Course/Section"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              @keyup.enter="applyFilters"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3" class="d-flex align-center">
            <v-btn
              color="primary"
              variant="text"
              @click="resetFilters"
              class="ml-auto"
            >
              Reset Filters
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Schedule Grid -->
    <v-card>
      <v-card-title class="px-4 py-3 d-flex align-center">
        <span>Class Schedule</span>
        <v-spacer></v-spacer>
        <v-btn 
          variant="text" 
          color="primary" 
          prepend-icon="mdi-calendar-month" 
          @click="viewMode = viewMode === 'grid' ? 'table' : 'grid'"
        >
          {{ viewMode === 'grid' ? 'Table View' : 'Grid View' }}
        </v-btn>
      </v-card-title>

      <v-card-text v-if="viewMode === 'grid'" class="pa-0">
        <!-- Schedule Grid View -->
        <v-container fluid class="pa-2">
          <div class="schedule-grid">
            <!-- Header Row -->
            <div class="schedule-header">
              <div class="time-column">Time Slot</div>
              <div v-for="day in days" :key="day.value" class="day-column">
                {{ day.title }}
              </div>
            </div>
            
            <!-- Time Slots -->
            <div v-for="(timeSlot, timeIndex) in timeSlots" :key="timeIndex" class="schedule-row">
              <div class="time-column">{{ timeSlot }}</div>
              
              <div v-for="day in days" :key="day.value" class="day-column">
                <v-card 
                  v-for="schedule in getScheduleForDayAndTime(day.value, timeSlot)" 
                  :key="schedule.id"
                  color="primary-lighten-5"
                  class="schedule-card mb-1"
                  :to="{ name: 'schedule-details', params: { id: schedule.id } }"
                >
                  <v-card-text class="pa-2">
                    <div class="text-subtitle-2 font-weight-medium">{{ schedule.section_name }}</div>
                    <div class="text-caption">{{ schedule.classroom_name }}</div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </div>
        </v-container>
      </v-card-text>

      <div v-else>
        <!-- Schedule Table View -->
        <v-data-table
          :headers="headers"
          :items="filteredSchedules"
          :loading="loading"
          :search="filters.search"
          :sort-by="[{ key: 'time_slot', order: 'asc' }]"
          class="elevation-0"
        >
          <!-- Course/Section -->
          <template v-slot:item.section_name="{ item }">
            <div class="font-weight-medium">{{ item.section_name }}</div>
            <div class="text-caption">{{ item.course_name }}</div>
          </template>

          <!-- Classroom -->
          <template v-slot:item.classroom_name="{ item }">
            <div>{{ item.classroom_name }}</div>
          </template>

          <!-- Time Slot -->
          <template v-slot:item.time_slot_display="{ item }">
            <v-chip
              color="primary"
              size="small"
              variant="outlined"
            >
              {{ item.time_slot_display }}
            </v-chip>
          </template>

          <!-- Actions -->
          <template v-slot:item.actions="{ item }">
            <div class="d-flex">
              <v-btn
                icon
                variant="text"
                size="small"
                color="primary"
                :to="{ name: 'schedule-details', params: { id: item.id } }"
              >
                <v-icon>mdi-eye</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                @click="editSchedule(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                color="error"
                @click="confirmDelete(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import PageHeader from '@/views/components/PageHeader.vue';
import apiClient from '@/utils/apiClient';
import { API_ROUTES } from '@/utils/config/apiRoutes';

// View mode
const viewMode = ref('grid'); // 'grid' or 'table'

// Data
const schedules = ref([]);
const loading = ref(true);
const classrooms = ref([]);

// Filters
const filters = ref({
  classroom: 'all',
  day: 'all',
  search: ''
});

// Time slots and days
const timeSlots = [
  '08:00-09:30',
  '10:00-11:30',
  '13:00-14:30',
  '15:00-16:30'
];

const days = [
  { title: 'Monday', value: 'Monday' },
  { title: 'Tuesday', value: 'Tuesday' },
  { title: 'Wednesday', value: 'Wednesday' },
  { title: 'Thursday', value: 'Thursday' },
  { title: 'Friday', value: 'Friday' }
];

// Table headers
const headers = [
  { title: 'Course/Section', key: 'section_name', sortable: true },
  { title: 'Classroom', key: 'classroom_name', sortable: true },
  { title: 'Time Slot', key: 'time_slot_display', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

// Header actions
const headerActions = [
  { 
    icon: 'mdi-plus', 
    text: 'Add Schedule',
    color: 'primary',
    handler: () => console.log('Add schedule')
  },
  { 
    icon: 'mdi-file-export', 
    text: 'Export', 
    variant: 'outlined',
    handler: () => console.log('Export schedules')
  }
];

// Computed properties
const classroomOptions = computed(() => {
  return [
    { title: 'All Classrooms', value: 'all' },
    ...classrooms.value.map(classroom => ({
      title: classroom.name,
      value: classroom.id
    }))
  ];
});

const dayOptions = computed(() => {
  return [
    { title: 'All Days', value: 'all' },
    ...days
  ];
});

const filteredSchedules = computed(() => {
  let result = [...schedules.value];
  
  if (filters.value.classroom !== 'all') {
    result = result.filter(item => item.classroom === filters.value.classroom);
  }
  
  if (filters.value.day !== 'all') {
    result = result.filter(item => {
      const timeSlotParts = item.time_slot_display.split(' ');
      return timeSlotParts[0] === filters.value.day;
    });
  }
  
  return result;
});

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([
    fetchSchedules(),
    fetchClassrooms()
  ]);
});

// Methods
async function fetchSchedules() {
  loading.value = true;
  try {
    const response = await apiClient.get(API_ROUTES.SCHEDULES_ROUTE);
    schedules.value = response.data;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    // Mock data for development
    schedules.value = [
      {
        "id": 1,
        "classroom": 1,
        "classroom_name": "Main-001",
        "section": 1,
        "section_name": "SCI100 - Section A (Fall 2024-2025)",
        "course_name": "Course 1 in Computer Science",
        "time_slot": 1,
        "time_slot_display": "Monday 08:00:00-09:30:00",
        "is_active": true,
        "notes": "Schedule for Course 1 in Computer Science"
      },
      {
        "id": 2,
        "classroom": 1,
        "classroom_name": "Main-001",
        "section": 2,
        "section_name": "SCI100 - Section B (Fall 2024-2025)",
        "course_name": "Course 1 in Computer Science",
        "time_slot": 2,
        "time_slot_display": "Monday 10:00:00-11:30:00",
        "is_active": true,
        "notes": "Schedule for Course 1 in Computer Science"
      }
    ];
  } finally {
    loading.value = false;
  }
}

async function fetchClassrooms() {
  try {
    const response = await apiClient.get(API_ROUTES.CLASSROOMS_ROUTE);
    classrooms.value = response.data;
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    // Mock data for development
    classrooms.value = [
      { id: 1, name: 'Main-001' },
      { id: 2, name: 'Main-002' }
    ];
  }
}

function getScheduleForDayAndTime(day, timeSlot) {
  return schedules.value.filter(schedule => {
    const [scheduleDay, scheduleTime] = schedule.time_slot_display.split(' ');
    return scheduleDay === day && scheduleTime.includes(timeSlot);
  });
}

function applyFilters() {
  // The computed property handles filtering
}

function resetFilters() {
  filters.value = {
    classroom: 'all',
    day: 'all',
    search: ''
  };
}

function editSchedule(item) {
  // Implement edit functionality
  console.log('Edit schedule:', item);
}

function confirmDelete(item) {
  // Implement delete confirmation
  console.log('Delete schedule:', item);
}
</script>

<style scoped>
.schedules-view {
  min-height: calc(100vh - 120px);
}

.schedule-grid {
  display: grid;
  grid-template-columns: 120px repeat(5, 1fr);
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.schedule-header {
  display: contents;
}

.schedule-header > div {
  font-weight: bold;
  background-color: #f5f5f5;
  padding: 12px 8px;
  text-align: center;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.schedule-row {
  display: contents;
}

.time-column, .day-column {
  padding: 8px;
  min-height: 100px;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.time-column {
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.day-column {
  vertical-align: top;
  position: relative;
}

.schedule-card {
  cursor: pointer;
  transition: all 0.2s;
}

.schedule-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style> 