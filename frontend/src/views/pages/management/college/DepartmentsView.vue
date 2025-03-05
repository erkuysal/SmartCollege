<template>
  <ListViewLayout
    title="Departments"
    icon="mdi-domain"
    :loading="loading"
    :isEmpty="departments.length === 0"
    :error="error"
    searchLabel="Search departments"
    addButtonText="Add Department"
    emptyIcon="mdi-domain-off"
    emptyTitle="No Departments Found"
    emptyText="Get started by adding your first department."
    emptySearchText="No departments match your search criteria."
    v-model:viewType="viewType"
    @search="handleSearch"
    @add="navigateToAddDepartment"
    @refresh="loadDepartments"
    @clear-error="error = ''"
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
          :items="filteredDepartments"
          :loading="loading"
          hover
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" color="primary" class="mr-2">
                <span class="text-subtitle-2 text-white">{{ item.name.charAt(0) }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-grey">{{ getFacultyName(item.faculty) }}</div>
              </div>
            </div>
          </template>
          
          <template #item.head_of_department="{ item }">
            <div v-if="item.head_of_department">
              {{ item.head_of_department }}
            </div>
            <span v-else class="text-grey">Not Assigned</span>
          </template>
          
          <template #item.office_location="{ item }">
            <div v-if="item.office_location" class="d-flex align-center">
              <v-icon size="small" color="primary" class="mr-2">mdi-office-building-marker</v-icon>
              <span>{{ item.office_location }}</span>
            </div>
            <span v-else class="text-grey">Not Specified</span>
          </template>
          
          <template #item.status="{ item }">
            <v-chip
              :color="item.is_active ? 'success' : 'error'"
              size="small"
              variant="tonal"
            >
              {{ item.is_active ? 'Active' : 'Inactive' }}
            </v-chip>
          </template>
          
          <template #item.actions="{ item }">
            <div class="d-flex">
              <v-btn
                icon
                variant="text"
                size="small"
                color="primary"
                @click="editDepartment(item)"
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
          v-for="department in filteredDepartments"
          :key="department.id"
          class="ma-2"
          width="300"
          variant="outlined"
          hover
        >
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="primary" size="40">
                <span class="text-h6 text-white">{{ department.name.charAt(0) }}</span>
              </v-avatar>
            </template>
            <v-card-title>{{ department.name }}</v-card-title>
            <v-card-subtitle>{{ getFacultyName(department.faculty) }}</v-card-subtitle>
          </v-card-item>
          
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="grey" class="mr-2">mdi-account-tie</v-icon>
              <span>{{ department.head_of_department || 'No Head of Department' }}</span>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="grey" class="mr-2">mdi-office-building-marker</v-icon>
              <span>{{ department.office_location || 'No Office Location' }}</span>
            </div>
            <div class="d-flex align-center">
              <v-icon size="small" color="grey" class="mr-2">mdi-check-circle</v-icon>
              <v-chip
                :color="department.is_active ? 'success' : 'error'"
                size="x-small"
                variant="tonal"
              >
                {{ department.is_active ? 'Active' : 'Inactive' }}
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
              @click="editDepartment(department)"
            >
              Edit
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              size="small"
              @click="confirmDelete(department)"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </template>
  </ListViewLayout>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="showDeleteDialog" max-width="400">
    <v-card>
      <v-card-title class="bg-error text-white">
        <v-icon color="white" class="mr-2">mdi-alert</v-icon>
        Confirm Delete
      </v-card-title>
      <v-card-text class="pa-4">
        <p>Are you sure you want to delete this department?</p>
        <p v-if="selectedDepartment" class="font-weight-medium">{{ selectedDepartment.name }}</p>
        <p class="text-caption text-grey mt-2">This action cannot be undone.</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="showDeleteDialog = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          @click="deleteDepartment"
          :loading="deleteLoading"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDepartmentStore } from '@/utils/stores/college/departmentStore';
import { useFacultyStore } from '@/utils/stores/college/facultyStore';
import ListViewLayout from '../../../../components/layouts/ListViewLayout.vue';
import type { Department } from '@/utils/interfaces/college/departmentInterface';

const router = useRouter();
const departmentStore = useDepartmentStore();
const facultyStore = useFacultyStore();

// State
const loading = ref(false);
const deleteLoading = ref(false);
const showDeleteDialog = ref(false);
const selectedDepartment = ref<Department | null>(null);
const error = ref('');
const viewType = ref('table');
const searchQuery = ref('');

// Table headers
const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Head of Department', key: 'head_of_department', sortable: true },
  { title: 'Office Location', key: 'office_location', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as 'end' }
];

// Computed
const departments = computed(() => departmentStore.items || []);

// Filtered departments based on search
const filteredDepartments = computed(() => {
  if (!searchQuery.value) return departments.value;
  
  const query = searchQuery.value.toLowerCase();
  return departments.value.filter(department => {
    // Get faculty name and convert to string to ensure we can call toLowerCase()
    const facultyName = String(getFacultyName(department.faculty)).toLowerCase();
    
    // Ensure head_of_department is a string before calling toLowerCase()
    const headOfDepartment = department.head_of_department ? 
      String(department.head_of_department).toLowerCase() : '';
    
    // Ensure office_location is a string before calling toLowerCase()
    const officeLocation = department.office_location ? 
      String(department.office_location).toLowerCase() : '';
    
    return department.name.toLowerCase().includes(query) || 
      (department.head_of_department && headOfDepartment.includes(query)) ||
      (department.office_location && officeLocation.includes(query)) ||
      facultyName.includes(query);
  });
});

// Methods
function getFacultyName(facultyId: any): string {
  if (!facultyId) return 'No Faculty';
  
  if (typeof facultyId === 'object' && facultyId && 'name' in facultyId) {
    return facultyId.name;
  }
  
  // If we have a faculty ID but not the object, try to find it in the store
  if (typeof facultyId === 'number') {
    const facultyObj = facultyStore.items.find(f => f.id === facultyId);
    if (facultyObj) {
      return facultyObj.name;
    }
  }
  
  return 'No Faculty';
}

function handleSearch(query: string) {
  searchQuery.value = query;
}

const loadDepartments = async () => {
  loading.value = true;
  error.value = '';
  try {
    await departmentStore.fetchDepartments();
    if (facultyStore.items.length === 0) {
      await facultyStore.fetchFaculties();
    }
  } catch (err) {
    console.error('Error loading departments:', err);
    error.value = 'Failed to load departments. Please try again.';
  } finally {
    loading.value = false;
  }
};

function navigateToAddDepartment() {
  router.push('/admin/departments/add');
}

const editDepartment = (department: Department) => {
  router.push(`/admin/departments/edit/${department.id}`);
};

const confirmDelete = (department: Department) => {
  selectedDepartment.value = department;
  showDeleteDialog.value = true;
};

const deleteDepartment = async () => {
  if (!selectedDepartment.value) return;

  deleteLoading.value = true;
  try {
    await departmentStore.deleteDepartment(selectedDepartment.value.id);
    showDeleteDialog.value = false;
    await loadDepartments();
  } catch (err) {
    console.error('Error deleting department:', err);
    error.value = 'Failed to delete department. Please try again.';
  } finally {
    deleteLoading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadDepartments();
});
</script>

<style scoped>
.v-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style> 