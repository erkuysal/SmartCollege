<template>
  <ListViewLayout
    title="Faculties"
    icon="mdi-office-building"
    :loading="loading"
    :isEmpty="faculties.length === 0"
    :error="error"
    searchLabel="Search faculties"
    addButtonText="Add Faculty"
    emptyIcon="mdi-office-building-off"
    emptyTitle="No Faculties Found"
    emptyText="Get started by adding your first faculty."
    emptySearchText="No faculties match your search criteria."
    v-model:viewType="viewType"
    @search="handleSearch"
    @add="navigateToAddFaculty"
    @refresh="loadFaculties"
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
          :items="filteredFaculties"
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
                <div class="text-caption text-grey">{{ item.code }}</div>
              </div>
            </div>
          </template>
          
          <template #item.dean="{ item }">
            <div v-if="item.dean">
              {{ item.dean }}
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
                @click="editFaculty(item)"
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
          v-for="faculty in filteredFaculties"
          :key="faculty.id"
          class="ma-2"
          width="300"
          variant="outlined"
          hover
        >
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="primary" size="40">
                <span class="text-h6 text-white">{{ faculty.name.charAt(0) }}</span>
              </v-avatar>
            </template>
            <v-card-title>{{ faculty.name }}</v-card-title>
            <v-card-subtitle>{{ faculty.code }}</v-card-subtitle>
          </v-card-item>
          
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="grey" class="mr-2">mdi-account-tie</v-icon>
              <span>{{ faculty.dean || 'No Dean Assigned' }}</span>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="grey" class="mr-2">mdi-office-building-marker</v-icon>
              <span>{{ faculty.office_location || 'No Office Location' }}</span>
            </div>
            <div class="d-flex align-center">
              <v-icon size="small" color="grey" class="mr-2">mdi-check-circle</v-icon>
              <v-chip
                :color="faculty.is_active ? 'success' : 'error'"
                size="x-small"
                variant="tonal"
              >
                {{ faculty.is_active ? 'Active' : 'Inactive' }}
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
              @click="editFaculty(faculty)"
            >
              Edit
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              size="small"
              @click="confirmDelete(faculty)"
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
        <p>Are you sure you want to delete this faculty?</p>
        <p v-if="selectedFaculty" class="font-weight-medium">{{ selectedFaculty.name }}</p>
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
          @click="deleteFaculty"
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
import { useFacultyStore } from '@/utils/stores/college/facultyStore';
import ListViewLayout from '../../../../components/layouts/ListViewLayout.vue';
import type { Faculty } from '@/utils/interfaces/college/facultyInterface';

const router = useRouter();
const facultyStore = useFacultyStore();

// State
const loading = ref(false);
const deleteLoading = ref(false);
const showDeleteDialog = ref(false);
const selectedFaculty = ref<Faculty | null>(null);
const error = ref('');
const viewType = ref('table');
const searchQuery = ref('');

// Table headers
const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Dean', key: 'dean', sortable: true },
  { title: 'Office Location', key: 'office_location', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as 'end' }
];

// Computed
const faculties = computed(() => facultyStore.items || []);

// Filtered faculties based on search
const filteredFaculties = computed(() => {
  if (!searchQuery.value) return faculties.value;
  
  const query = searchQuery.value.toLowerCase();
  return faculties.value.filter(faculty => {
    return faculty.name.toLowerCase().includes(query) || 
      (faculty.code && faculty.code.toLowerCase().includes(query)) ||
      (faculty.dean && faculty.dean.toLowerCase().includes(query)) ||
      (faculty.office_location && faculty.office_location.toLowerCase().includes(query));
  });
});

// Methods
function handleSearch(query: string) {
  searchQuery.value = query;
}

const loadFaculties = async () => {
  loading.value = true;
  error.value = '';
  try {
    await facultyStore.fetchFaculties();
  } catch (err) {
    console.error('Error loading faculties:', err);
    error.value = 'Failed to load faculties. Please try again.';
  } finally {
    loading.value = false;
  }
};

function navigateToAddFaculty() {
  router.push('/admin/faculties/add');
}

const editFaculty = (faculty: Faculty) => {
  router.push(`/admin/faculties/edit/${faculty.id}`);
};

const confirmDelete = (faculty: Faculty) => {
  selectedFaculty.value = faculty;
  showDeleteDialog.value = true;
};

const deleteFaculty = async () => {
  if (!selectedFaculty.value) return;

  deleteLoading.value = true;
  try {
    await facultyStore.deleteFaculty(selectedFaculty.value.id);
    showDeleteDialog.value = false;
    await loadFaculties();
  } catch (err) {
    console.error('Error deleting faculty:', err);
    error.value = 'Failed to delete faculty. Please try again.';
  } finally {
    deleteLoading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadFaculties();
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