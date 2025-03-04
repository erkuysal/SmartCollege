<template>
  <v-container fluid class="py-4 px-4">
    <v-toolbar flat>
      <v-btn icon class="mr-2" @click="router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>
        <span class="text-h6">{{ lecturer ? `Edit ${lecturer.first_name} ${lecturer.last_name}` : 'Edit Lecturer' }}</span>
      </v-toolbar-title>
    </v-toolbar>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else-if="!lecturer">
      <v-col cols="12" class="text-center">
        <v-alert type="error">Lecturer not found</v-alert>
      </v-col>
    </v-row>

    <template v-else>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>Edit Lecturer Information</v-card-title>
            <v-card-text>
              <v-form ref="form" v-model="isValid">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.first_name"
                      label="First Name"
                      :rules="[v => !!v || 'First name is required']"
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.last_name"
                      label="Last Name"
                      :rules="[v => !!v || 'Last name is required']"
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.email"
                      label="Email"
                      :rules="[
                        v => !!v || 'Email is required',
                        v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Email must be valid'
                      ]"
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.position"
                      label="Position"
                      :rules="[v => !!v || 'Position is required']"
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="formData.department"
                      :items="departmentStore.items"
                      item-title="name"
                      item-value="id"
                      label="Department"
                      :rules="[v => !!v || 'Department is required']"
                      required
                    ></v-select>
                  </v-col>

                  <v-col cols="12" md="6">
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
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" variant="text" @click="router.back()">Cancel</v-btn>
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
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLecturerStore } from '@/utils/stores/users/lecturerStore';
import { useDepartmentStore } from '@/utils/stores/college/departmentStore';
import type { Lecturer } from '@/utils/interfaces/users/lecturerInterface';

const route = useRoute();
const router = useRouter();
const lecturerStore = useLecturerStore();
const departmentStore = useDepartmentStore();

const loading = ref(false);
const lecturer = ref<Lecturer | null>(null);
const isValid = ref(false);
const form = ref<any>(null);

const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  position: '',
  department: '',
  office_location: '',
  specialization: ''
});

async function saveLecturer() {
  if (!isValid.value || !lecturer.value) return;

  try {
    const lecturerData: Partial<Lecturer> = {
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
      email: formData.value.email,
      position: formData.value.position,
      department: formData.value.department,
      office_location: formData.value.office_location || undefined,
      specialization: formData.value.specialization || undefined
    };

    await lecturerStore.updateLecturer(lecturer.value.id, lecturerData);
    router.push({
      name: 'lecturer-details',
      params: { id: lecturer.value.id }
    });
  } catch (error) {
    console.error('Error saving lecturer:', error);
  }
}

onMounted(async () => {
  const lecturerId = parseInt(route.params.id as string);
  if (isNaN(lecturerId)) {
    return;
  }

  loading.value = true;
  try {
    if (!departmentStore.items.length) {
      await departmentStore.fetchDepartments();
    }
    
    await lecturerStore.fetchLecturerById(lecturerId);
    lecturer.value = lecturerStore.selectedItem;

    if (lecturer.value) {
      formData.value = {
        first_name: lecturer.value.first_name,
        last_name: lecturer.value.last_name,
        email: lecturer.value.email,
        position: lecturer.value.position,
        department: lecturer.value.department,
        office_location: lecturer.value.office_location || '',
        specialization: lecturer.value.specialization || ''
      };
    }
  } catch (error) {
    console.error('Error loading lecturer details:', error);
  } finally {
    loading.value = false;
  }
});
</script> 