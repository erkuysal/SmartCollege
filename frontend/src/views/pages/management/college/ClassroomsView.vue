<template>
  <v-container fluid class="py-4 px-4">
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon left class="mr-2">mdi-door-closed</v-icon>
        <span class="text-h6">Classrooms</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

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
    </v-toolbar>

    <!-- Error Alert -->
    <v-alert
      v-if="classroomStore.error"
      type="error"
      class="mt-4"
      closable
    >
      {{ classroomStore.error }}
    </v-alert>

    <!-- Table View -->
    <v-data-table
      v-if="viewMode === 'table' && !showingDetails"
      :headers="headers"
      :items="classroomStore.classrooms"
      :loading="classroomStore.loading"
    >
      <template #item.actions="{ item }">
        <v-btn
          color="info"
          size="small"
          variant="text"
          class="me-2"
          @click="viewClassroomDetails(item)"
        >
          <v-icon>mdi-calendar</v-icon>
          Details
        </v-btn>
        <v-btn
          color="error"
          size="small"
          variant="text"
          @click="deleteClassroom(item)"
        >
          <v-icon>mdi-delete</v-icon>
          Delete
        </v-btn>
      </template>
    </v-data-table>

    <!-- Card View -->
    <v-row v-else-if="!showingDetails">
      <v-col
        v-for="classroom in classroomStore.classrooms"
        :key="classroom.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card>
          <v-card-title>{{ classroom.name }}</v-card-title>
          <v-card-text>
            <div>Capacity: {{ classroom.capacity }}</div>
            <div v-if="classroom.building">Building: {{ classroom.building }}</div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="info"
              variant="text"
              @click="viewClassroomDetails(classroom)"
            >
              Details
            </v-btn>
            <v-btn
              color="error"
              variant="text"
              @click="deleteClassroom(classroom)"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Details Router View -->
    <router-view v-if="showingDetails">
      <template #default="{ Component }">
        <v-card class="mt-4">
          <v-card-title class="d-flex align-center">
            <v-btn
              icon
              variant="text"
              class="me-2"
              @click="closeDetails"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            Details for {{ selectedClassroom?.name || 'Classroom' }}
          </v-card-title>
          <component :is="Component" />
        </v-card>
      </template>
    </router-view>

    <!-- Add/Edit Classroom Dialog -->
    <v-dialog v-model="dialogVisible" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editingClassroom ? 'Edit Classroom' : 'New Classroom' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="isValid">
            <v-text-field
              v-model="formData.name"
              label="Classroom Name"
              :rules="[v => !!v || 'Name is required']"
              required
            ></v-text-field>

            <v-text-field
              v-model.number="formData.capacity"
              label="Capacity"
              type="number"
              :rules="[
                v => !!v || 'Capacity is required',
                v => v > 0 || 'Capacity must be greater than 0'
              ]"
              required
            ></v-text-field>

            <v-text-field
              v-model="formData.building"
              label="Building"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            @click="closeDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="saveClassroom"
            :loading="classroomStore.loading"
            :disabled="!isValid"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClassroomStore } from '@/utils/stores/college/classroomStore';
import type { Classroom } from '@/utils/interfaces/college/classroomInterface';

const router = useRouter();
const classroomStore = useClassroomStore();

// State
const viewMode = ref<'table' | 'card'>('table');
const selectedClassroom = ref<Classroom | null>(null);
const showingDetails = ref(false);
const dialogVisible = ref(false);
const editingClassroom = ref<Classroom | null>(null);
const isValid = ref(false);
const form = ref<null | { resetValidation: () => void }>(null);

// Table headers
const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Capacity', key: 'capacity' },
  { title: 'Building', key: 'building' },
  { title: 'Actions', key: 'actions', sortable: false }
];

// Form data
interface ClassroomFormData {
  name: string;
  capacity: number;
  building: string;
}

const formData = ref<ClassroomFormData>({
  name: '',
  capacity: 0,
  building: ''
});

// Methods
async function viewClassroomDetails(classroom: Classroom) {
  try {
    selectedClassroom.value = classroom;
    showingDetails.value = true;
    await classroomStore.fetchClassroomSchedules(classroom.id);
    router.push({
      name: 'classroom-details',
      params: { id: classroom.id }
    });
  
  } catch (error) {
    console.error('Error loading classroom details:', error);
  }
}

function closeDetails() {
  showingDetails.value = false;
  selectedClassroom.value = null;
  router.push({ name: 'classrooms' });
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'table' ? 'card' : 'table';
}

async function deleteClassroom(classroom: Classroom) {
  if (confirm('Are you sure you want to delete this classroom?')) {
    try {
      await classroomStore.deleteClassroom(classroom.id);
    } catch (error) {
      console.error('Error deleting classroom:', error);
    }
  }
}

function openAddClassroomDialog() {
  editingClassroom.value = null;
  resetForm();
  dialogVisible.value = true;
}

function closeDialog() {
  dialogVisible.value = false;
  resetForm();
}

function resetForm() {
  formData.value = {
    name: '',
    capacity: 0,
    building: ''
  };
  if (form.value) {
    form.value.resetValidation();
  }
}

async function saveClassroom() {
  if (!isValid.value) return;

  try {
    if (editingClassroom.value) {
      await classroomStore.updateClassroom(editingClassroom.value.id, formData.value);
    } else {
      await classroomStore.createClassroom(formData.value);
    }
    closeDialog();
  } catch (error) {
    console.error('Error saving classroom:', error);
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await classroomStore.fetchClassrooms();
  } catch (error) {
    console.error('Error loading classrooms:', error);
    classroomStore.resetState();
  }
});

onUnmounted(() => {
  classroomStore.resetState();
});
</script>