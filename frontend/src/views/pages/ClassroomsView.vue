<template>
  <v-container fluid class="py-4 px-4">
    <template v-if="!isChildRoute">
      <v-toolbar flat>
        <v-toolbar-title>
          <v-icon left class="mr-2">mdi-city-variant-outline</v-icon>
          <span class="text-h6">Classrooms</span>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <!-- View Toggle Button -->
        <v-btn color="primary" variant="tonal" @click="toggleViewMode">
          <v-icon left>
            {{ viewMode === 'table' ? 'mdi-view-grid' : 'mdi-table' }}
          </v-icon>
          Switch to {{ viewMode === 'table' ? 'Card' : 'Table' }} View
        </v-btn>

        <v-btn color="primary" @click="openAddClassroomDialog">
          <v-icon>mdi-plus</v-icon>
          Add Classroom
        </v-btn>

        <v-btn color="primary" @click="reloadClassrooms">
          <v-icon>mdi-refresh</v-icon>
          Refresh
        </v-btn>
      </v-toolbar>

      <!-- Table View -->
      <v-card v-if="viewMode === 'table'">
        <v-card-text>
          <!-- Error Alert -->
          <v-alert
            v-if="collegeStore.error"
            type="error"
            class="mb-4"
            border="start"
            elevation="2"
          >
            {{ collegeStore.error }}
          </v-alert>

          <!-- Loading Indicator -->
          <v-progress-linear
            v-if="collegeStore.isLoading"
            indeterminate
            color="primary"
            class="mb-4"
          />

          <!-- Data Table -->
          <v-data-table
            v-if="classrooms.length"
            :headers="headers"
            :items="classrooms"
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
                @click="editClassroom(item)"
              >
                Edit
              </v-btn>

              <v-btn
                variant="outlined"
                color="error"
                size="small"
                class="me-2"
                @click="deleteClassroom(item)"
              >
                Delete
              </v-btn>
            </template>
          </v-data-table>

          <!-- Placeholder -->
          <div v-else class="text-center text-caption mt-4">
            No classrooms found. Try refreshing or adding new classrooms.
          </div>
        </v-card-text>
      </v-card>

      <!-- Card View -->
      <v-row v-if="viewMode === 'card'" class="mt-4">
        <v-col
          v-for="classroom in classrooms"
          :key="classroom.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card elevation="2" class="mb-4 d-flex flex-column">
            <v-card-title class="text-h6 d-flex justify-space-between">
              {{ classroom.name }}
              <v-btn icon small @click="editClassroom(classroom)">
                <v-icon color="primary">mdi-pencil</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-subtitle>
              Capacity: {{ classroom.capacity }}
            </v-card-subtitle>
            <v-card-text>
              <div>
                Current Occupancy: {{ classroom.currentOccupancy }}/{{ classroom.capacity }}
              </div>
            </v-card-text>

            <v-card-actions class="mx-auto">
              <v-btn color="info" variant="text" @click="toClassroomDetails(classroom.id)">
                <v-icon left>mdi-information</v-icon>
                DETAILS
              </v-btn>
            </v-card-actions>

          </v-card>
        </v-col>
      </v-row>

      <!-- Add Classroom Modal -->
      <v-dialog v-model="addDialogVisible" max-width="600">
        <v-card>
          <v-card-title>Add Classroom</v-card-title>
          <v-card-text>
            <v-form ref="classroomForm" v-model="formValid">
              <v-text-field
                v-model="formData.name"
                label="Name"
                required
                :rules="[v => !!v || 'Name is required']"
              />
              <v-text-field
                v-model.number="formData.capacity"
                label="Capacity"
                type="number"
                required
                :rules="[v => !!v || 'Capacity is required']"
              />
            </v-form>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="outlined" @click="closeAddClassroomDialog">Cancel</v-btn>
            <v-btn
              color="primary"
              :disabled="!formValid"
              @click="addClassroom"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>

    <!-- Child Route View -->
    <router-view v-else />
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCollegeStore } from '@/utils/stores/classroomStore';

// Router and Route
const router = useRouter();
const route = useRoute();

// College Store
const collegeStore = useCollegeStore();

// Destructure the classrooms from the store
const classrooms = computed(() => collegeStore.classrooms);

// Headers for the data table
const headers = ref([
  { title: 'ID', key: 'id' },
  { title: 'Name', key: 'name' },
  { title: 'Capacity', key: 'capacity' },
  { title: 'Actions', key: 'actions', sortable: false },
]);

// Child route names
const childRouteNames = ['classroomDetails'];

function toClassroomDetails(classroomId: number) {
  if (!classroomId) {
    console.error('Classroom ID is required to navigate to details.');
    return;
  }

  router.push({ name: 'classroomDetails', params: { id: classroomId } });
}

// Determine if the current route is a child route
const isChildRoute = ref(false);

// Update `isChildRoute` when the route changes
watch(
  () => route.name,
  (newName) => {
    isChildRoute.value = childRouteNames.includes(newName || '');
  },
  { immediate: true }
);

// Fetch classrooms on mount
onMounted(async () => {
  await reloadClassrooms();
});

// Methods
async function reloadClassrooms() {
  await collegeStore.fetchClassrooms();
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'table' ? 'card' : 'table';
}

function openAddClassroomDialog() {
  resetForm();
  addDialogVisible.value = true;
}

function closeAddClassroomDialog() {
  addDialogVisible.value = false;
}

async function addClassroom() {
  try {
    await collegeStore.addClassroom({
      name: formData.value.name,
      capacity: formData.value.capacity,
    });
    closeAddClassroomDialog();
  } catch (err) {
    console.error('Error adding classroom:', err);
  }
}

function resetForm() {
  formData.value = {
    name: '',
    capacity: 0,
  };
}

function editClassroom(classroom) {
  router.push({ name: 'editClassroom', params: { id: classroom.id } });
}

async function deleteClassroom(classroom) {
  const confirmed = confirm(`Are you sure you want to delete "${classroom.name}"?`);
  if (confirmed) await collegeStore.removeClassroom(classroom.id);
}

// Add Classroom Modal
const addDialogVisible = ref(false);
const formValid = ref(false);
const formData = ref({
  name: '',
  capacity: null,
});

const viewMode = ref('card');
</script>

<style scoped>
.me-2 {
  margin-right: 8px;
}
</style>
