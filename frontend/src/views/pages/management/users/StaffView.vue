<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <h2>Staff Management</h2>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="dialogVisible = true"
              prepend-icon="mdi-plus"
            >
              Add Lecturer
            </v-btn>
            <v-btn-toggle
              v-model="viewMode"
              density="comfortable"
              color="primary"
              class="ml-4"
            >
              <v-btn value="table" icon="mdi-table"></v-btn>
              <v-btn value="cards" icon="mdi-view-grid"></v-btn>
            </v-btn-toggle>
          </v-card-title>

          <!-- Table View -->
          <v-data-table
            :headers="headers"
            :items="lecturers"
            :loading="lecturerStore.loading"
            class="elevation-1"
          >
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon
                size="small"
                color="primary"
                @click="editTeacher(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                color="error"
                @click="deleteTeacher(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>

          <!-- Card View -->
          <v-row v-if="viewMode === 'cards'" class="mt-4">
            <v-col
              v-for="lecturer in lecturers"
              :key="lecturer.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card>
                <v-card-title>{{ lecturer.first_name }} {{ lecturer.last_name }}</v-card-title>
                <v-card-text>
                  <p><strong>Email:</strong> {{ lecturer.email }}</p>
                  <p><strong>Department:</strong> {{ lecturer.department }}</p>
                  <p><strong>Position:</strong> {{ lecturer.position }}</p>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    color="primary"
                    @click="editTeacher(lecturer)"
                  >
                    Edit
                  </v-btn>
                  <v-btn
                    color="error"
                    @click="deleteTeacher(lecturer)"
                  >
                    Delete
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialogVisible" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editingTeacher ? 'Edit Lecturer' : 'Add New Lecturer' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="formValid">
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
                    v-model="formData.department"
                    label="Department"
                    required
                    :rules="[v => !!v || 'Department is required']"
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
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="closeDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="saveTeacher"
            :disabled="!formValid"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useLecturerStore } from '@/utils/stores/users/lecturerStore';
import type { Lecturer } from '@/utils/interfaces/users/lecturerInterface';

const lecturerStore = useLecturerStore();
const lecturers = computed(() => lecturerStore.items);

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Name', key: 'name', value: (item: Lecturer) => `${item.first_name} ${item.last_name}` },
  { title: 'Email', key: 'email' },
  { title: 'Department', key: 'department' },
  { title: 'Actions', key: 'actions', sortable: false }
];

const viewMode = ref<'table' | 'cards'>('table');
const dialogVisible = ref(false);
const formValid = ref(false);
const editingTeacher = ref<Lecturer | null>(null);
const form = ref<any>(null);

const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  department: '',
  position: ''
});

onMounted(async () => {
  await lecturerStore.fetchLecturers();
});

function resetForm() {
  formData.value = {
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    position: ''
  };
  if (form.value) {
    form.value.resetValidation();
  }
}

function closeDialog() {
  dialogVisible.value = false;
  resetForm();
  editingTeacher.value = null;
}

function editTeacher(teacher: Lecturer) {
  editingTeacher.value = teacher;
  formData.value = {
    first_name: teacher.first_name,
    last_name: teacher.last_name,
    email: teacher.email,
    department: teacher.department,
    position: teacher.position
  };
  dialogVisible.value = true;
}

async function deleteTeacher(teacher: Lecturer) {
  if (confirm(`Are you sure you want to delete ${teacher.first_name} ${teacher.last_name}?`)) {
    await lecturerStore.deleteLecturer(teacher.id);
  }
}

async function saveTeacher() {
  if (editingTeacher.value) {
    await lecturerStore.updateLecturer(editingTeacher.value.id, formData.value);
  } else {
    await lecturerStore.createLecturer(formData.value);
  }
  closeDialog();
}
</script>