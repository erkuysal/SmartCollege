<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClassroomStore } from '../../utils/stores/college/classroomStore';
import { getNavItemColor } from '../../utils/navigation';
import { ScheduleFormDialog, ClassroomSchedule } from '@/components/schedule';
import type { Schedule } from '@/utils/interfaces/college/scheduleInterface';

const route = useRoute();
const router = useRouter();
const classroomStore = useClassroomStore();
const classroomColor = getNavItemColor('Classrooms');

// Room ID from route params
const classroomId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? parseInt(id, 10) : (typeof id === 'number' ? id : 0);
});

// Loading state and snackbar
const loading = ref(false);
const error = ref('');
const scheduleLoading = ref(false);

// Tab state
const activeTab = ref('schedule');

// Schedule dialog state
const showScheduleDialog = ref(false);
const editingSchedule = ref<Schedule | null>(null);
const scheduleRef = ref<InstanceType<typeof ClassroomSchedule> | null>(null);

// Computed property for classroom detail data
const classroom = computed(() => classroomStore.currentClassroom);
const schedules = computed(() => {
  const id = classroomId.value;
  return classroomStore.getSchedulesForClassroom(id);
});

// Utilization calculations
const utilizationPercentage = computed(() => {
  // Simple utilization calculation
  // Assuming 5 days per week with 22 time slots per day (8:00-18:00)
  const totalTimeSlots = 5 * 22; // Weekdays only
  
  // Counting utilized slots (simplified approach)
  let utilizedSlots = 0;
  
  // For now, just use the schedule count as a simple approximation
  // In reality, each schedule would span multiple time slots
  utilizedSlots = schedules.value.length * 4; // Assume average 2 hours (4 slots) per schedule
  
  // Cap at 100%
  const percentage = Math.min(Math.round((utilizedSlots / totalTimeSlots) * 100), 100);
  return percentage;
});

const utilizationMessage = computed(() => {
  const percentage = utilizationPercentage.value;
  if (percentage < 30) {
    return "This classroom is currently under-utilized. Consider scheduling more activities.";
  } else if (percentage < 70) {
    return "This classroom has a balanced utilization rate.";
  } else {
    return "This classroom is heavily utilized. Consider expanding availability or redistributing some sessions.";
  }
});

// Load classroom data
const loadClassroomData = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await classroomStore.fetchClassrooms(classroomId.value);
    if (!classroomStore.currentClassroom) {
      error.value = `Classroom with ID ${classroomId.value} not found`;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
};

// Load classroom schedules
const loadSchedules = async () => {
  scheduleLoading.value = true;
  
  try {
    await classroomStore.fetchClassroomSchedules(classroomId.value);
  } catch (err) {
    console.error('Error loading schedules:', err);
  } finally {
    scheduleLoading.value = false;
  }
};

// Handle edit button click
const handleEdit = () => {
  router.push(`/dashboard/classrooms/edit/${classroomId.value}`);
};

// Handle back button click
const handleBack = () => {
  router.push('/dashboard/classrooms');
};

// Handle opening the schedule dialog for adding a new schedule
const openAddScheduleDialog = () => {
  editingSchedule.value = null;
  showScheduleDialog.value = true;
};

// Handle opening the schedule dialog for editing an existing schedule
const openEditScheduleDialog = (schedule: Schedule) => {
  editingSchedule.value = schedule;
  showScheduleDialog.value = true;
};

// Handle schedule saved event
const handleScheduleSaved = () => {
  // Refresh the schedule component directly
  if (scheduleRef.value) {
    scheduleRef.value.refreshSchedule();
  } else {
    loadSchedules();
  }
};

// Get day name from day number
const getDayName = (dayNumber: number) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[(dayNumber - 1) % 7];
};

// Handle route query parameter for initial tab
onMounted(() => {
  // Check if there's a tab parameter in the URL
  const tabParam = route.query.tab as string;
  if (tabParam && ['schedule', 'details', 'utilization'].includes(tabParam)) {
    activeTab.value = tabParam;
  }
  
  loadClassroomData();
  loadSchedules();
});
</script>

