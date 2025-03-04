<template>
  <div class="add-department-container p-4">
    <v-card>
      <v-card-title class="text-h5 pa-4">
        Add Department
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="isFormValid" @submit.prevent="saveDepartment">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="department.name"
                label="Department Name"
                required
                :rules="[v => !!v || 'Name is required']"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="department.code"
                label="Department Code"
                required
                :rules="[v => !!v || 'Code is required']"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="department.description"
                label="Description"
                rows="3"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="selectedFaculty"
                :items="faculties"
                item-title="name"
                item-value="id"
                label="Faculty"
                :loading="facultiesLoading"
                return-object
                clearable
              >
                <template v-slot:no-data>
                  <div class="pa-2">No faculties available</div>
                </template>
              </v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="department.office_location"
                label="Office Location"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-switch
                v-model="department.is_active"
                label="Active"
                color="success"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" class="d-flex justify-end">
              <v-btn
                color="grey-darken-1"
                variant="text"
                class="mr-2"
                @click="router.back()"
              >
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                type="submit"
                :loading="loading"
                :disabled="!isFormValid"
              >
                Save Department
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="3000"
    >
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDepartmentStore } from '@/utils/stores/college/departmentStore'
import { useFacultyStore } from '@/utils/stores/college/facultyStore'
import type { Department } from '@/utils/interfaces/college/departmentInterface'
import type { Faculty } from '@/utils/interfaces/college/facultyInterface'

const router = useRouter()
const departmentStore = useDepartmentStore()
const facultyStore = useFacultyStore()

const form = ref<any>(null)
const isFormValid = ref(false)
const loading = ref(false)
const facultiesLoading = ref(false)
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const selectedFaculty = ref<Faculty | null>(null)

const department = ref<Partial<Department>>({
  name: '',
  code: '',
  description: '',
  office_location: '',
  is_active: true
})

// Get faculties for dropdown
const faculties = computed(() => facultyStore.items || [])

const loadFaculties = async () => {
  facultiesLoading.value = true
  try {
    await facultyStore.fetchFaculties({ is_active: true })
  } catch (error) {
    console.error('Error loading faculties:', error)
  } finally {
    facultiesLoading.value = false
  }
}

const saveDepartment = async () => {
  if (!isFormValid.value) return

  loading.value = true
  try {
    // Prepare data for API
    const departmentData: Partial<Department> = {
      name: department.value.name,
      code: department.value.code,
      description: department.value.description,
      office_location: department.value.office_location,
      is_active: department.value.is_active
    }
    
    // Add faculty ID if selected
    if (selectedFaculty.value) {
      departmentData.faculty = selectedFaculty.value.id
    }
    
    await departmentStore.createDepartment(departmentData)
    snackbarText.value = 'Department created successfully'
    snackbarColor.value = 'success'
    showSnackbar.value = true
    
    // Navigate back to departments list after a short delay
    setTimeout(() => {
      router.push('/admin/departments')
    }, 1000)
  } catch (error) {
    console.error('Error creating department:', error)
    snackbarText.value = 'Error creating department'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFaculties()
})
</script>

<style scoped>
.add-department-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style> 