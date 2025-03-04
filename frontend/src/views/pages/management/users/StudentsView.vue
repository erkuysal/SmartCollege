<template>
  <v-container fluid class="py-4 px-4">

    <template v-if="!isChildRoute">
      <v-toolbar flat>
        <v-toolbar-title>
          <v-icon left class="mr-2">mdi-account-group</v-icon>
          <span class="text-h6">Students</span>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn color="primary" @click="navigateToAddStudent" class="me-2">
          <v-icon>mdi-plus</v-icon>
          Add Student
        </v-btn>

        <v-btn color="primary" @click="reloadStudents">
          <v-icon>mdi-refresh</v-icon>
          Refresh
        </v-btn>
      </v-toolbar>

      <v-card>
        <!-- Card Text Body -->
        <v-card-text>
          <!-- Show an error alert if something goes wrong -->
          <v-alert
            v-if="studentStore.error"
            type="error"
            class="mb-4"
            border="start"
            elevation="2"
          >
            {{ studentStore.error }}
          </v-alert>

          <!-- Show a success/info alert if RFID was written -->
          <v-alert
            v-if="rfidMessage"
            type="success"
            class="mb-4"
            border="start"
            elevation="2"
          >
            {{ rfidMessage }}
          </v-alert>

          <!-- Debug info -->
          <v-alert
            type="info"
            class="mb-4"
            border="start"
            elevation="2"
          >
            Loading: {{ studentStore.loading }}<br>
            Items count: {{ studentStore.items ? studentStore.items.length : 0 }}<br>
            Items: {{ JSON.stringify(studentStore.items) }}
          </v-alert>

          <!-- Optional: a linear progress bar while loading -->
          <v-progress-linear
            v-if="studentStore.loading"
            indeterminate
            color="primary"
            class="mb-4"
          />

          <!-- The Data Table -->
          <v-data-table
            v-if="studentStore.items && studentStore.items.length"
            :headers="headers"
            :items="studentStore.items"
            :items-per-page="5"
            item-key="id"
            class="elevation-1"
          >
            <!-- Actions column -->
            <template #item.actions="{ item }">
              <v-btn
                variant="outlined"
                color="primary"
                size="small"
                class="me-2"
                @click="editStudent(item)"
              >
                Edit
              </v-btn>

              <v-btn
                variant="outlined"
                color="error"
                size="small"
                class="me-2"
                @click="handleDeleteStudent(item)"
              >
                Delete
              </v-btn>

              <v-btn
                variant="outlined"
                color="secondary"
                size="small"
                @click="handleAssignRFID(item)"
              >
                Write RFID
              </v-btn>
            </template>
          </v-data-table>

          <!-- If no students, show a placeholder text -->
          <div
            v-else
            class="text-center text-caption mt-4"
          >
            No students found. Try refreshing or adding new students.
          </div>
        </v-card-text>
      </v-card>
    </template>

    <router-view v-else/>

  </v-container>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStudentStore } from '@/utils/stores/users/studentStore';
import type { Student } from '@/utils/interfaces/users/studentInterface';

// Router and current route
const router = useRouter();
const route = useRoute();

// Pinia store
const studentStore = useStudentStore();

// Local state
const rfidMessage = ref<string | null>(null);

// Headers for the data table
const headers = ref([
  { title: 'Student #', key: 'student_number' },
  { title: 'First Name', key: 'first_name' },
  { title: 'Last Name', key: 'last_name' },
  { title: 'Email', key: 'email' },
  { title: 'Faculty', key: 'faculty_name' },
  { title: 'Status', key: 'student_status' },
  { title: 'Actions', key: 'actions', sortable: false },
]);

// Child route names
const childRouteNames = ['addStudent', 'editStudent'];

// Check if the current route is a child route
const isChildRoute = ref(route.name ? childRouteNames.includes(route.name as string) : false);

// Watch for route changes
watch(
  () => route.name,
  (newName) => {
    isChildRoute.value = newName ? childRouteNames.includes(newName as string) : false;
  }
);

// Reload students
async function reloadStudents() {
  console.log('Reloading students...');
  try {
    await studentStore.fetchStudents();
    console.log('Students loaded:', studentStore.items);
    
    // Add more detailed logging
    if (studentStore.items && studentStore.items.length > 0) {
      console.log('First student:', studentStore.items[0]);
      console.log('Student properties:', Object.keys(studentStore.items[0]));
    } else {
      console.log('No students found in the store');
    }
  } catch (error) {
    console.error('Error loading students:', error);
  }
}

// Navigation
function navigateToAddStudent() {
  router.push({ name: 'addStudent' });
}

// Other student actions
function editStudent(student: Student) {
  router.push({ name: 'editStudent', params: { id: student.id } });
}

async function handleDeleteStudent(student: Student) {
  const confirmed = window.confirm(`Delete student #${student.student_number}?`);
  if (confirmed) {
    try {
      await studentStore.deleteStudent(student.id);
      await reloadStudents();
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  }
}

async function handleAssignRFID(student: Student) {
  try {
    // Prompt for RFID card ID
    const cardId = prompt('Enter RFID card ID:');
    if (cardId) {
      await studentStore.assignRFIDCard(student.id, cardId);
      rfidMessage.value = `RFID card ${cardId} assigned to student ${student.student_number}`;
      setTimeout(() => {
        rfidMessage.value = null;
      }, 5000);
    }
  } catch (error) {
    console.error('Failed to assign RFID:', error);
  }
}

// Fetch data on mount
onMounted(() => {
  console.log('StudentsView mounted');
  reloadStudents();
});
</script>

<style scoped>
.me-2 {
  margin-right: 8px;
}
</style>