<template>
  <div class="classroom-details">
    <!-- Schedule Form Dialog -->
    <schedule-form-dialog
      v-model="showScheduleDialog"
      :editing-schedule="editingSchedule"
      :classroom-id="classroomId"
      @saved="handleScheduleSaved"
    />

    <!-- Error message -->
    <v-alert v-if="error" type="error" class="mb-4">
      {{ error }}
      <div class="mt-2">
        <v-btn color="white" variant="text" @click="handleBack">
          Back to Classrooms
        </v-btn>
      </div>
    </v-alert>
    
    <!-- Loading state -->
    <v-skeleton-loader
      v-if="loading && !error"
      type="card, list-item-three-line, divider, table"
      class="mx-auto"
    ></v-skeleton-loader>
    
    <!-- Classroom details -->
    <div v-else-if="classroom && !error">
      <!-- Header with back button -->
      <div class="d-flex align-center mb-4">
        <v-btn
          icon
          class="mr-2"
          @click="handleBack"
          title="Back to classrooms"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <h1 class="text-h4 mb-0">{{ classroom.name }}</h1>
          <div class="d-flex align-center">
            <v-chip
              class="mr-2 mt-1"
              :color="classroom.is_active ? 'success' : 'error'"
              size="small"
            >
              {{ classroom.is_active ? 'ACTIVE' : 'INACTIVE' }}
            </v-chip>
            <v-chip
              v-if="classroom.is_in_use"
              class="mr-2 mt-1"
              color="warning"
              size="small"
            >
              IN USE
            </v-chip>
            <span class="text-caption text-medium-emphasis mt-1">
              {{ classroom.building }} | {{ classroom.department_name }} | Capacity: {{ classroom.capacity }}
            </span>
          </div>
        </div>
        <v-spacer></v-spacer>
        <v-btn
          :color="classroomColor"
          @click="handleEdit"
          prepend-icon="mdi-pencil"
          class="mr-2"
        >
          Edit Classroom
        </v-btn>
        <v-btn
          :color="classroomColor"
          @click="openAddScheduleDialog"
          prepend-icon="mdi-plus"
        >
          Add Schedule
        </v-btn>
      </div>
      
      <!-- Tab navigation -->
      <v-card>
        <v-tabs
          v-model="activeTab"
          :color="classroomColor"
          align-tabs="center"
        >
          <v-tab value="schedule">
            <v-icon class="mr-2">mdi-calendar-clock</v-icon>
            Schedule
          </v-tab>
          <v-tab value="details">
            <v-icon class="mr-2">mdi-information</v-icon>
            Details
          </v-tab>
          <v-tab value="utilization">
            <v-icon class="mr-2">mdi-chart-line</v-icon>
            Utilization
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <!-- Schedule Tab -->
          <v-window-item value="schedule">
            <classroom-schedule 
              ref="scheduleRef"
              :classroom-id="classroomId" 
              :color="classroomColor"
            />
          </v-window-item>

          <!-- Details Tab -->
          <v-window-item value="details">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-list>
                    <v-list-subheader>Basic Information</v-list-subheader>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon icon="mdi-door-open" :color="classroomColor" class="mr-2"></v-icon>
                      </template>
                      <v-list-item-title>Room Name</v-list-item-title>
                      <v-list-item-subtitle>{{ classroom.name }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon icon="mdi-office-building" :color="classroomColor" class="mr-2"></v-icon>
                      </template>
                      <v-list-item-title>Building</v-list-item-title>
                      <v-list-item-subtitle>{{ classroom.building }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon icon="mdi-domain" :color="classroomColor" class="mr-2"></v-icon>
                      </template>
                      <v-list-item-title>Department</v-list-item-title>
                      <v-list-item-subtitle>{{ classroom.department_name }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon icon="mdi-home-city" :color="classroomColor" class="mr-2"></v-icon>
                      </template>
                      <v-list-item-title>Facility</v-list-item-title>
                      <v-list-item-subtitle>{{ classroom.facility_name }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-list>
                    <v-list-subheader>Capacity & Features</v-list-subheader>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon icon="mdi-account-group" :color="classroomColor" class="mr-2"></v-icon>
                      </template>
                      <v-list-item-title>Capacity</v-list-item-title>
                      <v-list-item-subtitle>{{ classroom.capacity }} people</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon icon="mdi-television" :color="classroomColor" class="mr-2"></v-icon>
                      </template>
                      <v-list-item-title>Features</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip-group>
                          <v-chip v-if="classroom.has_projector" size="small" :color="classroomColor">Projector</v-chip>
                          <v-chip v-if="classroom.has_whiteboard" size="small" :color="classroomColor">Whiteboard</v-chip>
                          <span v-if="!classroom.has_projector && !classroom.has_whiteboard">No special features</span>
                        </v-chip-group>
                      </v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item v-if="classroom.notes">
                      <template v-slot:prepend>
                        <v-icon icon="mdi-note-text" :color="classroomColor" class="mr-2"></v-icon>
                      </template>
                      <v-list-item-title>Notes</v-list-item-title>
                      <v-list-item-subtitle>{{ classroom.notes }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card-text>
          </v-window-item>

          <!-- Utilization Tab -->
          <v-window-item value="utilization">
            <v-card-text class="text-center">
              <v-alert
                type="info"
                class="mb-4"
              >
                Classroom utilization statistics will be implemented in a future update.
              </v-alert>
              
              <div class="px-4 py-8">
                <h3 class="text-h6 mb-4">Current Utilization Overview</h3>
                <p class="text-body-1">
                  This classroom has {{ schedules.length }} scheduled sessions.
                </p>
                
                <v-progress-circular
                  :model-value="utilizationPercentage"
                  :color="classroomColor"
                  size="150"
                  width="15"
                  class="my-8"
                >
                  {{ utilizationPercentage }}%
                </v-progress-circular>
                
                <p class="text-body-1 mt-4">
                  {{ utilizationMessage }}
                </p>
              </div>
            </v-card-text>
          </v-window-item>
        </v-window>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.classroom-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.v-progress-circular {
  font-weight: 700;
  font-size: 24px;
}
</style> 