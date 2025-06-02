<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ListLayout from '../components/ListLayout.vue';
import { getNavItemColor } from '../../utils/navigation';
import { useClassroomStore } from '../../utils/stores/college/classroomStore';
import type { Classroom } from '../../utils/interfaces/college/classroomInterface';

const router = useRouter();
const classroomStore = useClassroomStore();
const classroomColor = getNavItemColor('Classrooms');

// State
const searchQuery = ref('');
const selectedBuilding = ref<string | null>(null);
const selectedDepartment = ref<string | null>(null);
const selectedFacility = ref<string | null>(null);
const page = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);

// Extract unique buildings, departments, and facilities from classrooms for filters
const buildings = computed(() => {
  const uniqueBuildings = new Set<string>();
  classroomStore.classrooms.forEach(classroom => {
    if (classroom.building) {
      uniqueBuildings.add(classroom.building);
    }
  });
  return Array.from(uniqueBuildings);
});

const departments = computed(() => {
  const uniqueDepartments = new Set<string>();
  classroomStore.classrooms.forEach(classroom => {
    if (classroom.department_name) {
      uniqueDepartments.add(classroom.department_name);
    }
  });
  return Array.from(uniqueDepartments);
});

const facilities = computed(() => {
  const uniqueFacilities = new Set<string>();
  classroomStore.classrooms.forEach(classroom => {
    if (classroom.facility_name) {
      uniqueFacilities.add(classroom.facility_name);
    }
  });
  return Array.from(uniqueFacilities);
});

// Table headers
const headers = [
  { title: 'Room Number', key: 'name' },
  { title: 'Department', key: 'department_name' },
  { title: 'Facility', key: 'facility_name' },
  { title: 'Building', key: 'building' },
  { title: 'Capacity', key: 'capacity' },
  { title: 'Features', key: 'features' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false }
];

// Filtered classrooms
const filteredClassrooms = computed(() => {
  let filtered = [...classroomStore.classrooms];
  
  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(classroom => 
      classroom.name.toLowerCase().includes(query) ||
      classroom.department_name?.toLowerCase().includes(query) ||
      classroom.facility_name?.toLowerCase().includes(query) ||
      classroom.building.toLowerCase().includes(query)
    );
  }
  
  // Apply building filter
  if (selectedBuilding.value && selectedBuilding.value !== 'All Buildings') {
    filtered = filtered.filter(classroom => 
      classroom.building === selectedBuilding.value
    );
  }
  
  // Apply department filter
  if (selectedDepartment.value && selectedDepartment.value !== 'All Departments') {
    filtered = filtered.filter(classroom => 
      classroom.department_name === selectedDepartment.value
    );
  }
  
  // Apply facility filter
  if (selectedFacility.value && selectedFacility.value !== 'All Facilities') {
    filtered = filtered.filter(classroom => 
      classroom.facility_name === selectedFacility.value
    );
  }
  
  totalItems.value = filtered.length;
  return filtered;
});

// Handlers
const handleAddClassroom = () => {
  router.push('/dashboard/classrooms/add');
};

const handleEditClassroom = (id: number) => {
  router.push(`/dashboard/classrooms/edit/${id}`);
};

const handleViewDetails = (id: number) => {
  router.push(`/dashboard/classrooms/${id}`);
};

const handleDeleteClassroom = async (id: number) => {
  try {
    await classroomStore.deleteClassroom(id);
    // Success notification could be added here
  } catch (error) {
    console.error('Error deleting classroom:', error);
    // Error notification could be added here
  }
};

const handleSearch = (query: string) => {
  searchQuery.value = query;
};

const handlePageChange = (newPage: number) => {
  page.value = newPage;
};

const resetFilters = () => {
  selectedBuilding.value = null;
  selectedDepartment.value = null;
  selectedFacility.value = null;
};

// Get feature text for a classroom
const getFeatures = (classroom: Classroom): string => {
  const features = [];
  if (classroom.has_projector) features.push('Projector');
  if (classroom.has_whiteboard) features.push('Whiteboard');
  return features.join(', ') || 'None';
};

// Check if room is in use
const isInUse = (classroom: Classroom): boolean => {
  return classroom.is_in_use === true;
};

// Load data
onMounted(async () => {
  try {
    await classroomStore.fetchClassrooms();
  } catch (error) {
    console.error('Error fetching classrooms:', error);
  }
});
</script>

<template>
  <ListLayout
    title="Classrooms"
    subtitle="Manage rooms and facilities"
    icon="mdi-door-open"
    primaryAction="Add Classroom"
    primaryActionIcon="mdi-plus"
    :iconColor="classroomColor"
    :loading="classroomStore.loading"
    :isEmpty="filteredClassrooms.length === 0"
    :showPagination="true"
    :totalItems="totalItems"
    :page="page"
    :itemsPerPage="itemsPerPage"
    emptyStateTitle="No Classrooms Found"
    emptyStateMessage="There are no classrooms in the system yet."
    @search="handleSearch"
    @primary-action="handleAddClassroom"
    @page-change="handlePageChange"
  >
    <!-- Filters slot -->
    <template #filters>
      <v-row>
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedBuilding"
            label="Building"
            :items="['All Buildings', ...buildings]"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedDepartment"
            label="Department"
            :items="['All Departments', ...departments]"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedFacility"
            label="Facility"
            :items="['All Facilities', ...facilities]"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" md="3" class="d-flex align-center">
          <v-btn 
            variant="text" 
            :color="classroomColor" 
            @click="resetFilters"
          >
            Reset Filters
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <!-- Main content -->
    <v-data-table
      :loading="classroomStore.loading"
      :items="filteredClassrooms"
      :headers="headers"
      :items-per-page="itemsPerPage"
      :page="page"
      @update:page="page = $event"
      @update:items-per-page="itemsPerPage = $event"
      item-value="id"
      class="elevation-1"
    >
      <template v-slot:item.features="{ item }">
        {{ getFeatures(item) }}
      </template>
      
      <template v-slot:item.status="{ item }">
        <div class="d-flex align-center">
          <v-chip
            :color="item.is_active ? 'success' : 'error'"
            size="small"
            class="mr-2"
          >
            {{ item.is_active ? 'ACTIVE' : 'INACTIVE' }}
          </v-chip>
          <v-chip
            v-if="isInUse(item)"
            color="warning"
            size="small"
          >
            IN USE
          </v-chip>
        </div>
      </template>
      
      <template v-slot:item.actions="{ item }">
        <v-icon 
          size="small" 
          class="me-2" 
          @click="handleViewDetails(item.id)"
          title="View details"
        >
          mdi-eye
        </v-icon>
        <v-icon 
          size="small" 
          class="me-2" 
          @click="handleEditClassroom(item.id)"
          title="Edit"
        >
          mdi-pencil
        </v-icon>
        <v-icon 
          size="small" 
          @click="handleDeleteClassroom(item.id)"
          title="Delete"
        >
          mdi-delete
        </v-icon>
      </template>
      
      <template v-slot:no-data>
        <p class="text-center py-4">No classrooms found. Try adjusting your filters.</p>
      </template>
    </v-data-table>
  </ListLayout>
</template>

<style scoped>
/* Custom styles here if needed */
</style> 