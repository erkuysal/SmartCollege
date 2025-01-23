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
            <div class="text-caption">Total Staff</div>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="text" :to="{ name: 'staff' }">
              View Staff
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
            <v-list>
              <v-list-item
                v-for="schedule in todaySchedules"
                :key="schedule.id"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-clock-outline</v-icon>
                </template>
                <v-list-item-title>
                  {{ schedule.course.title }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatTime(schedule.start_time) }} - {{ formatTime(schedule.end_time) }}
                  | Room: {{ schedule.classroom.name }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
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
import { computed, onMounted } from 'vue';
import { useStudentStore } from '@/utils/stores/users/studentStore';
import { useTeacherStore } from '@/utils/stores/users/teacherStore';
import { useCourseStore } from '@/utils/stores/college/courseStore';
import { useClassroomStore } from '@/utils/stores/college/classroomStore';
import { useScheduleStore } from '@/utils/stores/college/scheduleStore';
import type { PopulatedSchedule } from '@/utils/interfaces/college/scheduleInterface';

// Store instances
const studentStore = useStudentStore();
const teacherStore = useTeacherStore();
const courseStore = useCourseStore();
const classroomStore = useClassroomStore();
const scheduleStore = useScheduleStore();

// Computed values for summary cards
const studentCount = computed(() => studentStore.students.length);
const teacherCount = computed(() => teacherStore.teachers.length);
const courseCount = computed(() => courseStore.courses.length);
const classroomCount = computed(() => classroomStore.classrooms.length);

// Get today's schedules
const todaySchedules = computed(() => {
  const today = new Date().getDay();
  return scheduleStore.schedules
    .filter(schedule => schedule.day_of_week === today)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
});

// Helper functions
function formatTime(time: string): string {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
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
  try {
    await Promise.all([
      studentStore.fetchStudents(),
      teacherStore.fetchTeachers(),
      courseStore.fetchCourses(),
      classroomStore.fetchClassrooms(),
      scheduleStore.fetchSchedules()
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
});
</script>

<style scoped>
.v-card {
  height: 100%;
}
</style>
