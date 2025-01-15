<template>
  <v-container fluid class="fill-height">
    <!-- Main Layout -->
    <v-row class="fill-height no-gutters">
      <!-- Left Section: Statistics (Hideable) -->
      <v-col
        v-if="showStatistics"
        cols="12"
        md="4"
        class="pa-4"
      >
        <v-card elevation="2" class="mb-4">
          <v-card-title>Occupancy Breakdown</v-card-title>
          <v-card-text>
            <canvas id="occupancyChart"></canvas>
          </v-card-text>
        </v-card>

        <v-card elevation="2" class="pa-4">
          <p>Total Classrooms: <strong>{{ classrooms.length }}</strong></p>
          <p>Average Occupancy: <strong>{{ classroomsStore.averageOccupancy }}%</strong></p>
          <p>High Occupancy (&gt;80%): <strong>{{ classroomsStore.highOccupancyCount }}</strong></p>
          <p>Medium Occupancy (50%-80%): <strong>{{ classroomsStore.mediumOccupancyCount }}</strong></p>
          <p>Low Occupancy (&lt;50%): <strong>{{ classroomsStore.lowOccupancyCount }}</strong></p>
          <p>Total Unused Capacity: <strong>{{ classroomsStore.totalUnusedCapacity }}</strong></p>
          <p>Most Utilized Classroom: <strong>{{ classroomsStore.mostUtilizedClassroom }}</strong></p>
          <p>Least Utilized Classroom: <strong>{{ classroomsStore.leastUtilizedClassroom }}</strong></p>
        </v-card>
      </v-col>

      <!-- Right Section: Classrooms Management -->
      <v-col
        :cols="showStatistics ? 8 : 12"
        class="pa-4 d-flex flex-column"
        style="overflow: hidden;"
      >
        <!-- Header Section with Toggle Statistics Button -->
        <v-row class="px-4 py-3">
          <v-col>
            <div class="d-flex align-center">
              <h1 class="mb-1">Classrooms</h1>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                variant="tonal"
                class="mr-3"
                @click="toggleViewMode"
              >
                <v-icon left>{{ viewMode === 'table' ? 'mdi-table' : 'mdi-view-grid' }}</v-icon>
                Switch to {{ viewMode === 'table' ? 'Card' : 'Table' }} View
              </v-btn>

              <v-btn
                color="primary"
                variant="elevated"
                @click="openCreateDialog"
              >
                <v-icon left>mdi-plus</v-icon>
                Add Classroom
              </v-btn>
            </div>
          </v-col>

          <!-- Toggle Statistics Button -->
          <v-col cols="12" class="d-flex justify-end">
            <v-btn
              color="secondary"
              variant="text"
              @click="toggleStatistics"
              class="ml-auto"
            >
              <v-icon left>{{ showStatistics ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
              {{ showStatistics ? 'Hide Statistics' : 'Show Statistics' }}
            </v-btn>
          </v-col>
        </v-row>

        <!-- Search and Filters -->
        <v-row class="px-4 mb-4">
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="search"
              label="Search Classrooms"
              placeholder="Type to filter..."
              hide-details
              outlined
              dense
              clearable
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-autocomplete
              v-model="occupancyFilter"
              :items="['All', 'High (>80%)', 'Medium (50%-80%)', 'Low (<50%)']"
              label="Filter by Occupancy"
              clearable
              outlined
              dense
            />
          </v-col>
        </v-row>

        <!-- Scrollable Content Area -->
        <div class="flex-grow-1" style="overflow-y: auto;">
          <!-- Table View -->
          <v-row v-if="viewMode === 'table'" class="px-4">
            <v-col cols="12">
              <v-card elevation="2">
                <v-data-table
                  :headers="vuetifyTableHeaders"
                  :items="filteredClassrooms"
                  :items-per-page="itemsPerPage"
                  :page.sync="currentPage"
                  class="elevation-1"
                >
                  <!-- Name Column with Details Icon -->
                  <template #item.name="{ item }">
                    <div class="d-flex align-center">
                      <span>{{ item.name }}</span>
                      <v-btn icon small @click="navigateToDetail(item.id)" class="ml-2" aria-label="View Details">
                        <v-icon color="primary">mdi-information</v-icon>
                      </v-btn>
                    </div>
                  </template>

                  <!-- Current Occupancy Column -->
                  <template #item.currentOccupancy="{ item }">
                    <div class="d-flex align-center" style="gap: 8px;">
                      <v-progress-circular
                        size="24"
                        width="4"
                        :value="getOccupancyPercentage(item)"
                        :color="getOccupancyColor(item)"
                      />
                      <span>{{ item.currentOccupancy }}/{{ item.capacity }}</span>
                    </div>
                  </template>

                  <!-- Attendance Status Column -->
                  <template #item.attendanceStatus="{ item }">
                    <v-chip :color="item.attendanceStarted ? 'green' : 'grey'" dark>
                      {{ item.attendanceStarted ? 'Activated' : 'Not Activated' }}
                    </v-chip>
                  </template>

                  <!-- Actions Column -->
                  <template #item.actions="{ item }">
                    <v-btn icon color="primary" variant="text" @click="openEditDialog(item)" aria-label="Edit Classroom">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon color="error" variant="text" @click="openDeleteDialog(item)" aria-label="Delete Classroom">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>

                <!-- Pagination and Items Per Page -->
                <v-card-actions>
                  <v-pagination
                    v-model="currentPage"
                    :length="totalPages"
                    total-visible="7"
                  />
                  <v-spacer></v-spacer>
                  <v-select
                    v-model="itemsPerPage"
                    :items="[5, 10, 15, 20]"
                    label="Items per page"
                    dense
                    outlined
                    class="mt-0"
                  />
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <!-- Card View -->
          <v-row v-if="viewMode === 'card'" class="px-4">
            <v-col
              v-for="classroom in paginatedClassrooms"
              :key="classroom.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card elevation="3" class="mb-4 d-flex flex-column">
                <!-- Occupancy Progress at the Top -->
                <v-progress-linear
                  :value="getOccupancyPercentage(classroom)"
                  :color="getOccupancyColor(classroom)"
                  height="6"
                  rounded
                />
                <v-img
                  src="https://placeimg.com/400/200/arch"
                  height="140"
                  class="mb-1"
                  contain
                ></v-img>

                <!-- Card Title with Details Icon -->
                <v-card-title class="text-h6 d-flex align-center justify-between">
                  <span>{{ classroom.name }}</span>
                  <v-btn icon small @click="navigateToDetail(classroom.id)" aria-label="View Details">
                    <v-icon color="primary">mdi-information</v-icon>
                  </v-btn>
                </v-card-title>

                <v-card-subtitle>
                  Capacity: {{ classroom.capacity }}
                </v-card-subtitle>
                <v-card-text class="flex-grow-1">
                  <div class="d-flex justify-space-between mb-1">
                    <span>Occupancy:</span>
                    <span>{{ classroom.currentOccupancy }}/{{ classroom.capacity }}</span>
                  </div>
                  <div class="mt-2">
                    <v-chip :color="classroom.attendanceStarted ? 'green' : 'grey'" dark>
                      {{ classroom.attendanceStarted ? 'Activated' : 'Not Activated' }}
                    </v-chip>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-menu>
                    <template #activator="{ attrs }">
                      <v-btn icon v-bind="attrs" @click.stop aria-label="More Actions">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="openEditDialog(classroom)">Edit</v-list-item>
                      <v-list-item @click="openDeleteDialog(classroom)">Delete</v-list-item>
                      <v-list-item @click="navigateToDetail(classroom.id)">Details</v-list-item> <!-- Optional Alternative -->
                    </v-list>
                  </v-menu>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>

    <!-- Snackbar Notifications -->
    <v-snackbar v-model="snackbarVisible" :timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialogVisible" max-width="500">
      <v-card>
        <v-card-title>
          {{ isEditMode ? 'Edit Classroom' : 'Create Classroom' }}
        </v-card-title>
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
            <v-text-field
              v-model.number="formData.currentOccupancy"
              label="Current Occupancy"
              type="number"
              :rules="[v => v >= 0 || 'Must be >= 0', v => v <= formData.capacity || 'Cannot exceed capacity']"
            />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="saveClassroom"
            :disabled="!formValid"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialogVisible" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ classroomToDelete?.name }}</strong>?
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="deleteDialogVisible = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useClassroomsStore } from '@/utils/stores/classroomStore.ts';
import Chart from 'chart.js/auto';

// Initialize Router
const router = useRouter();

// Initialize the Classrooms Store
const classroomsStore = useClassroomsStore();

// Destructure store's state using storeToRefs for reactivity
const { classrooms } = storeToRefs(classroomsStore);

// Reactive States
const showStatistics = ref(true); // Controls visibility of statistics section
const viewMode = ref('table'); // 'table' or 'card'
const search = ref('');
const occupancyFilter = ref('All');
const itemsPerPage = ref(5);
const currentPage = ref(1);
const snackbarVisible = ref(false);
const snackbarMessage = ref('');

// Headers for the Data Table
const headers = [
  {title: 'ID', key: 'id'},
  {title: 'Name', key: 'name'},
  {title: 'Capacity', key: 'capacity'},
  {title: 'Current Occupancy', key: 'currentOccupancy'},
  {title: 'Attendance Status', key: 'attendanceStatus'},
  {title: 'Actions', key: 'actions', sortable: false},
];

// Computed Properties
const vuetifyTableHeaders = computed(() =>
  headers.map((h) => ({
    text: h.title,
    value: h.key,
    sortable: h.sortable !== false,
  }))
);

const filteredClassrooms = computed(() => {
  let results = classrooms.value;

  if (search.value) {
    const query = search.value.toLowerCase();
    results = results.filter(
      (c) =>
        String(c.id).toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query)
    );
  }

  if (occupancyFilter.value === 'High (>80%)') {
    results = results.filter((c) => getOccupancyPercentage(c) > 80);
  } else if (occupancyFilter.value === 'Medium (50%-80%)') {
    results = results.filter(
      (c) => getOccupancyPercentage(c) >= 50 && getOccupancyPercentage(c) <= 80
    );
  } else if (occupancyFilter.value === 'Low (<50%)') {
    results = results.filter((c) => getOccupancyPercentage(c) < 50);
  }

  return results;
});

const paginatedClassrooms = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredClassrooms.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredClassrooms.value.length / itemsPerPage.value));

