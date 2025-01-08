<template>
  <v-container class="py-5">
    <h1 class="text-h4 mb-4">List Students</h1>

    <!-- Show an error alert if something goes wrong -->
    <v-alert
      v-if="error"
      type="error"
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <!-- Show a success/info alert if RFID was written -->
    <v-alert
      v-if="rfidMessage"
      type="success"
      class="mb-4"
    >
      {{ rfidMessage }}
    </v-alert>

    <!-- Optional: a linear progress bar while loading -->
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <!-- The data table -->
    <v-data-table
      :headers="headers"
      :items="students"
      :items-per-page="5"
      item-key="student_number"
      class="elevation-1"
    >
      <!-- Toolbar in table header (optional) -->
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title>Student List</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-btn color="primary" @click="reloadStudents">
            Refresh
          </v-btn>
        </v-toolbar>
      </template>

      <!-- Actions column (edit/delete buttons, etc.) -->
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
          @click="handleWriteRFID(item)"
        >
          Write RFID
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useStudentStore } from '@/utils/stores/studentStore'
import type { Student } from '@/utils/interfaces/studentInterface'

// Access the student store
const studentStore = useStudentStore()

// Destructure the store
const {
  students,
  loading,
  error,
  rfidMessage,
  listAllStudents,
  deleteStudent,
  writeRFID,
} = studentStore

/**
 * Table headers:
 * Each header has { title, key }.
 * 'actions' is a custom column for edit/delete/rfid buttons, so we set sortable: false.
 */
const headers = ref([
  { title: 'Student #', key: 'student_number' },
  { title: 'First Name', key: 'first_name' },
  { title: 'Last Name', key: 'last_name' },
  { title: 'Email', key: 'email' },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
  },
])

/**
 * Fetch data when the component mounts
 */
onMounted(() => {
  reloadStudents()
})

/**
 * Manually fetch/refresh students
 */
function reloadStudents() {
  listAllStudents()
}

/**
 * Edit student (placeholder).
 * Could navigate to an Edit page or open a dialog, etc.
 */
function editStudent(student: Student) {
  console.log('Edit student:', student)
  // For example, you might route to an edit page:
  // router.push({ name: 'EditStudent', params: { student_number: student.student_number } })
}

/**
 * Delete student (calls the Pinia store action).
 */
async function handleDeleteStudent(student: Student) {
  // Optionally prompt for confirmation
  const confirmed = window.confirm(`Delete student #${student.student_number}?`)
  if (!confirmed) return

  try {
    await deleteStudent(student.student_number)
    // If the store removes the student locally, no further action is needed
  } catch (err) {
    console.error('Error deleting student:', err)
  }
}

/**
 * Write RFID data for the student (calls the Pinia store action).
 */
async function handleWriteRFID(student: Student) {
  try {
    await writeRFID(student.student_number)
    // rfidMessage is updated in the store, and displayed if not null
  } catch (err) {
    console.error('Error writing RFID:', err)
  }
}
</script>

<style scoped>
.me-2 {
  margin-right: 8px;
}
</style>
