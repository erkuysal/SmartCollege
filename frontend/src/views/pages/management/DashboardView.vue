<template>
  <v-container fluid>
    <v-row>
      <!-- Summary Cards -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto">
          <v-card-text>
            <div class="text-h4 mb-2">{{ studentCount }}</div>
            <div class="text-caption">Total Students</div>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="text" :to="{ name: 'students' }">
              View Students
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto">
          <v-card-text>
            <div class="text-h4 mb-2">{{ teacherCount }}</div>
            <div class="text-caption">Total Lecturers</div>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="text" :to="{ name: 'lecturers' }">
              View Lecturers
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto">
          <v-card-text>
            <div class="text-h4 mb-2">{{ courseCount }}</div>
            <div class="text-caption">Active Courses</div>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="text" :to="{ name: 'courses' }">
              View Courses
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto">
          <v-card-text>
            <div class="text-h4 mb-2">{{ classroomCount }}</div>
            <div class="text-caption">Total Classrooms</div>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="text" :to="{ name: 'classrooms' }">
              View Classrooms
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity or Schedule -->
    <v-row class="mt-4">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Today's Schedule</v-card-title>
          <v-card-text>
            <v-list v-if="todaySchedules.length > 0">
              <v-list-item
                v-for="schedule in todaySchedules"
                :key="schedule.id"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-clock-outline</v-icon>
                </template>
                <v-list-item-title>
                  {{ schedule.course?.name || 'Unknown Course' }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatTime(schedule.start_time) }} - {{ formatTime(schedule.end_time) }}
                  | Room: {{ schedule.classroom?.name || 'Unknown Room' }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <div v-else class="text-center pa-4">
              <p>No schedules for today</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Quick Actions</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(action, index) in quickActions"
                :key="index"
                :to="action.route"
                link
              >
                <template v-slot:prepend>
                  <v-icon>{{ action.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ action.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useStudentStore } from '@/utils/stores/users/studentStore';
import { useLecturerStore } from '@/utils/stores/users/lecturerStore';
import { useCourseStore } from '@/utils/stores/college/courseStore';
import { useClassroomStore } from '@/utils/stores/college/classroomStore';
import { useScheduleStore } from '@/utils/stores/college/scheduleStore';
import type { PopulatedSchedule } from '@/utils/interfaces/college/scheduleInterface';

// Store instances
const studentStore = useStudentStore();
const lecturerStore = useLecturerStore();
const courseStore = useCourseStore();
const classroomStore = useClassroomStore();
const scheduleStore = useScheduleStore();

// Loading state
const isLoading = ref(true);

// Computed values for summary cards
const studentCount = computed(() => {
  return Array.isArray(studentStore.items) ? studentStore.items.length : 0;
});
const teacherCount = computed(() => {
  return Array.isArray(lecturerStore.items) ? lecturerStore.items.length : 0;
});
const courseCount = computed(() => {
  return Array.isArray(courseStore.items) ? courseStore.items.length : 0;
});
const classroomCount = computed(() => {
  return Array.isArray(classroomStore.classrooms) ? classroomStore.classrooms.length : 0;
});

// Get today's schedules
const todaySchedules = computed(() => {
  if (!Array.isArray(scheduleStore.schedules)) return [];
  
  const today = new Date().getDay();
  return scheduleStore.schedules
    .filter((schedule: PopulatedSchedule) => schedule && schedule.day_of_week === today)
    .sort((a: PopulatedSchedule, b: PopulatedSchedule) => 
      a.start_time.localeCompare(b.start_time));
});

// Upcoming schedules
const upcomingSchedules = computed(() => {
  if (!Array.isArray(scheduleStore.schedules)) return [];
  return scheduleStore.schedules.slice(0, 5);
});

// Format course name
function formatCourseName(schedule: PopulatedSchedule) {
  if (!schedule || !schedule.course) return 'Unknown Course';
  return `${schedule.course.name} - ${schedule.classroom ? schedule.classroom.name : 'No Classroom'}`;
}

// Format time
function formatTime(time: string) {
  if (!time) return '';
  try {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return time;
  }
}

// Format day
function formatDay(day: number) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day] || 'Unknown';
}

// Quick actions with correct route names
const quickActions = [
  { 
    title: 'Add New Student', 
    icon: 'mdi-account-plus', 
    route: { name: 'students', query: { action: 'add' } }
  },
  { 
    title: 'Add New Course', 
    icon: 'mdi-book-plus', 
    route: { name: 'courses', query: { action: 'add' } }
  },
  { 
    title: 'Take Attendance', 
    icon: 'mdi-clipboard-check', 
    route: { name: 'events' }
  },
  { 
    title: 'View Reports', 
    icon: 'mdi-chart-box', 
    route: { name: 'dashboard' }
  }
];

// Initial data loading
onMounted(async () => {
  isLoading.value = true;
  try {
    // Load each store separately to handle errors individually
    try {
      await studentStore.fetchStudents();
    } catch (error) {
      console.error('Error loading students:', error);
    }
    
    try {
      await lecturerStore.fetchLecturers();
    } catch (error) {
      console.error('Error loading lecturers:', error);
    }
    
    try {
      await courseStore.fetchCourses();
    } catch (error) {
      console.error('Error loading courses:', error);
    }
    
    try {
      await classroomStore.fetchClassrooms();
    } catch (error) {
      console.error('Error loading classrooms:', error);
    }
    
    try {
      await scheduleStore.fetchSchedules();
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.v-card {
  height: 100%;
}
</style>
