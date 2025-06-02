<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ListLayout from '../components/ListLayout.vue';

const router = useRouter();

// Define interfaces
interface Lecturer {
  id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  status: string;
}

// State
const loading = ref(false);
const lecturers = ref<Lecturer[]>([]);
const totalItems = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);
const searchQuery = ref('');

// Mock data - replace with actual store later
const mockLecturers: Lecturer[] = [
  { 
    id: 1, 
    employee_number: 'LEC001', 
    first_name: 'Robert', 
    last_name: 'Johnson', 
    email: 'robert.johnson@example.com',
    department: 'Computer Science',
    position: 'Associate Professor',
    status: 'ACTIVE'
  },
  { 
    id: 2, 
    employee_number: 'LEC002', 
    first_name: 'Sarah', 
    last_name: 'Williams', 
    email: 'sarah.williams@example.com',
    department: 'Mathematics',
    position: 'Professor',
    status: 'ACTIVE'
  },
  { 
    id: 3, 
    employee_number: 'LEC003', 
    first_name: 'Michael', 
    last_name: 'Brown', 
    email: 'michael.brown@example.com',
    department: 'Physics',
    position: 'Assistant Professor',
    status: 'ON_LEAVE'
  }
];

// Table headers
const headers = [
  { title: 'Employee ID', key: 'employee_number' },
  { title: 'Name', key: 'name' },
  { title: 'Department', key: 'department' },
  { title: 'Position', key: 'position' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false }
];

// Filtered lecturers
const filteredLecturers = computed(() => {
  let filtered = [...mockLecturers];
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(lecturer => 
      lecturer.first_name.toLowerCase().includes(query) ||
      lecturer.last_name.toLowerCase().includes(query) ||
      lecturer.employee_number.toLowerCase().includes(query) ||
      lecturer.email.toLowerCase().includes(query) ||
      lecturer.department.toLowerCase().includes(query)
    );
  }
  
  totalItems.value = filtered.length;
  return filtered;
});

// Handlers
const handleAddLecturer = () => {
  // router.push('/dashboard/lecturers/add');
  console.log('Add lecturer clicked');
};

const handleEditLecturer = (id: number) => {
  // router.push(`/dashboard/lecturers/edit/${id}`);
  console.log('Edit lecturer', id);
};

const handleViewDetails = (id: number) => {
  // router.push(`/dashboard/lecturers/${id}`);
  console.log('View lecturer details', id);
};

const handleDeleteLecturer = (id: number) => {
  console.log('Delete lecturer', id);
};

const handleSearch = (query: string) => {
  searchQuery.value = query;
};

const handlePageChange = (newPage: number) => {
  page.value = newPage;
};

// Load data
onMounted(() => {
  loading.value = true;
  // Simulate API call
  setTimeout(() => {
    lecturers.value = mockLecturers;
    loading.value = false;
  }, 1000);
});
</script>

<template>
  <ListLayout
    title="Lecturers"
    subtitle="Manage faculty members"
    icon="mdi-account-tie"
    primaryAction="Add Lecturer"
    primaryActionIcon="mdi-account-plus"
    :loading="loading"
    :isEmpty="filteredLecturers.length === 0"
    :showPagination="true"
    :totalItems="totalItems"
    :page="page"
    :itemsPerPage="itemsPerPage"
    emptyStateTitle="No Lecturers Found"
    emptyStateMessage="There are no lecturers in the system yet."
    @search="handleSearch"
    @primary-action="handleAddLecturer"
    @page-change="handlePageChange"
  >
    <!-- Filters slot -->
    <template #filters>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            label="Department"
            :items="['All Departments', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry']"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            label="Position"
            :items="['All Positions', 'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer']"
            hide-details
          />
        </v-col>
      </v-row>
    </template>

    <!-- Main content -->
    <v-data-table
      :loading="loading"
      :items="filteredLecturers"
      :headers="headers"
      :items-per-page="itemsPerPage"
      :page="page"
      @update:page="page = $event"
      @update:items-per-page="itemsPerPage = $event"
      item-value="id"
      class="elevation-1"
    >
      <template v-slot:item.name="{ item }">
        {{ item.first_name }} {{ item.last_name }}
      </template>
      
      <template v-slot:item.status="{ item }">
        <v-chip
          :color="item.status === 'ACTIVE' ? 'success' : 'warning'"
          size="small"
        >
          {{ item.status }}
        </v-chip>
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
          @click="handleEditLecturer(item.id)"
          title="Edit"
        >
          mdi-pencil
        </v-icon>
        <v-icon 
          size="small" 
          @click="handleDeleteLecturer(item.id)"
          title="Delete"
        >
          mdi-delete
        </v-icon>
      </template>
      
      <template v-slot:no-data>
        <p class="text-center py-4">No lecturers found. Try adjusting your filters.</p>
      </template>
    </v-data-table>
  </ListLayout>
</template>

<style scoped>
/* Custom styles here if needed */
</style>
