<template>
  <div class="overview-bg">
    <div class="overview-container">
      <div class="welcome-banner mb-6">
        <v-avatar size="40" class="me-3" color="primary">
          <v-icon size="28" color="white">mdi-account</v-icon>
        </v-avatar>
        <span>Welcome back!</span>
      </div>
      <h1 class="text-h4 mb-6">System Overview</h1>
      
      <v-row>
        <!-- Students Statistics -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card glass-card">
            <v-card-text class="d-flex align-center">
              <v-icon class="me-3" size="36" color="primary">mdi-account-group</v-icon>
              <div>
                <div class="text-h6">Total Students</div>
                <div class="text-h3">
                  <count-up :end-val="students.length" :duration="1.2" />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Lecturers Statistics -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card glass-card">
            <v-card-text class="d-flex align-center">
              <v-icon class="me-3" size="36" color="primary">mdi-account-tie</v-icon>
              <div>
                <div class="text-h6">Total Lecturers</div>
                <div class="text-h3">
                  <count-up :end-val="lecturers.length" :duration="1.2" />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Courses Statistics -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card glass-card">
            <v-card-text class="d-flex align-center">
              <v-icon class="me-3" size="36" color="primary">mdi-book-open-variant</v-icon>
              <div>
                <div class="text-h6">Active Courses</div>
                <div class="text-h3">
                  <count-up :end-val="courses.length" :duration="1.2" />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Classrooms Statistics -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card glass-card">
            <v-card-text class="d-flex align-center">
              <v-icon class="me-3" size="36" color="primary">mdi-door</v-icon>
              <div>
                <div class="text-h6">Available Classrooms</div>
                <div class="text-h3">
                  <count-up :end-val="classrooms.length" :duration="1.2" />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-divider class="my-8" />

      <v-row class="mt-6">
        <!-- Today's Sessions -->
        <v-col cols="12" md="6">
          <v-card class="glass-card">
            <v-card-title class="section-title">
              <v-icon class="me-2" color="primary">mdi-calendar-today</v-icon>
              Today's Sessions
            </v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item v-for="session in todaysSessions" :key="session.id">
                  <v-list-item-title>{{ session.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatTime(session.start_time) }} - {{ session.end_time ? formatTime(session.end_time) : 'Ongoing' }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="todaysSessions.length === 0">
                  <v-list-item-title>No sessions scheduled for today</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Recent Attendance -->
        <v-col cols="12" md="6">
          <v-card class="glass-card">
            <v-card-title class="section-title">
              <v-icon class="me-2" color="primary">mdi-account-check</v-icon>
              Recent Attendance
            </v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item v-for="record in recentAttendance" :key="record.id">
                  <v-list-item-avatar>
                    <v-avatar color="primary" size="32">
                      {{ record.student.first_name.charAt(0) }}{{ record.student.last_name.charAt(0) }}
                    </v-avatar>
                  </v-list-item-avatar>
                  <v-list-item-title>{{ record.student.first_name }} {{ record.student.last_name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ record.session.name }} - {{ formatDate(record.timestamp) }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="recentAttendance.length === 0">
                  <v-list-item-title>No recent attendance records</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStudentsStore } from '@/client/stores/students'
import { useLecturersStore } from '@/client/stores/lecturers'
import { useCoursesStore } from '@/client/stores/courses'
import { useClassroomsStore } from '@/client/stores/classrooms'
import { useSessionsStore } from '@/client/stores/sessions'
import { useAttendanceStore } from '@/client/stores/attendance'
import CountUp from 'vue-countup-v3'

const studentsStore = useStudentsStore()
const lecturersStore = useLecturersStore()
const coursesStore = useCoursesStore()
const classroomsStore = useClassroomsStore()
const sessionsStore = useSessionsStore()
const attendanceStore = useAttendanceStore()

// Fetch all data
studentsStore.fetchStudents()
lecturersStore.fetchLecturers()
coursesStore.fetchCourses()
classroomsStore.fetchClassrooms()
sessionsStore.fetchSessions()
attendanceStore.fetchRecords()

// Computed properties
const students = computed(() => studentsStore.students)
const lecturers = computed(() => lecturersStore.lecturers)
const courses = computed(() => coursesStore.courses)
const classrooms = computed(() => classroomsStore.classrooms)

const todaysSessions = computed(() => {
  const today = new Date()
  return sessionsStore.sessions.filter(session => {
    const sessionDate = new Date(session.start_time)
    return sessionDate.toDateString() === today.toDateString()
  })
})

const recentAttendance = computed(() => {
  return attendanceStore.records.slice(0, 5) // Get last 5 attendance records
})

// Utility functions
const formatTime = (time: string) => {
  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.overview-bg {
  min-height: 100dvh;
  background: linear-gradient(120deg, var(--v-theme-surface) 60%, var(--v-theme-primary-lighten2) 100%);
  padding: 0;
  overflow-x: hidden;
}

.overview-container {
  padding: 32px 16px 20px 16px;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}

.welcome-banner {
  display: flex;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 500;
  background: var(--v-theme-surface);
  color: var(--v-theme-on-surface);
  padding: 16px 32px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(60,60,60,0.07);
  border: 1px solid var(--v-theme-primary-lighten4);
}

.stat-card {
  background: none;
  box-shadow: none;
  border-radius: 18px;
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.glass-card {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 24px rgba(60, 60, 60, 0.10);
  border-radius: 18px;
  border: 1px solid var(--v-theme-primary-lighten5);
}

.stat-card:hover, .glass-card:hover {
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 8px 32px rgba(60, 60, 60, 0.16);
}

.text-h3 {
  font-size: 2.5rem;
  font-weight: 500;
  color: var(--v-theme-primary);
}

.section-title {
  font-weight: 600;
  font-size: 1.2rem;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
}

.v-divider {
  opacity: 0.15;
}

@media (max-width: 600px) {
  .overview-container {
    padding: 8px;
    max-width: 100vw;
  }
  .stat-card, .glass-card {
    border-radius: 10px;
  }
  .welcome-banner {
    font-size: 1rem;
    padding: 8px 12px;
    border-radius: 8px;
  }
}
</style> 