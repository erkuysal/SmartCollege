<template>
  <v-container>
    <v-card>
      <v-card-title>Access Control Logs</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="logs"
          class="elevation-1"
          dense
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Access Logs</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="fetchLogs">Refresh</v-btn>
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

const logs = ref([]);
const headers = [
  { text: "User ID", value: "user_id" },
  { text: "Name", value: "name" },
  { text: "Access Point", value: "access_point" },
  { text: "Time", value: "timestamp" },
];

const fetchLogs = async () => {
  try {
    const response = await axios.get('/api/access-logs/');
    logs.value = response.data;
  } catch (error) {
    console.error('Error fetching logs:', error);
  }
};

onMounted(fetchLogs);
</script>
