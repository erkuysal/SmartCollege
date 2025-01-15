<template>
  <v-container fluid>
    <!-- Page Header -->
    <v-row class="align-center mb-4">
      <v-col>
        <h1 class="text-h4">Classroom Management</h1>
        <!-- Optional subtitle -->
        <p class="text-subtitle-2 text-grey-darken-1">
          Manage all the classrooms in your college
        </p>
      </v-col>
      <v-col cols="auto" class="d-flex justify-end">
        <v-btn color="primary" variant="elevated" @click="openCreateDialog">
          <v-icon left>mdi-plus</v-icon>
          Add Classroom
        </v-btn>
      </v-col>
    </v-row>

    <!-- Stats Bar -->
    <v-row class="mb-4">
      <!-- Total Classrooms -->
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="1" class="p-4 d-flex flex-column align-center">
          <v-icon size="36" color="primary" class="mb-2"
          >mdi-office-building-outline</v-icon
          >
          <div class="text-h6">Total Classrooms</div>
          <div class="text-h5 font-weight-bold">{{ classrooms.length }}</div>
        </v-card>
      </v-col>

      <!-- Occupied Ratio (Example) -->
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="1" class="p-4 d-flex flex-column align-center">
          <v-icon size="36" color="success" class="mb-2">mdi-domain</v-icon>
          <div class="text-h6">Occupied Ratio</div>
          <!--
            Example:
            If you have a store getter called 'occupiedRatio'
            that returns a numeric value between 0 and 1, multiply by 100
            or adapt as needed.
          -->
          <div class="text-h5 font-weight-bold">
            {{ (occupiedRatio * 100).toFixed(1) }}%
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Search + View Toggle -->
    <v-row class="mb-3">
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Search Classrooms..."
          prepend-inner-icon="mdi-magnify"
          clearable
          density="compact"
        />
      </v-col>
      <v-col cols="auto" class="d-flex align-center justify-end">
        <v-btn
          variant="tonal"
          color="secondary"
          @click="toggleViewMode"
          :disabled="!filteredClassrooms.length"
        >
          <v-icon left>
            {{ viewMode === 'table' ? 'mdi-table' : 'mdi-cards-outline' }}
          </v-icon>
          Switch to {{ viewMode === 'table' ? 'Card' : 'Table' }} View
        </v-btn>
      </v-col>
    </v-row>

    <!-- Table View -->
    <v-card v-if="viewMode === 'table'">
      <v-data-table
        :headers="tableHeaders"
        :items="filteredClassrooms"
        class="elevation-1"
        :loading="isLoading"
        loading-text="Loading classrooms..."
      >
        <!-- Custom Name Cell -->
        <template #item.name="{ item }">
          <strong>{{ item.name }}</strong>
          <div class="caption text-grey-darken-2">ID: {{ item.id }}</div>
        </template>

        <!-- Capacity Cell -->
        <template #item.capacity="{ item }">
          <v-chip color="lighten-4" class="ma-1">{{ item.capacity }}</v-chip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <v-tooltip top>
            <template #activator="{ props }">
              <v-btn icon variant="text" v-bind="props" @click="openEditDialog(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Edit classroom</span>
          </v-tooltip>

          <v-tooltip top>
            <template #activator="{ props }">
              <v-btn
                icon
                variant="text"
                color="error"
                v-bind="props"
                @click="openDeleteDialog(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Delete classroom</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <!-- Card View -->
    <v-row v-else class="mb-4" style="gap: 16px;">
      <v-col
        v-for="classroom in filteredClassrooms"
        :key="classroom.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card elevation="1" class="d-flex flex-column">
          <v-img
            src="https://placeimg.com/400/200/arch"
            height="140"
            class="grey lighten-2"
            alt="Classroom"
          ></v-img>

          <v-card-title class="text-h6 d-flex align-center justify-space-between">
            {{ classroom.name }}
            <v-chip color="blue lighten-4" size="small"
            >{{ classroom.capacity }} cap</v-chip
            >
          </v-card-title>

          <v-card-text class="flex-grow-1">
            <div class="subtitle-2 text-grey-darken-1">
              ID: {{ classroom.id }}
            </div>
            <!-- Additional info here if you have it -->
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-tooltip top>
              <template #activator="{ props }">
                <v-btn icon v-bind="props" @click="openEditDialog(classroom)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Edit classroom</span>
            </v-tooltip>

            <v-tooltip top>
              <template #activator="{ props }">
                <v-btn
                  icon
                  color="error"
                  v-bind="props"
                  @click="openDeleteDialog(classroom)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>Delete classroom</span>
            </v-tooltip>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create / Edit Dialog -->
    <v-dialog v-model="dialogVisible" max-width="400">
      <v-card>
        <v-card-title>
          {{ isEditMode ? 'Edit Classroom' : 'Create Classroom' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="classroomForm" v-model="formValid">
            <v-text-field
              v-model="formData.name"
              label="Classroom Name"
              :rules="[v => !!v || 'Name is required']"
              required
            />
            <v-text-field
              v-model.number="formData.capacity"
              label="Capacity"
              type="number"
              :rules="[
                v => !!v || 'Capacity is required',
                v => v >= 0 || 'Cannot be negative',
              ]"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :disabled="!formValid"
            @click="saveClassroom"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialogVisible" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Delete Classroom</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          "<strong>{{ classroomToDelete?.name }}</strong>"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialogVisible = false">
            Cancel
          </v-btn>
          <v-btn color="error" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbarVisible" :timeout="2500" top right>
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useCollegeStore } from "@/utils/stores/classroomStore"

