<template>
  <div class="edit-department-container p-4">
    <v-card>
      <v-card-title class="text-h5 pa-4">
        Edit Department
      </v-card-title>

      <v-card-text>
        <v-progress-circular v-if="loading" indeterminate class="mx-auto d-block my-4" />
        
        <v-form v-else ref="form" v-model="isFormValid" @submit.prevent="updateDepartment">
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
                v-model="department.faculty"
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
                :loading="saveLoading"
                :disabled="!isFormValid"
              >
                Update Department
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
import { useRouter, useRoute } from 'vue-router'
import { useDepartmentStore } from '@/utils/stores/college/departmentStore'
import { useFacultyStore } from '@/utils/stores/college/facultyStore'
import type { Department } from '@/utils/interfaces/college/departmentInterface'
import type { Faculty } from '@/utils/interfaces/college/facultyInterface'

const router = useRouter()
const route = useRoute()
const departmentStore = useDepartmentStore()
const facultyStore = useFacultyStore()

const form = ref<any>(null)
const isFormValid = ref(false)
const loading = ref(false)
const saveLoading = ref(false)
const facultiesLoading = ref(false)
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Define a custom interface for the form data
interface DepartmentFormData {
  name: string;
  code: string;
  description?: string;
  faculty?: Faculty | null;
  office_location?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const department = ref<DepartmentFormData>({
  name: '',
  code: '',
  description: '',
  faculty: null,
  office_location: '',
  is_active: true
})

const departmentId = Number(route.params.id)

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

const loadDepartment = async () => {
  if (!departmentId) return
  
  loading.value = true
  try {
    await departmentStore.fetchDepartmentById(departmentId)
    const departmentData = departmentStore.selectedItem
    
    if (departmentData) {
      // Load the department data
      department.value = {
        name: departmentData.name,
        code: departmentData.code,
        description: departmentData.description,
        office_location: departmentData.office_location,
        is_active: departmentData.is_active
      }
      
      // If there's a faculty ID, find the faculty object
      if (departmentData.faculty) {
        const facultyId = departmentData.faculty
        const faculty = faculties.value.find(f => f.id === facultyId)
        if (faculty) {
          department.value.faculty = faculty
        } else {
          // If faculty not found in the list, fetch it
          try {
            await facultyStore.fetchFacultyById(facultyId)
            if (facultyStore.selectedItem) {
              department.value.faculty = facultyStore.selectedItem
            }
          } catch (error) {
            console.error('Error fetching faculty:', error)
          }
        }
      }
    } else {
      snackbarText.value = 'Department not found'
      snackbarColor.value = 'error'
      showSnackbar.value = true
      setTimeout(() => router.push('/admin/departments'), 1500)
    }
  } catch (error) {
    console.error('Error loading department:', error)
    snackbarText.value = 'Error loading department'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    loading.value = false
  }
}

const updateDepartment = async () => {
  if (!isFormValid.value || !departmentId) return

  saveLoading.value = true
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
    if (department.value.faculty) {
      departmentData.faculty = department.value.faculty.id
    } else {
      departmentData.faculty = undefined // Let the API handle null values
    }
    
    await departmentStore.updateDepartment(departmentId, departmentData)
    snackbarText.value = 'Department updated successfully'
    snackbarColor.value = 'success'
    showSnackbar.value = true
    
    // Navigate back to departments list after a short delay
    setTimeout(() => {
      router.push('/admin/departments')
    }, 1000)
  } catch (error) {
    console.error('Error updating department:', error)
    snackbarText.value = 'Error updating department'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    saveLoading.value = false
  }
}

onMounted(async () => {
  await loadFaculties()
  await loadDepartment()
})
</script>

<style scoped>
.edit-department-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style> 