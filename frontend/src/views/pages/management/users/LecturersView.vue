<template>
  <ListViewLayout
    title="Lecturers"
    icon="mdi-account-tie"
    :loading="lecturerStore.loading"
    :isEmpty="filteredLecturers.length === 0"
    :error="lecturerStore.error || ''"
    searchLabel="Search lecturers"
    addButtonText="Add Lecturer"
    emptyIcon="mdi-account-tie-outline"
    emptyTitle="No Lecturers Found"
    emptyText="Get started by adding your first lecturer."
    emptySearchText="No lecturers match your search criteria."
    v-model:viewType="viewType"
    @search="handleSearch"
    @add="navigateToAddLecturer"
    @refresh="reloadLecturers"
    @clear-error="lecturerStore.clearError()"
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
          :items="filteredLecturers"
          :loading="lecturerStore.loading"
          hover
        >
          <template #item.lecturer_id="{ item }">
            <div class="d-flex align-center">
              <v-icon size="small" color="primary" class="mr-2">mdi-card-account-details</v-icon>
              <span class="font-weight-medium">{{ item.username || 'N/A' }}</span>
            </div>
          </template>
          
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" color="primary" class="mr-2">
                <v-icon color="white">mdi-account-tie</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.first_name }} {{ item.last_name }}</div>
                <div class="text-caption text-grey">{{ item.email }}</div>
              </div>
            </div>
          </template>
          
          <template #item.department="{ item }">
            <div v-if="item.department">
              {{ typeof item.department === 'object' && item.department 
                ? (item.department as any).name 
                : getDepartmentName(item.department) }}
            </div>
            <span v-else class="text-grey">Not Assigned</span>
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
                @click="navigateToEditLecturer(item)"
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
          v-for="lecturer in filteredLecturers"
          :key="lecturer.id"
          class="ma-2"
          width="300"
          variant="outlined"
          hover
        >
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="primary" size="40">
                <v-icon color="white">mdi-account-tie</v-icon>
              </v-avatar>
            </template>
            <v-card-title>{{ lecturer.first_name }} {{ lecturer.last_name }}</v-card-title>
            <v-card-subtitle>
              <div class="d-flex align-center">
                <v-icon size="small" color="primary" class="mr-2">mdi-card-account-details</v-icon>
                {{ lecturer.lecturer_code || 'No ID' }}
              </div>
            </v-card-subtitle>
          </v-card-item>
          
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="grey" class="mr-2">mdi-email</v-icon>
              <span>{{ lecturer.email }}</span>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="grey" class="mr-2">mdi-domain</v-icon>
              <span>{{ lecturer.department && (typeof lecturer.department === 'object' && lecturer.department 
                ? (lecturer.department as any).name 
                : getDepartmentName(lecturer.department)) }}</span>
            </div>
            <div class="d-flex align-center">
              <v-icon size="small" color="grey" class="mr-2">mdi-check-circle</v-icon>
              <v-chip
                :color="lecturer.is_active ? 'success' : 'error'"
                size="x-small"
                variant="tonal"
              >
                {{ lecturer.is_active ? 'Active' : 'Inactive' }}
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
              @click="navigateToEditLecturer(lecturer)"
            >
              Edit
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              size="small"
              @click="confirmDelete(lecturer)"
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
        <p>Are you sure you want to delete this lecturer?</p>
        <p v-if="selectedLecturer" class="font-weight-medium">{{ selectedLecturer.first_name }} {{ selectedLecturer.last_name }}</p>
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
          @click="deleteLecturer"
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
import { useLecturerStore } from '../../../../utils/stores/users/lecturerStore';
import { useDepartmentStore } from '../../../../utils/stores/college/departmentStore';
import ListViewLayout from '../../../../components/layouts/ListViewLayout.vue';
import type { Lecturer } from '../../../../utils/interfaces/users/lecturerInterface';

// Router
const router = useRouter();

// Stores
const lecturerStore = useLecturerStore();
const departmentStore = useDepartmentStore();

// View state
const viewType = ref('table');
const searchQuery = ref('');

// Delete dialog
const deleteDialogVisible = ref(false);
const selectedLecturer = ref<Lecturer | null>(null);
const deleting = ref(false);

// Table headers
const headers = [
  { title: 'Lecturer ID', key: 'lecturer_id', sortable: true },
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Department', key: 'department', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as 'end' }
];

// Filtered lecturers based on search
const filteredLecturers = computed(() => {
  if (!searchQuery.value) return lecturerStore.items;
  
  const query = searchQuery.value.toLowerCase();
  return lecturerStore.items.filter(lecturer => {
    const departmentName = lecturer.department && typeof lecturer.department === 'object' && lecturer.department 
      ? (lecturer.department as any).name?.toLowerCase() || ''
      : getDepartmentName(lecturer.department).toLowerCase();
    
    return lecturer.first_name.toLowerCase().includes(query) || 
      lecturer.last_name.toLowerCase().includes(query) ||
      lecturer.email.toLowerCase().includes(query) ||
      (lecturer.lecturer_code && lecturer.lecturer_code.toLowerCase().includes(query)) ||
      departmentName.includes(query);
  });
});

// Methods
function handleSearch(query: string) {
  searchQuery.value = query;
}

function reloadLecturers() {
  lecturerStore.fetchLecturers({});
}

function navigateToAddLecturer() {
  router.push('/admin/lecturers/add');
}

function navigateToEditLecturer(lecturer: Lecturer) {
  router.push(`/admin/lecturers/${lecturer.id}/edit`);
}

function confirmDelete(lecturer: Lecturer) {
  selectedLecturer.value = lecturer;
  deleteDialogVisible.value = true;
}

async function deleteLecturer() {
  if (!selectedLecturer.value) return;
  
  deleting.value = true;
  
  try {
    await lecturerStore.deleteLecturer(selectedLecturer.value.id);
    deleteDialogVisible.value = false;
  } catch (error) {
    console.error('Error deleting lecturer:', error);
  } finally {
    deleting.value = false;
  }
}

function getDepartmentName(departmentId: any): string {
  if (!departmentId) return 'Not Assigned';
  
  const department = departmentStore.items.find(d => d.id === departmentId);
  return department ? department.name : 'Unknown Department';
}

// Lifecycle hooks
onMounted(async () => {
  if (lecturerStore.items.length === 0) {
    await lecturerStore.fetchLecturers({});
  }
  
  if (departmentStore.items.length === 0) {
    await departmentStore.fetchDepartments();
  }
});
</script> 