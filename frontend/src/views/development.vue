<template>
  <v-container fluid class="fill-height">
    <v-row class="fill-height">
      <!-- Attendees List Section (75%) -->
      <v-col cols="12" md="9" class="pa-4">
        <!-- Loading Indicator -->
        <v-card v-if="loading" elevation="3" class="text-center pa-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p>Loading classroom details...</p>
        </v-card>

        <!-- Error Message -->
        <v-card v-else-if="error" elevation="3" class="text-center pa-4">
          <v-icon color="error" size="48">mdi-alert-circle</v-icon>
          <p>Classroom not found.</p>
          <v-btn color="primary" @click="goBack">
            <v-icon left>mdi-arrow-left</v-icon>
            Back to Classrooms
          </v-btn>
        </v-card>

        <!-- Classroom Details -->
        <v-card v-else elevation="3" class="pa-4">
          <!-- Toolbar -->
          <v-toolbar flat color="primary" dark>
            <v-toolbar-title>{{ classroom?.name || "Classroom" }}</v-toolbar-title>
            <v-divider vertical class="mx-2"></v-divider>
            <span>{{ selectedLog?.description || "Current Session" }}</span>
            <v-spacer></v-spacer>
            <v-btn color="secondary" @click="toggleLecture">
              <v-icon left>{{ classroom?.attendanceStarted ? 'mdi-stop' : 'mdi-play' }}</v-icon>
              {{ classroom?.attendanceStarted ? 'End Lecture' : 'Start Lecture' }}
            </v-btn>
          </v-toolbar>

          <!-- Sorting and Search -->
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="sortBy"
                  :items="['Student Number', 'Name', 'Email']"
                  label="Sort by"
                  outlined
                  dense
                  class="mb-2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="searchQuery"
                  label="Search attendees"
                  outlined
                  dense
                  clearable
                  class="mb-2"
                />
              </v-col>
            </v-row>
          </v-card-text>

          <!-- Real-Time Attendees or Past Logs -->
          <v-card-text class="scrollable">
            <v-data-table
              :headers="attendeeHeaders"
              :items="classroom?.attendanceStarted ? currentAttendees : paginatedAttendees"
              dense
              hide-default-footer
            >
              <template v-slot:top>
                <p>
                  <strong>
                    {{ classroom?.attendanceStarted ? "Current Attendees" : "Past Attendance Log" }}
                  </strong>
                </p>
              </template>
              <template v-slot:no-data>
                <div>No attendees available.</div>
              </template>
            </v-data-table>

            <!-- Pagination -->
            <v-pagination
              v-if="!classroom?.attendanceStarted && (filteredAttendees?.length || 0) > itemsPerPage"
              v-model="currentPage"
              :length="Math.ceil((filteredAttendees?.length || 0) / itemsPerPage)"
              class="mt-2"
              color="primary"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Attendance Logs Sidebar (25%) -->
      <v-col cols="12" md="3" class="pa-4">
        <v-card elevation="3" class="fill-height">
          <v-toolbar flat color="grey lighten-4">
            <v-toolbar-title>Attendance Logs</v-toolbar-title>
          </v-toolbar>

          <v-card-text class="scrollable">
            <v-list dense>
              <v-list-item
                v-for="log in attendanceLogs"
                :key="log.id"
                @click="selectLog(log)"
                :class="{ 'bg-primary lighten-4': selectedLog?.id === log.id }"
                class="hoverable-log"
              >
                <v-list-item-avatar>
                  <v-icon>mdi-calendar</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ log.timestamp }}</v-list-item-title>
                  <v-list-item-subtitle>{{ log.description }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-icon>
                  <v-icon color="primary">mdi-chevron-right</v-icon>
                </v-list-item-icon>
              </v-list-item>

              <v-list-item v-if="attendanceLogs.length === 0">
                <v-list-item-title>No attendance logs available.</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useClassroomsStore } from "@/utils/stores/classroomStore";

// Initialize Router and Store
const route = useRoute();
const router = useRouter();
const classroomsStore = useClassroomsStore();

// State
const classroom = ref(null);
const attendanceLogs = ref([]);
const currentAttendees = ref([]);
const selectedLog = ref(null);
const loading = ref(true);
const error = ref(false);

// Sorting, Search, and Pagination
const sortBy = ref("Student Number");
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 5;

// Table Headers
const attendeeHeaders = [
  { text: "Student Number", value: "studentNumber" },
  { text: "Name", value: "name" },
  { text: "Email", value: "email" },
];

// Filtered and Paginated Attendees
const filteredAttendees = computed(() => {
  const query = searchQuery.value.toLowerCase();
  const attendees = selectedLog?.value?.attendees || []; // Default to empty array
  return attendees.filter(
    (a) =>
      a.name.toLowerCase().includes(query) ||
      a.studentNumber.toLowerCase().includes(query) ||
      a.email.toLowerCase().includes(query)
  );
});

const paginatedAttendees = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredAttendees.value.slice(start, start + itemsPerPage);
});

// Fetch Classroom Details
const fetchClassroom = () => {
  loading.value = true;
  error.value = false;

  const classroomId = parseInt(route.params.id, 10);
  classroom.value = classroomsStore.getClassroomById(classroomId);

  if (classroom.value) {
    attendanceLogs.value = classroomsStore.getAttendanceLogs(classroomId);
    loading.value = false;
  } else {
    error.value = true;
    loading.value = false;
  }
};

// Start or End Lecture
const toggleLecture = () => {
  if (!classroom.value) return;
  classroom.value.attendanceStarted = !classroom.value.attendanceStarted;

  if (classroom.value.attendanceStarted) {
    // Simulate attendees
    currentAttendees.value = [
      { id: 1, studentNumber: "ST001", name: "John Doe", email: "johndoe@example.com" },
      { id: 2, studentNumber: "ST002", name: "Jane Smith", email: "janesmith@example.com" },
      { id: 3, studentNumber: "ST003", name: "Alice Johnson", email: "alicej@example.com" },
    ];
  } else {
    currentAttendees.value = [];
  }
};

// Select Attendance Log
const selectLog = (log) => {
  selectedLog.value = log;
  currentPage.value = 1;
};

// Refresh Attendees
const refreshAttendees = () => {
  console.log("Refreshing attendees...");
  // Example: Re-fetch attendees or perform necessary actions
};

// Navigate Back
const goBack = () => {
  router.push({ name: "Classrooms" });
};

// Lifecycle Hook
onMounted(() => {
  fetchClassroom();
});
</script>
