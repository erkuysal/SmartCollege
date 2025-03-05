<template>
  <ListViewLayout
    title="Classrooms"
    icon="mdi-google-classroom"
    :loading="classroomStore.loading"
    :isEmpty="filteredClassrooms.length === 0"
    :error="classroomStore.error || ''"
    searchLabel="Search classrooms"
    addButtonText="Add Classroom"
    emptyIcon="mdi-google-classroom"
    emptyTitle="No Classrooms Found"
    emptyText="Get started by adding your first classroom."
    emptySearchText="No classrooms match your search criteria."
    v-model:viewType="viewType"
    @search="handleSearch"
    @add="navigateToAddClassroom"
    @refresh="reloadClassrooms"
    @clear-error="clearError"
  >
    <!-- Table View -->
    <template #default="{ viewType }">
      <v-card
        v-if="viewType === 'table'"
        variant="outlined"
        class="mb-4"
      >
        <v-data-table
          :headers="headers"
          :items="filteredClassrooms"
          :loading="classroomStore.loading"
          hover
        >
          <template #item.room_number="{ item }">
            <div class="d-flex align-center">
              <v-icon size="small" color="primary" class="mr-2">mdi-door</v-icon>
              <span class="font-weight-medium">{{ item.name }}</span>
            </div>
          </template>
          
          <template #item.building="{ item }">
            <div class="d-flex align-center">
              <v-icon size="small" color="primary" class="mr-2">mdi-office-building</v-icon>
              <span>{{ item.building }}</span>
            </div>
          </template>
          
          <template #item.capacity="{ item }">
            <v-chip
              :color="getCapacityColor(item.capacity)"
              size="small"
              variant="tonal"
            >
              {{ item.capacity }} seats
            </v-chip>
          </template>
          
          <template #item.type="{ item }">
            <div class="d-flex align-center">
              <v-icon size="small" :color="getClassroomTypeColor(getClassroomType(item))" class="mr-2">
                {{ getClassroomTypeIcon(getClassroomType(item)) }}
              </v-icon>
              <span>{{ getClassroomType(item) }}</span>
            </div>
          </template>
          
          <template #item.status="{ item }">
            <v-chip
              :color="item.is_active ? 'success' : 'error'"
              size="small"
              variant="tonal"
            >
              {{ item.is_active ? 'Available' : 'Unavailable' }}
            </v-chip>
          </template>
          
          <template #item.actions="{ item }">
            <div class="d-flex">
              <v-btn
                icon
                variant="text"
                size="small"
                color="primary"
                @click="navigateToEditClassroom(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                color="error"
                @click="confirmDelete(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <!-- Card View -->
      <div v-else class="d-flex flex-wrap">
        <v-card
          v-for="classroom in filteredClassrooms"
          :key="classroom.id"
          class="ma-2"
          width="300"
          variant="outlined"
          hover
        >
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar :color="getClassroomTypeColor(getClassroomType(classroom))" size="40">
                <v-icon color="white">{{ getClassroomTypeIcon(getClassroomType(classroom)) }}</v-icon>
              </v-avatar>
            </template>
            <v-card-title>
              <div class="d-flex align-center">
                <v-icon size="small" color="primary" class="mr-2">mdi-door</v-icon>
                {{ classroom.name }}
              </div>
            </v-card-title>
            <v-card-subtitle>{{ classroom.building }}</v-card-subtitle>
          </v-card-item>
          
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="grey" class="mr-2">mdi-seat</v-icon>
              <span>Capacity: {{ classroom.capacity }} seats</span>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="grey" class="mr-2">mdi-tag</v-icon>
              <span>Type: {{ getClassroomType(classroom) }}</span>
            </div>
            <div class="d-flex align-center">
              <v-icon size="small" color="grey" class="mr-2">mdi-check-circle</v-icon>
              <v-chip
                :color="classroom.is_active ? 'success' : 'error'"
                size="x-small"
                variant="tonal"
              >
                {{ classroom.is_active ? 'Available' : 'Unavailable' }}
              </v-chip>
            </div>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              color="primary"
              size="small"
              @click="navigateToEditClassroom(classroom)"
            >
              Edit
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              size="small"
              @click="confirmDelete(classroom)"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </template>
  </ListViewLayout>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="deleteDialogVisible" max-width="400">
    <v-card>
      <v-card-title class="bg-error text-white">
        <v-icon color="white" class="mr-2">mdi-alert</v-icon>
        Confirm Delete
      </v-card-title>
      <v-card-text class="pa-4">
        <p>Are you sure you want to delete this classroom?</p>
        <p v-if="selectedClassroom" class="font-weight-medium">{{ selectedClassroom.name }} ({{ selectedClassroom.building }})</p>
        <p class="text-caption text-grey mt-2">This action cannot be undone.</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="deleteDialogVisible = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          @click="deleteClassroom"
          :loading="deleting"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClassroomStore } from '../../../../utils/stores/college/classroomStore';
