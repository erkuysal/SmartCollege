<template>
  <v-container fluid class="py-4 px-4">
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon left class="mr-2">mdi-account-tie</v-icon>
        <span class="text-h6">Lecturers</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Add view toggle button -->
      <v-btn-toggle
        v-model="viewType"
        mandatory
        class="me-4"
      >
        <v-btn value="table" size="small">
          <v-icon>mdi-table</v-icon>
        </v-btn>
        <v-btn value="card" size="small">
          <v-icon>mdi-view-grid</v-icon>
        </v-btn>
      </v-btn-toggle>

      <v-btn color="primary" @click="openAddLecturerDialog">
        <v-icon>mdi-plus</v-icon>
        Add Lecturer
      </v-btn>
    </v-toolbar>

    <!-- Error Alert -->
    <v-alert
      v-if="lecturerStore.error"
      type="error"
      class="mt-4"
      closable
    >
      {{ lecturerStore.error }}
    </v-alert>

    <!-- Table View -->
    <v-table v-if="viewType === 'table'" class="mt-4">
      <thead>
        <tr>
          <th v-for="header in headers" :key="header.key" class="text-left">
            {{ header.title }}
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="lecturer in lecturerStore.items" :key="lecturer.id">
          <td>{{ lecturer.first_name }}</td>
          <td>{{ lecturer.last_name }}</td>
          <td>{{ lecturer.email }}</td>
          <td>{{ lecturer.position }}</td>
          <td>{{ getDepartmentName(lecturer.department) }}</td>
          <td>
            <v-btn icon size="small" color="primary" class="mr-2" @click="viewLecturerDetails(lecturer)">
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn icon size="small" color="warning" class="mr-2" @click="editLecturer(lecturer)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="small" color="error" @click="deleteLecturer(lecturer)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Card View -->
    <v-row v-if="viewType === 'card'" class="mt-4">
      <v-col v-for="lecturer in lecturerStore.items" :key="lecturer.id" cols="12" sm="6" md="4" lg="3">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <div>{{ lecturer.first_name }} {{ lecturer.last_name }}</div>
          </v-card-title>
          <v-card-text>
            <v-list density="compact" lines="two">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-email</v-icon>
                </template>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{ lecturer.email }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-briefcase</v-icon>
                </template>
                <v-list-item-title>Position</v-list-item-title>
                <v-list-item-subtitle>{{ lecturer.position }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-domain</v-icon>
                </template>
                <v-list-item-title>Department</v-list-item-title>
                <v-list-item-subtitle>{{ getDepartmentName(lecturer.department) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-btn size="small" color="primary" @click="viewLecturerDetails(lecturer)">
              <v-icon class="mr-1">mdi-eye</v-icon>
              View
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn icon size="small" color="warning" @click="editLecturer(lecturer)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="small" color="error" @click="deleteLecturer(lecturer)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Lecturer Dialog -->
    <v-dialog v-model="dialogVisible" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editingLecturer ? 'Edit Lecturer' : 'New Lecturer' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="isValid">
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.first_name"
                    label="First Name"
                    required
                    :rules="[v => !!v || 'First name is required']"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.last_name"
                    label="Last Name"
                    required
                    :rules="[v => !!v || 'Last name is required']"
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.email"
                    label="Email"
                    type="email"
                    required
                    :rules="[
                      v => !!v || 'Email is required',
                      v => /.+@.+\..+/.test(v) || 'Email must be valid'
                    ]"
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.position"
                    label="Position"
                    required
                    :rules="[v => !!v || 'Position is required']"
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.department"
                    label="Department"
                    required
                    :rules="[v => !!v || 'Department is required']"
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.office_location"
                    label="Office Location"
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.specialization"
                    label="Specialization"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="saveLecturer"
            :loading="lecturerStore.loading"
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLecturerStore } from '@/utils/stores/users/lecturerStore';
import { useDepartmentStore } from '@/utils/stores/college/departmentStore';
import type { Lecturer } from '@/utils/interfaces/users/lecturerInterface';
import type { Department } from '@/utils/interfaces/college/departmentInterface';

const router = useRouter();
const lecturerStore = useLecturerStore();
const departmentStore = useDepartmentStore();

// Table headers
const headers = [
  { title: 'First Name', key: 'first_name', sortable: true, align: 'start' as const },
  { title: 'Last Name', key: 'last_name', sortable: true, align: 'start' as const },
  { title: 'Email', key: 'email', sortable: true, align: 'start' as const },
  { title: 'Position', key: 'position', sortable: true, align: 'start' as const },
  { title: 'Department', key: 'department', sortable: true, align: 'start' as const },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const }
];

// State
const dialogVisible = ref(false);
const editingLecturer = ref<Lecturer | null>(null);
const isValid = ref(false);
const form = ref<any>(null);
const viewType = ref('table');

const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  position: '',
  department: '',
  office_location: '',
  specialization: ''
});

// Methods
function openAddLecturerDialog() {
  editingLecturer.value = null;
  resetForm();
  dialogVisible.value = true;
}

function editLecturer(lecturer: Lecturer) {
  editingLecturer.value = lecturer;
  formData.value = {
    first_name: lecturer.first_name,
    last_name: lecturer.last_name,
    email: lecturer.email,
    position: lecturer.position,
    department: lecturer.department,
    office_location: lecturer.office_location || '',
    specialization: lecturer.specialization || ''
  };
  dialogVisible.value = true;
}

async function saveLecturer() {
  if (!isValid.value) return;

  try {
    const lecturerData = {
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
      email: formData.value.email,
      position: formData.value.position,
      department: formData.value.department,
      office_location: formData.value.office_location,
      specialization: formData.value.specialization
    };

    if (editingLecturer.value) {
      await lecturerStore.updateLecturer(editingLecturer.value.id, lecturerData);
    } else {
      await lecturerStore.createLecturer(lecturerData);
    }
    closeDialog();
  } catch (error) {
    console.error('Error saving lecturer:', error);
  }
}

async function deleteLecturer(lecturer: Lecturer) {
  if (confirm('Are you sure you want to delete this lecturer?')) {
    try {
      await lecturerStore.deleteLecturer(lecturer.id);
    } catch (error) {
      console.error('Error deleting lecturer:', error);
    }
  }
}

function closeDialog() {
  dialogVisible.value = false;
  resetForm();
}

function resetForm() {
  formData.value = {
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    department: '',
    office_location: '',
    specialization: ''
  };
  if (form.value) {
    form.value.resetValidation();
  }
}

function viewLecturerDetails(lecturer: Lecturer) {
  router.push({
    name: 'lecturer-details',
    params: { id: lecturer.id }
  });
}

function getDepartmentName(departmentId: string | number): string {
  if (!departmentId) return 'Not assigned';
  
  const id = typeof departmentId === 'string' ? parseInt(departmentId, 10) : departmentId;
  if (isNaN(id)) return String(departmentId);
  
  const departmentObj = departmentStore.items.find(d => d.id === id);
  return departmentObj ? departmentObj.name : String(departmentId);
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      lecturerStore.fetchLecturers(),
      departmentStore.fetchDepartments()
    ]);
  } catch (error) {
    console.error('Error loading data:', error);
    lecturerStore.resetState();
    departmentStore.resetState();
  }
});
</script> 