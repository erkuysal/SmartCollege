<!-- views/admin/ClassroomList.vue -->
<template>
  <v-card class="mt-4">
    <v-card-title>
      <v-icon
        class="me-2"
        size="28"
      >
        mdi-book-education
      </v-icon>
      <span class="text-h6">Classrooms</span>
    </v-card-title>

    <v-divider />

    <v-card-text>
      <!-- Header row with 'Add Classroom' button -->
      <v-row class="mb-3">
        <v-col
          cols="12"
          sm="6"
        >
          <v-btn
            color="primary"
            @click="openAddDialog"
          >
            <v-icon
              left
              icon="mdi-plus-box"
              class="mr-3"
            />
            Add Classroom
          </v-btn>
        </v-col>
      </v-row>

      <!-- Classroom table -->
      <v-data-table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Students Enrolled</th>
            <th style="width: 130px;">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(classroom, index) in classrooms"
            :key="classroom.id"
          >
            <td>{{ classroom.id }}</td>
            <td>{{ classroom.name }}</td>
            <td>{{ classroom.students }}</td>
            <td>
              <v-btn
                icon
                color="primary"
                aria-label="Edit Classroom"
                @click="openEditDialog(index)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                color="error"
                aria-label="Delete Classroom"
                @click="deleteClassroom(index)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-data-table>
    </v-card-text>
  </v-card>

  <!-- Add Classroom Dialog -->
  <v-dialog
    v-model="addDialog"
    max-width="500px"
  >
    <v-card>
      <v-card-title class="text-center">
        <v-icon class="me-2">
          mdi-plus-box
        </v-icon>
        Add Classroom
      </v-card-title>
      <v-divider />

      <v-card-text>
        <v-form @submit.prevent="onAddSubmit">
          <v-text-field
            v-model="newClassroom.name"
            label="Classroom Name"
            required
          />
          <v-text-field
            v-model="newClassroom.students"
            label="Number of Students"
            type="number"
            required
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          @click="addDialog = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="onAddSubmit"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit Classroom Dialog -->
  <v-dialog
    v-model="editDialog"
    max-width="500px"
  >
    <v-card>
      <v-card-title class="text-center">
        <v-icon class="me-2">
          mdi-pencil
        </v-icon>
        Edit Classroom
      </v-card-title>
      <v-divider />

      <v-card-text>
        <v-form @submit.prevent="onEditSubmit">
          <v-text-field
            v-model="editData.name"
            label="Classroom Name"
            required
          />
          <v-text-field
            v-model="editData.students"
            label="Number of Students"
            type="number"
            required
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          class="mr-3"
          @click="editDialog = false"
        >
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
import { ref } from 'vue'

const classrooms = ref([
  { id: 1, name: 'Math 101', students: 30 },
  { id: 2, name: 'History 202', students: 25 },
  { id: 3, name: 'Science 303', students: 28 }
])

// ADD
const addDialog = ref(false)
const newClassroom = ref({ name: '', students: 0 })

function openAddDialog() {
  newClassroom.value = { name: '', students: 0 }
  addDialog.value = true
}

function onAddSubmit() {
  const newId = Date.now()
  classrooms.value.push({ id: newId, ...newClassroom.value })
  addDialog.value = false
}

// EDIT
const editDialog = ref(false)
const editData = ref({ id: null, name: '', students: 0 })
let editIndex = null

function openEditDialog(index) {
  editIndex = index
  editData.value = { ...classrooms.value[index] }
  editDialog.value = true
}

function onEditSubmit() {
  classrooms.value[editIndex] = { ...editData.value }
  editDialog.value = false
}

// DELETE
function deleteClassroom(index) {
  if (confirm('Are you sure you want to delete this classroom?')) {
    classrooms.value.splice(index, 1)
  }
}
</script>

<style scoped>
.mt-4 {
  margin-top: 1rem;
}
.mb-3 {
  margin-bottom: 1rem;
}
.me-2 {
  margin-right: 0.5rem;
}
</style>
