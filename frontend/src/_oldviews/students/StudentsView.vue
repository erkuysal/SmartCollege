<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// import { useStudentStore } from '@/utils/stores/users/studentStore';
import { useStudentStore} from '../../utils/stores/users/studentStore'
// import { useFacultyStore } from '@/utils/stores/college/facultyStore';
import { useFacultyStore } from '../../utils/stores/college/facultyStore'
import { useRFIDStore } from '../../utils/stores/utilities/RFIDStore'
// import { BaseFormCard } from '@/components/common';
import { BaseFormCard } from '../components/common';
// import type { Student } from '@/utils/interfaces/users/studentInterface';
import type { Student } from '../../utils/interfaces/users/studentInterface';
import ListLayout from '../components/ListLayout.vue';

const router = useRouter();
const studentStore = useStudentStore();
const facultyStore = useFacultyStore();
const rfidStore = useRFIDStore();

// State
const loading = ref(false);
const search = ref('');
const selectedFaculty = ref<number | null>(null);
const showInactive = ref(false);
const snackbarConfig = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
});

// Pagination state
const page = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);

// Faculties for filter
const facultyOptions = computed(() => {
  return facultyStore.items.map(faculty => ({
    title: faculty.name,
    value: faculty.id
  }));
});

// Filtered students
const filteredStudents = computed(() => {
  let result = studentStore.items || [];
  
  // Filter by search term
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(student => 
      student.first_name?.toLowerCase().includes(searchLower) ||
      student.last_name?.toLowerCase().includes(searchLower) ||
      student.student_number?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower)
    );
  }
  
  // Filter by faculty
  if (selectedFaculty.value) {
    result = result.filter(student => 
      student.faculty === selectedFaculty.value ||
      (typeof student.faculty === 'object' && student.faculty?.id === selectedFaculty.value)
    );
  }
  
  // Filter by status
  if (!showInactive.value) {
    result = result.filter(student => 
      student.student_status === 'ACTIVE'
    );
  }

  totalItems.value = result.length;
  
  return result;
});

// Headers for the data table
const headers = [
  { title: 'Student Number', key: 'student_number' },
  { title: 'Name', key: 'name' },
  { title: 'Faculty', key: 'faculty_name' },
  { title: 'Status', key: 'student_status' },
  { title: 'Actions', key: 'actions', sortable: false }
];

// Load initial data
const loadData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      studentStore.fetchStudents(),
      facultyStore.fetchFaculties()
    ]);
  } catch (error) {
    console.error('Error loading data:', error);
    snackbarConfig.value = {
      show: true,
      text: 'Error loading data',
      color: 'error',
      timeout: 3000
    };
  } finally {
    loading.value = false;
  }
};

// Handle actions
const handleAddStudent = () => {
  router.push('/dashboard/students/add');
};

const handleEditStudent = (studentId: number) => {
  router.push(`/dashboard/students/edit/${studentId}`);
};

const handleViewDetails = (studentId: number) => {
  router.push(`/dashboard/students/${studentId}`);
};

const handleDeleteStudent = async (studentId: number) => {
  try {
    await studentStore.deleteStudent(studentId);
    snackbarConfig.value = {
      show: true,
      text: 'Student deleted successfully',
      color: 'success',
      timeout: 3000
    };
  } catch (error) {
    console.error('Error deleting student:', error);
    snackbarConfig.value = {
      show: true,
      text: 'Error deleting student',
      color: 'error',
      timeout: 3000
    };
  }
};

// Handle RFID write
const handleWriteToRFID = async (studentId: number) => {
  // Prompt user for RFID tag (scan or enter manually)
  const rfidTag = prompt('Please scan the RFID card or enter its tag:');
  if (!rfidTag) return;
  try {
    snackbarConfig.value = {
      show: true,
      text: 'Writing to RFID card... Please wait.',
      color: 'info',
      timeout: 0
    };
    await rfidStore.writeToRFID(studentId, rfidTag);
    snackbarConfig.value = {
      show: true,
      text: 'Successfully wrote student data to RFID card',
      color: 'success',
      timeout: 3000
    };
  } catch (error) {
    console.error('Error writing to RFID:', error);
    snackbarConfig.value = {
      show: true,
      text: 'Error writing to RFID card. Please try again.',
      color: 'error',
      timeout: 3000
    };
  }
};

// Reset filters
const resetFilters = () => {
  search.value = '';
  selectedFaculty.value = null;
  showInactive.value = false;
};

// Handle search from ListLayout
const handleSearchChange = (query: string) => {
  search.value = query;
};

// Handle pagination change from ListLayout
const handlePageChange = (newPage: number) => {
  page.value = newPage;
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <ListLayout
    title="Students"
    subtitle="Manage all students"
    icon="mdi-account-group"
    primaryAction="Add Student"
    primaryActionIcon="mdi-account-plus"
    :loading="loading"
    :isEmpty="filteredStudents.length === 0"
    :showPagination="true"
    :totalItems="totalItems"
    :page="page"
    :itemsPerPage="itemsPerPage"
    @search="handleSearchChange"
    @primary-action="handleAddStudent"
    @page-change="handlePageChange"
  >
    <!-- Filters slot -->
    <template #filters>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedFaculty"
            :items="facultyOptions"
            label="Faculty"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-switch
            v-model="showInactive"
            label="Show Inactive Students"
            color="primary"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="2" class="d-flex align-center">
          <v-btn 
            variant="text" 
            color="primary" 
            @click="resetFilters"
          >
            Reset Filters
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <!-- Main content -->
    <v-data-table
      :loading="loading"
      :items="filteredStudents"
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
      
      <template v-slot:item.faculty_name="{ item }">
        {{ typeof item.faculty === 'object' ? item.faculty?.name : 
           facultyStore.items.find(f => f.id === item.faculty)?.name || 'N/A' }}
      </template>
      
      <template v-slot:item.student_status="{ item }">
        <v-chip
          :color="item.student_status === 'ACTIVE' ? 'success' : 'error'"
          size="small"
        >
          {{ item.student_status }}
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
          @click="handleEditStudent(item.id)"
          title="Edit"
        >
          mdi-pencil
        </v-icon>
        <v-icon 
          size="small" 
          class="me-2"
          @click="handleWriteToRFID(item.id)"
          title="Write to RFID"
        >
          mdi-credit-card-wireless
        </v-icon>
        <v-icon 
          size="small" 
          @click="handleDeleteStudent(item.id)"
          title="Delete"
        >
          mdi-delete
        </v-icon>
      </template>
      
      <template v-slot:no-data>
        <p class="text-center py-4">No students found. Try adjusting your filters.</p>
      </template>
    </v-data-table>

    <v-snackbar
      v-model="snackbarConfig.show"
      :color="snackbarConfig.color"
      :timeout="snackbarConfig.timeout"
    >
      {{ snackbarConfig.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbarConfig.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </ListLayout>
</template>

<style scoped>
.students-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}
</style>
