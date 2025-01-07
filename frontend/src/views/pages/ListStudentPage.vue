<template>
  <v-container class="py-5">
    <h1 class="text-h4 mb-4">List Students</h1>

    <!-- Optional: show an error alert if something goes wrong -->
    <v-alert
      v-if="error"
      type="error"
      class="mb-4"
    >
      {{ error }}
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
      item-key="id"
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
          @click="deleteStudent(item.id)"
        >
          Delete
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useStudentStore } from '@/utils/stores/studentStore'

// Access the student store
const studentStore = useStudentStore()

// Destructure the store
const { students, loading, error, listAllStudents } = studentStore

/**
 * Table headers:
 * Each header has { text, value }.
 * 'actions' is a custom column for edit/delete buttons, so we set sortable: false.
 */
const headers = ref([
  { title: 'ID', key: 'id' },
  { title: 'Student Number', key: 'student_number'},
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
 * Edit student (placeholder)
 * Could navigate to an Edit page or open a dialog, etc.
 */
function editStudent(student: any) {
  console.log('Edit student:', student)
  // For example, you might route to an edit page:
  // router.push({ name: 'EditStudent', params: { id: student.id } })
}

/**
 * Delete student (placeholder)
 * Could confirm and call a store action, then remove from list.
 */
function deleteStudent(id: number) {
  console.log('Delete student with id:', id)
  // If your store has a deleteStudent action:
  // await studentStore.deleteStudent(id)
  // Then refetch or remove from store manually
}
</script>
