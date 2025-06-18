<template>
  <div class="classroom-manager">
    <!-- Header Actions -->
    <div class="manager-header">
      <div class="header-actions">
        <v-btn
          color="primary"
          icon="mdi-plus"
          @click="showAddModal = true"
          title="Add Classroom"
        />
      </div>

      <!-- Search and Filter Section -->
      <Filter :filters="filters" @change="handleFilterChange" />
    </div>

    <!-- Main Content -->
    <div class="manager-content">
      <!-- Loading State -->
      <v-progress-circular
        v-if="isLoading"
        indeterminate
        color="primary"
        class="loading-spinner"
      />

      <!-- Error State -->
      <v-alert
        v-else-if="error"
        type="error"
        variant="tonal"
        class="error-alert"
      >
        {{ error }}
      </v-alert>

      <!-- Classrooms Table -->
      <List
        v-else
        :headers="classroomTableHeaders"
        :rows="classroomTableRows"
        :actions="classroomTableActions"
        :showActions="true"
      >
        <template #item-name="{ row }">
          <div class="d-flex align-center">
            <v-icon icon="mdi-door" class="mr-2" color="primary"></v-icon>
            <span class="font-weight-bold">{{ row.name }}</span>
          </div>
        </template>
      </List>
    </div>

    <!-- Edit Classroom Dialog -->
    <v-dialog
      :model-value="!!editingClassroom"
      @update:model-value="val => editingClassroom = val ? editingClassroom : null"
      max-width="500px"
    >
      <v-card v-if="editingClassroom">
        <v-card-title>Edit Classroom</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleUpdateClassroom">
            <v-text-field
              v-model="editingClassroom.name"
              label="Name"
              required
              variant="outlined"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="editingClassroom = null"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="handleUpdateClassroom"
            :loading="isLoading"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Classroom Dialog -->
    <v-dialog
      :model-value="showAddModal"
      @update:model-value="val => showAddModal = val"
      max-width="500px"
    >
      <v-card>
        <v-card-title>Add Classroom</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleAddClassroom">
            <v-text-field
              v-model="newClassroom.name"
              label="Name"
              required
              variant="outlined"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showAddModal = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="handleAddClassroom"
            :loading="isLoading"
          >
            Add Classroom
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  getClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  type Classroom,
  type PaginatedResponse
} from '@/client/api.ts';
import List from '@/components/common/List.vue';
import Filter from '@/components/common/Filter.vue';
import { useUIStore } from '@/client/stores/ui.ts';

type SortField = 'name' | 'capacity' | 'location';

// State
const classrooms = ref<Classroom[]>([]);
const error = ref('');
const isLoading = ref(false);
const searchQuery = ref('');
const sortBy = ref<SortField>('name');
const currentPage = ref(1);
const itemsPerPage = 12;
const totalPages = ref(1);
const totalItems = ref(0);
const editingClassroom = ref<Classroom | null>(null);
const showAddModal = ref(false);

const newClassroom = ref({
  name: ''
});

const uiStore = useUIStore();

const filters = ref([
  {
    type: 'search' as const,
    label: 'Search classrooms...',
    value: searchQuery.value
  },
  {
    type: 'select' as const,
    label: 'Sort by',
    value: sortBy.value,
    items: [
      { title: 'Sort by Name', value: 'name' }
    ]
  }
]);

const classroomTableHeaders = [
  'Name',
];

const classroomTableRows = computed(() => {
  return classrooms.value.map(classroom => ({
    ...classroom
  }));
});

const classroomTableActions = [
  {
    label: 'Edit',
    icon: 'mdi-pencil',
    color: 'primary',
    handler: (classroom: Classroom) => {
      editingClassroom.value = { ...classroom };
    }
  },
  {
    label: 'Delete',
    icon: 'mdi-delete',
    color: 'error',
    handler: async (classroom: Classroom) => {
      if (confirm('Are you sure you want to delete this classroom?')) {
        try {
          isLoading.value = true;
          await deleteClassroom(classroom.id);
          await fetchClassrooms();
          uiStore.showSuccess('Classroom deleted successfully');
        } catch (err) {
          error.value = err instanceof Error ? err.message : 'Failed to delete classroom';
          uiStore.showError(error.value);
        } finally {
          isLoading.value = false;
        }
      }
    }
  }
];

async function fetchClassrooms() {
  try {
    isLoading.value = true;
    const response = await getClassrooms();
    const data = response.data as PaginatedResponse<Classroom>;
    classrooms.value = data.results;
    totalItems.value = data.count;
    totalPages.value = Math.ceil(data.count / itemsPerPage);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch classrooms';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
}

async function handleAddClassroom() {
  if (!newClassroom.value.name) {
    uiStore.showError('Please enter a classroom name');
    return;
  }

  try {
    isLoading.value = true;
    await createClassroom({
      name: newClassroom.value.name
    });
    await fetchClassrooms();
    showAddModal.value = false;
    newClassroom.value = {
      name: ''
    };
    uiStore.showSuccess('Classroom added successfully');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add classroom';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
}

async function handleUpdateClassroom() {
  if (!editingClassroom.value) return;
  
  try {
    isLoading.value = true;
    await updateClassroom(editingClassroom.value.id, {
      name: editingClassroom.value.name
    });
    await fetchClassrooms();
    editingClassroom.value = null;
    uiStore.showSuccess('Classroom updated successfully');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update classroom';
    uiStore.showError(error.value);
  } finally {
    isLoading.value = false;
  }
}

function handleFilterChange(newFilters: typeof filters.value) {
  searchQuery.value = newFilters[0].value;
  sortBy.value = newFilters[1].value as SortField;
}

// Watch for changes in pagination and filters
watch([currentPage, searchQuery, sortBy], () => {
  fetchClassrooms();
});

// Initial data fetch
onMounted(() => {
  fetchClassrooms();
});
</script>

<style scoped>
.classroom-manager {
  padding: 16px;
}

.manager-header {
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.manager-content {
  position: relative;
  min-height: 200px;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.error-alert {
  margin-bottom: 16px;
}
</style> 