// Router (optional)
const router = useRouter()

// Pinia store
const classroomStore = useCollegeStore()
const { classrooms, isLoading, error } = storeToRefs(classroomStore)

// Occupied Ratio (example): If you have a store getter, use that instead
// Here, we'll mock it as a computed that returns 0.75 (75%)
const occupiedRatio = computed(() => 0.75)

// Search & View Mode
const searchQuery = ref('')
const viewMode = ref<'table' | 'card'>('table')

// Dialog states
const dialogVisible = ref(false)
const isEditMode = ref(false)
const formValid = ref(false)
const formData = ref({
  id: null as number | null,
  name: '',
  capacity: 0,
})

// Delete Dialog
const deleteDialogVisible = ref(false)
const classroomToDelete = ref<any>(null)

// Snackbar
const snackbarVisible = ref(false)
const snackbarMessage = ref('')

// Table Headers
const tableHeaders = [
  { text: 'ID', value: 'id' },
  { text: 'Name', value: 'name' },
  { text: 'Capacity', value: 'capacity' },
  { text: 'Actions', value: 'actions', sortable: false },
]

// Filtered List
const filteredClassrooms = computed(() => {
  if (!searchQuery.value) return classrooms.value
  const query = searchQuery.value.toLowerCase()
  return classrooms.value.filter((c) =>
    c.name.toLowerCase().includes(query) || String(c.id).includes(query),
  )
})

// Lifecycle: fetch data on mount
onMounted(async () => {
  await classroomStore.fetchClassrooms()
})

/**
 * Methods
 */
function toggleViewMode() {
  viewMode.value = (viewMode.value === 'table') ? 'card' : 'table'
}

function openCreateDialog() {
  dialogVisible.value = true
  isEditMode.value = false
  formData.value = { id: null, name: '', capacity: 0 }
}

function openEditDialog(classroom: any) {
  dialogVisible.value = true
  isEditMode.value = true
  formData.value = {
    id: classroom.id,
    name: classroom.name,
    capacity: classroom.capacity,
  }
}

function closeDialog() {
  dialogVisible.value = false
}

async function saveClassroom() {
  if (!formValid.value) return
  try {
    if (isEditMode.value && formData.value.id !== null) {
      await classroomStore.editClassroom(formData.value.id, {
        name: formData.value.name,
        capacity: formData.value.capacity,
      })
      snackbarMessage.value = `Classroom "${formData.value.name}" updated.`
    } else {
      await classroomStore.addClassroom({
        name: formData.value.name,
        capacity: formData.value.capacity,
      })
      snackbarMessage.value = `Classroom "${formData.value.name}" created.`
    }
    snackbarVisible.value = true
    dialogVisible.value = false
  } catch (err) {
    snackbarMessage.value = error.value || 'Error saving classroom.'
    snackbarVisible.value = true
  }
}

function openDeleteDialog(classroom: any) {
  classroomToDelete.value = classroom
  deleteDialogVisible.value = true
}

async function confirmDelete() {
  if (classroomToDelete.value) {
    try {
      await classroomStore.removeClassroom(classroomToDelete.value.id)
      snackbarMessage.value = `Classroom "${classroomToDelete.value.name}" deleted.`
      snackbarVisible.value = true
    } catch (err) {
      snackbarMessage.value = error.value || 'Error deleting classroom.'
      snackbarVisible.value = true
    } finally {
      deleteDialogVisible.value = false
      classroomToDelete.value = null
    }
  }
}
</script>

<style scoped>
/* Minimal additional styling for a clean look */
.v-card-subtitle,
.v-card-text {
  font-size: 0.9rem;
  color: #616161;
}
</style>
