<!-- views/admin/StudentList.vue -->
<template>
  <!-- RFID Writing Snackbar -->
  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    timeout="3000"
    top
  >
    {{ snackbar.message }}
    <v-btn @click="snackbar.show = false">
      Close
    </v-btn>
  </v-snackbar>

  <v-card class="mt-4">
    <v-card-title class="d-flex flex-column flex-md-row justify-space-between align-center">
      <div class="d-flex align-center">
        <v-icon
          class="me-2"
          size="28"
        >
          mdi-account-group
        </v-icon>
        <span class="text-h6">Students</span>
      </div>
      <v-text-field
        v-model="search"
        label="Search Students"
        append-icon="mdi-magnify"
        clearable
        class="mt-4 mt-md-0"
        style="max-width: 300px;"
        @input="filterStudents"
      />
    </v-card-title>

    <v-divider />

    <v-card-text>
      <v-row class="mb-3">
        <v-col
          cols="12"
          sm="6"
        >
          <v-btn
            color="primary"
            variant="tonal"
            @click="goToRegister"
          >
            Add New Student
          </v-btn>
        </v-col>
      </v-row>

      <!-- Corrected v-data-table -->
      <v-data-table
        :headers="headers"
        :items="filteredStudents"
        :search="search"
      >
        <!-- Slot for Full Name -->
        <template #item.fullName="{ item }">
          {{ item.firstName }} {{ item.lastName }}
        </template>

        <!-- Slot for Actions -->
        <template #item.actions="{ item }">
          <v-btn
            icon
            color="primary"
            aria-label="Edit Student"
            @click="openEditDialog(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            color="error"
            aria-label="Delete Student"
            @click="deleteStudent(item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-btn
            icon
            color="secondary"
            aria-label="Write to RFID Card"
            @click="writeRFIDCard(item)"
          >
            <v-icon>mdi-credit-card-edit</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>

  <!-- Edit Student Dialog -->
  <v-dialog
    v-model="editDialog"
    max-width="500px"
  >
    <v-card>
      <v-card-title class="text-center">
        <v-icon class="me-2">
          mdi-pencil
        </v-icon>
        Edit Student
      </v-card-title>
      <v-divider />

      <v-card-text>
        <v-form @submit.prevent="onEditSubmit">
          <v-text-field
            v-model="editData.firstName"
            label="First Name"
            required
          />
          <v-text-field
            v-model="editData.lastName"
            label="Last Name"
            required
          />
          <v-text-field
            v-model="editData.email"
            label="Email"
            type="email"
            required
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="editDialog = false">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="onEditSubmit"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Define the structure of a Student
interface Student {
  id: number
  studentNumber: string
  firstName: string
  lastName: string
  email: string
}

// Dummy local data (Replace with API or store data as needed)
const students = ref<Student[]>([
  { id: 1, studentNumber: 'K2025000', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
  { id: 2, studentNumber: 'K2025001', firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com' },
  { id: 3, studentNumber: 'K2025002', firstName: 'Carol', lastName: 'Miller', email: 'carol@example.com' },
  // Add more students as needed
])

const router = useRouter()

const search = ref('')

// Define the table headers
const headers = [
  { text: 'Student ID', value: 'id' },
  { text: 'Student NO', value: 'studentNumber' },
  { text: 'Full Name', value: 'fullName' },
  { text: 'Email', value: 'email' },
  { text: 'Actions', value: 'actions', sortable: false },
]

// Computed property for filtered students based on search
const filteredStudents = computed(() => {
  if (!search.value) return students.value
  const searchTerm = search.value.toLowerCase()
  return students.value.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm) ||
    student.email.toLowerCase().includes(searchTerm) ||
    student.studentNumber.toLowerCase().includes(searchTerm)
  )
})

// Navigate to the register student page
function goToRegister() {
  router.push({ name: 'RegisterStudent' })
}

// Edit dialog state and data
const editDialog = ref(false)
const editData = ref<Student>({
  id: 0,
  studentNumber: '',
  firstName: '',
  lastName: '',
  email: ''
})

// Open edit dialog and load student data
function openEditDialog(student: Student) {
  editData.value = { ...student }
  editDialog.value = true
}

// Submit edited student data
function onEditSubmit() {
  const index = students.value.findIndex(s => s.id === editData.value.id)
  if (index !== -1) {
    students.value[index] = { ...editData.value }
    editDialog.value = false
    showSnackbar('Student updated successfully.', 'success')
  }
}

// Delete a student
function deleteStudent(student: Student) {
  if (confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
    const index = students.value.findIndex(s => s.id === student.id)
    if (index !== -1) {
      students.value.splice(index, 1)
      showSnackbar('Student deleted successfully.', 'error')
    }
  }
}

// Write to RFID Card
async function writeRFIDCard(student: Student) {
  try {
    // Make an API call to trigger writing to the RFID card
    const response = await fetch(`http://127.0.0.1:8000/api/students/write-to-card/${student.studentNumber}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // Simulate RFID card writing success
      console.log(`Writing RFID for: ${student.firstName} ${student.lastName} (ID: ${student.id})`);
      showSnackbar(`RFID card written successfully for ${student.firstName} ${student.lastName}.`, 'success');
    } else {
      const errorData = await response.json();
      console.error('Error writing RFID:', errorData);
      showSnackbar(`Failed to write RFID for ${student.firstName} ${student.lastName}.`, 'error');
    }
  } catch (error) {
    console.error('Error writing RFID:', error);
    showSnackbar(`An error occurred while writing the RFID card.`, 'error');
  }
}


// Snackbar for user feedback
const snackbar = ref({
  show: false,
  message: '',
  color: ''
})

function showSnackbar(message: string, color: string) {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.show = true
}
</script>

<style scoped>
.mt-4 {
  margin-top: 1rem;
}
.me-2 {
  margin-right: 0.5rem;
}
</style>
