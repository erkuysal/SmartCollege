<template>
  <v-container fluid class="py-4 px-4">
    <template v-if="!isChildRoute">
      <v-toolbar flat>
        <v-toolbar-title>
          <v-icon left class="mr-2">mdi-account-tie</v-icon>
          <span class="text-h6">Staff</span>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn color="primary" variant="tonal" @click="toggleViewMode">
          <v-icon left>
            {{ viewMode === 'table' ? 'mdi-view-grid' : 'mdi-table' }}
          </v-icon>
          Switch to {{ viewMode === 'table' ? 'Card' : 'Table' }} View
        </v-btn>

        <v-btn color="primary" @click="openAddTeacherDialog">
          <v-icon>mdi-plus</v-icon>
          Add Staff
        </v-btn>
      </v-toolbar>

      <!-- Table View -->
      <v-card v-if="viewMode === 'table'">
        <v-data-table
          :headers="headers"
          :items="teachers"
          :loading="teacherStore.isLoading"
          class="elevation-1"
        >
          <!-- Full Name Column -->
          <template #item.fullName="{ item }">
            {{ `${item.first_name} ${item.last_name}` }}
          </template>

          <!-- Actions Column -->
          <template #item.actions="{ item }">
            <v-btn
              color="primary"
              size="small"
              variant="text"
              class="me-2"
              @click="editTeacher(item)"
            >
              <v-icon>mdi-pencil</v-icon>
              Edit
            </v-btn>
            <v-btn
              color="error"
              size="small"
              variant="text"
              @click="deleteTeacher(item)"
            >
              <v-icon>mdi-delete</v-icon>
              Delete
            </v-btn>
          </template>
        </v-data-table>
      </v-card>

      <!-- Card View -->
      <v-row v-else class="mt-4">
        <v-col
          v-for="teacher in teachers"
          :key="teacher.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card>
            <v-card-title class="text-h6">
              {{ teacher.first_name }} {{ teacher.last_name }}
            </v-card-title>
            <v-card-text>
              <div class="mb-2">
                <v-icon small class="me-2">mdi-email</v-icon>
                {{ teacher.email }}
              </div>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                variant="text"
                @click="editTeacher(teacher)"
              >
                Edit
              </v-btn>
              <v-btn
                color="error"
                variant="text"
                @click="deleteTeacher(teacher)"
              >
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Add/Edit Teacher Dialog -->
      <v-dialog v-model="dialogVisible" max-width="500px">
        <v-card>
          <v-card-title>
            {{ editingTeacher ? 'Edit Staff' : 'Add Staff' }}
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="formValid">
              <v-text-field
                v-model="formData.first_name"
                label="First Name"
                :rules="[v => !!v || 'First name is required']"
              ></v-text-field>
              <v-text-field
                v-model="formData.last_name"
                label="Last Name"
                :rules="[v => !!v || 'Last name is required']"
              ></v-text-field>
              <v-text-field
                v-model="formData.email"
                label="Email"
                type="email"
                :rules="[
                  v => !!v || 'Email is required',
                  v => /.+@.+\..+/.test(v) || 'Email must be valid'
                ]"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" variant="text" @click="closeDialog">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="text"
              :disabled="!formValid"
              @click="saveTeacher"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>

    <router-view v-else />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTeacherStore } from '@/utils/stores/users/teacherStore';
import type { Teacher } from '@/utils/interfaces/users/teacherInterface';

const teacherStore = useTeacherStore();
const teachers = computed(() => teacherStore.teachers);

const headers = [
  { title: 'Full Name', key: 'fullName' },
  { title: 'Email', key: 'email' },
  { title: 'Actions', key: 'actions', sortable: false }
];

const viewMode = ref('table');
const dialogVisible = ref(false);
const formValid = ref(false);
const editingTeacher = ref<Teacher | null>(null);
const form = ref<any>(null);

const formData = ref({
  first_name: '',
  last_name: '',
  email: ''
});

onMounted(async () => {
  await teacherStore.fetchTeachers();
});

function toggleViewMode() {
  viewMode.value = viewMode.value === 'table' ? 'card' : 'table';
}

function openAddTeacherDialog() {
  editingTeacher.value = null;
  resetForm();
  dialogVisible.value = true;
}

function editTeacher(teacher: Teacher) {
  editingTeacher.value = teacher;
  formData.value = { ...teacher };
  dialogVisible.value = true;
}

async function deleteTeacher(teacher: Teacher) {
  if (confirm(`Are you sure you want to delete ${teacher.first_name} ${teacher.last_name}?`)) {
    await teacherStore.removeTeacher(teacher.id);
  }
}

function resetForm() {
  formData.value = {
    first_name: '',
    last_name: '',
    email: ''
  };
  if (form.value) {
    form.value.reset();
  }
}

function closeDialog() {
  dialogVisible.value = false;
  resetForm();
}

async function saveTeacher() {
  if (editingTeacher.value) {
    await teacherStore.updateTeacher(editingTeacher.value.id, formData.value);
  } else {
    await teacherStore.addTeacher(formData.value);
  }
  closeDialog();
}
</script>

<style scoped>
.me-2 {
  margin-right: 8px;
}
</style>