// Note: The following computed properties have been moved to the store as getters.
// If you wish to use them from the store, you can access them via `classroomsStore.<getterName>`.

// Methods
function getOccupancyPercentage(classroom) {
  if (!classroom.capacity) return 0;
  return ((classroom.currentOccupancy / classroom.capacity) * 100).toFixed(2);
}

function getOccupancyColor(classroom) {
  const percentage = getOccupancyPercentage(classroom);
  if (percentage >= 80) return 'red';
  if (percentage >= 50) return 'orange';
  return 'green';
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'table' ? 'card' : 'table';
}

function toggleStatistics() {
  showStatistics.value = !showStatistics.value;
}

function openEditDialog(classroom) {
  isEditMode.value = true;
  dialogVisible.value = true;
  formData.value.id = classroom.id;
  formData.value.name = classroom.name;
  formData.value.capacity = classroom.capacity;
  formData.value.currentOccupancy = classroom.currentOccupancy;
  formData.value.attendanceStarted = classroom.attendanceStarted;
}

function openCreateDialog() {
  isEditMode.value = false;
  dialogVisible.value = true;
  formData.value.id = null;
  formData.value.name = '';
  formData.value.capacity = null;
  formData.value.currentOccupancy = 0;
  formData.value.attendanceStarted = false;
}

