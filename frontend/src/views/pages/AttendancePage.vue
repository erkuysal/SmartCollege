<template>
  <v-container>
    <v-card>
      <v-card-title>Class Attendance</v-card-title>
      <v-card-subtitle>Track attendance in real-time</v-card-subtitle>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="attendanceData"
          class="elevation-1"
          item-value="id"
          dense
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Attendance List</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="fetchAttendance">
                Refresh
              </v-btn>
            </v-toolbar>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const headers = [
  { text: "Student ID", value: "student_id" },
  { text: "Name", value: "name" },
  { text: "Time", value: "timestamp" },
  { text: "Status", value: "status" },
];

const attendanceData = ref([]);

const fetchAttendance = async () => {
  try {
    const response = await axios.get('/api/attendance/');
    attendanceData.value = response.data;
  } catch (error) {
    console.error('Error fetching attendance:', error);
  }
};

onMounted(fetchAttendance);
</script>