import ListViewLayout from '../../../../components/layouts/ListViewLayout.vue';
import type { Classroom } from '../../../../utils/interfaces/college/classroomInterface';

// Router
const router = useRouter();

// Stores
const classroomStore = useClassroomStore();

// View state
const viewType = ref('table');
const searchQuery = ref('');

// Delete dialog
const deleteDialogVisible = ref(false);
const selectedClassroom = ref<Classroom | null>(null);
const deleting = ref(false);

// Table headers
const headers = [
  { title: 'Room Number', key: 'room_number', sortable: true },
  { title: 'Building', key: 'building', sortable: true },
  { title: 'Capacity', key: 'capacity', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as 'end' }
];

// Helper function to determine classroom type based on properties
function getClassroomType(classroom: Classroom): string {
  if (classroom.is_lab) {
    if (classroom.has_computers) {
      return 'Computer Lab';
    }
    return 'Laboratory';
  }
  
  if (classroom.capacity > 100) {
    return 'Lecture Hall';
  }
  
  if (classroom.capacity < 30) {
    return 'Seminar Room';
  }
  
  return 'Classroom';
}

// Filtered classrooms based on search
const filteredClassrooms = computed(() => {
  if (!searchQuery.value) return classroomStore.classrooms;
  
  const query = searchQuery.value.toLowerCase();
  return classroomStore.classrooms.filter((classroom: Classroom) => {
    const type = getClassroomType(classroom);
    
    return classroom.name.toLowerCase().includes(query) || 
      classroom.building.toLowerCase().includes(query) ||
      type.toLowerCase().includes(query) ||
      classroom.capacity.toString().includes(query);
  });
});

// Methods
function handleSearch(query: string) {
  searchQuery.value = query;
}

function reloadClassrooms() {
  classroomStore.fetchClassrooms();
}

function clearError() {
  classroomStore.error = null;
}

function navigateToAddClassroom() {
  router.push('/admin/classrooms/add');
}

function navigateToEditClassroom(classroom: Classroom) {
  router.push(`/admin/classrooms/${classroom.id}/edit`);
}

function confirmDelete(classroom: Classroom) {
  selectedClassroom.value = classroom;
  deleteDialogVisible.value = true;
}

async function deleteClassroom() {
  if (!selectedClassroom.value) return;
  
  deleting.value = true;
  
  try {
    await classroomStore.deleteClassroom(selectedClassroom.value.id);
    deleteDialogVisible.value = false;
  } catch (error) {
    console.error('Error deleting classroom:', error);
  } finally {
    deleting.value = false;
  }
}

function getCapacityColor(capacity: number): string {
  if (capacity < 30) return 'info';
  if (capacity < 60) return 'success';
  if (capacity < 100) return 'warning';
  return 'error';
}

function getClassroomTypeIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'lecture hall':
      return 'mdi-stadium';
    case 'laboratory':
      return 'mdi-flask';
    case 'computer lab':
      return 'mdi-desktop-classic';
    case 'seminar room':
      return 'mdi-account-group';
    default:
      return 'mdi-google-classroom';
  }
}

function getClassroomTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'lecture hall':
      return 'indigo';
    case 'laboratory':
      return 'green';
    case 'computer lab':
      return 'blue';
    case 'seminar room':
      return 'orange';
    default:
      return 'grey';
  }
}

// Lifecycle hooks
onMounted(async () => {
  if (classroomStore.classrooms.length === 0) {
    await classroomStore.fetchClassrooms();
  }
});
</script>