function closeDialog() {
  dialogVisible.value = false;
}

function saveClassroom() {
  if (isEditMode.value) {
    classroomsStore.updateClassroom({...formData.value});
    snackbarMessage.value = `Classroom "${formData.value.name}" updated successfully.`;
  } else {
    const newId = classroomsStore.classrooms.length
      ? Math.max(...classroomsStore.classrooms.map(c => c.id)) + 1
      : 1;
    classroomsStore.addClassroom({...formData.value, id: newId});
    snackbarMessage.value = `Classroom "${formData.value.name}" created successfully.`;
  }
  snackbarVisible.value = true;
  dialogVisible.value = false;
}

const dialogVisible = ref(false);
const isEditMode = ref(false);
const formValid = ref(false);
const formData = ref({
  id: null,
  name: '',
  capacity: null,
  currentOccupancy: 0,
  attendanceStarted: false,
});

const deleteDialogVisible = ref(false);
const classroomToDelete = ref(null);

function openDeleteDialog(classroom) {
  classroomToDelete.value = classroom;
  deleteDialogVisible.value = true;
}

function confirmDelete() {
  if (classroomToDelete.value) {
    classroomsStore.deleteClassroom(classroomToDelete.value.id);
    snackbarMessage.value = `Classroom "${classroomToDelete.value.name}" deleted successfully.`;
    snackbarVisible.value = true;
    deleteDialogVisible.value = false;
    classroomToDelete.value = null;
  }
}

function navigateToDetail(classroomId) {
  router.push({name: 'ClassroomDetail', params: {id: classroomId}});
}

// Watchers to update the chart when classrooms data changes
watch(classrooms, () => {
  updateChart();
}, {deep: true});

// Chart Instance
let occupancyChart = null;

function updateChart() {
  if (occupancyChart) {
    occupancyChart.destroy();
  }
  const ctx = document.getElementById('occupancyChart').getContext('2d');
  occupancyChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['High (>80%)', 'Medium (50%-80%)', 'Low (<50%)'],
      datasets: [
        {
          data: [
            classroomsStore.highOccupancyCount,
            classroomsStore.mediumOccupancyCount,
            classroomsStore.lowOccupancyCount,
          ],
          backgroundColor: ['#FF5252', '#FFC107', '#4CAF50'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

onMounted(() => {
  updateChart();
});
</script>

<style scoped>
.fill-height {
  height: 100vh;
}

.d-flex {
  display: flex;
}

.flex-grow-1 {
  flex-grow: 1;
}

/* Ensure the occupancyChart canvas has a defined height */
#occupancyChart {
  height: 250px !important;
}

.no-gutters {
  margin-right: 0 !important;
  margin-left: 0 !important;
}

/* Additional Styles */
.ml-2 {
  margin-left: 0.5rem;
}
</style>
