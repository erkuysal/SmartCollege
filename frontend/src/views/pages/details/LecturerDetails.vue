<template>
  <v-container fluid class="py-4 px-4">
    <v-toolbar flat>
      <v-btn icon class="mr-2" @click="router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>
        <span class="text-h6">{{ lecturer ? `${lecturer.first_name} ${lecturer.last_name}` : 'Lecturer Details' }}</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn color="primary" @click="editLecturer">
        <v-icon>mdi-pencil</v-icon>
        Edit
      </v-btn>
    </v-toolbar>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else-if="!lecturer">
      <v-col cols="12" class="text-center">
        <v-alert type="error">Lecturer not found</v-alert>
      </v-col>
    </v-row>

    <template v-else>
      <!-- Personal Information -->
      <v-row>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Personal Information</v-card-title>
            <v-card-text>
              <v-list lines="two">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-account</v-icon>
                  </template>
                  <v-list-item-title>Name</v-list-item-title>
                  <v-list-item-subtitle>{{ lecturer.first_name }} {{ lecturer.last_name }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-email</v-icon>
                  </template>
                  <v-list-item-title>Email</v-list-item-title>
                  <v-list-item-subtitle>{{ lecturer.email }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-briefcase</v-icon>
                  </template>
                  <v-list-item-title>Position</v-list-item-title>
                  <v-list-item-subtitle>{{ lecturer.position }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-domain</v-icon>
                  </template>
                  <v-list-item-title>Department</v-list-item-title>
                  <v-list-item-subtitle>{{ lecturer.department }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="lecturer.specialization">
                  <template v-slot:prepend>
                    <v-icon>mdi-school</v-icon>
                  </template>
                  <v-list-item-title>Specialization</v-list-item-title>
                  <v-list-item-subtitle>{{ lecturer.specialization }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="lecturer.office_location">
                  <template v-slot:prepend>
                    <v-icon>mdi-office-building</v-icon>
                  </template>
                  <v-list-item-title>Office Location</v-list-item-title>
                  <v-list-item-subtitle>{{ lecturer.office_location }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Assigned Courses -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title>Assigned Courses</v-card-title>
            <v-card-text v-if="!assignedCourses.length">
              <p>No courses assigned yet.</p>
            </v-card-text>
            <v-list v-else>
              <v-list-item v-for="course in assignedCourses" :key="course.id">
                <template v-slot:prepend>
                  <v-icon>mdi-book-open-variant</v-icon>
                </template>
                <v-list-item-title>{{ course.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ course.code }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- Schedule -->
          <v-card class="mt-4">
            <v-card-title>Schedule</v-card-title>
            <v-card-text v-if="!schedule.length">
              <p>No schedule available.</p>
            </v-card-text>
            <v-list v-else>
              <v-list-item v-for="(item, index) in schedule" :key="index">
                <template v-slot:prepend>
                  <v-icon>mdi-calendar-clock</v-icon>
                </template>
                <v-list-item-title>{{ getDayName(item.day_of_week) }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatTime(item.start_time) }} - {{ formatTime(item.end_time) }}
                  | {{ item.course_name }} | {{ item.classroom }} ({{ item.building }})
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- Office Hours -->
          <v-card class="mt-4">
            <v-card-title>Office Hours</v-card-title>
            <v-card-text v-if="!officeHours.length">
              <p>No office hours set.</p>
            </v-card-text>
            <v-list v-else>
              <v-list-item v-for="(hours, index) in officeHours" :key="index">
                <template v-slot:prepend>
                  <v-icon>mdi-clock-outline</v-icon>
                </template>
                <v-list-item-title>{{ getDayName(hours.day_of_week) }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatTime(hours.start_time) }} - {{ formatTime(hours.end_time) }}
                  | {{ hours.location }}
                  <v-chip
                    :color="hours.is_available ? 'success' : 'error'"
                    size="small"
                    class="ml-2"
                  >
                    {{ hours.is_available ? 'Available' : 'Unavailable' }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLecturerStore } from '@/utils/stores/users/lecturerStore';
import { useCourseStore } from '@/utils/stores/college/courseStore';
import type { Lecturer, LecturerSchedule, OfficeHours } from '@/utils/interfaces/users/lecturerInterface';
import type { Course } from '@/utils/interfaces/college/courseInterface';

const route = useRoute();
const router = useRouter();
const lecturerStore = useLecturerStore();
const courseStore = useCourseStore();

const loading = ref(false);
const lecturer = ref<Lecturer | null>(null);
const assignedCourses = ref<Course[]>([]);
const schedule = ref<LecturerSchedule[]>([]);
const officeHours = ref<OfficeHours[]>([]);

function editLecturer() {
  if (lecturer.value) {
    router.push({
      name: 'edit-lecturer',
      params: { id: lecturer.value.id }
    });
  }
}

function getDayName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || 'Unknown';
}

function formatTime(time: string): string {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(async () => {
  const lecturerId = parseInt(route.params.id as string);
  if (isNaN(lecturerId)) {
    return;
  }

  loading.value = true;
  try {
    await lecturerStore.fetchLecturerById(lecturerId);
    lecturer.value = lecturerStore.selectedItem;

    if (lecturer.value) {
      // Fetch assigned courses
      await lecturerStore.fetchAssignedCourses(lecturerId);
      assignedCourses.value = lecturerStore.assignedCourses.map(assignment => {
        return {
          id: assignment.course_id,
          name: assignment.course_name,
          code: assignment.course_code
        } as Course;
      });

      // Fetch schedule
      await lecturerStore.fetchLecturerSchedule(lecturerId);
      schedule.value = lecturerStore.schedule;

      // Fetch office hours
      await lecturerStore.fetchOfficeHours(lecturerId);
      officeHours.value = lecturerStore.officeHours;
    }
  } catch (error) {
    console.error('Error loading lecturer details:', error);
  } finally {
    loading.value = false;
  }
});
</script> 