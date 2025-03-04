<template>
  <div class="edit-faculty-container p-4">
    <v-card>
      <v-card-title class="text-h5 pa-4">
        Edit Faculty
      </v-card-title>

      <v-card-text>
        <v-progress-circular v-if="loading" indeterminate class="mx-auto d-block my-4" />
        
        <v-form v-else ref="form" v-model="isFormValid" @submit.prevent="updateFaculty">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="faculty.name"
                label="Faculty Name"
                required
                :rules="[v => !!v || 'Name is required']"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="faculty.code"
                label="Faculty Code"
                required
                :rules="[v => !!v || 'Code is required']"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="faculty.description"
                label="Description"
                rows="3"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="faculty.dean"
                label="Dean"
                placeholder="Name of the faculty dean"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="faculty.office_location"
                label="Office Location"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-switch
                v-model="faculty.is_active"
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
                Update Faculty
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFacultyStore } from '@/utils/stores/college/facultyStore'
import type { Faculty } from '@/utils/interfaces/college/facultyInterface'

const router = useRouter()
const route = useRoute()
const facultyStore = useFacultyStore()

const form = ref<any>(null)
const isFormValid = ref(false)
const loading = ref(false)
const saveLoading = ref(false)
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const faculty = ref<Partial<Faculty>>({
  name: '',
  code: '',
  description: '',
  dean: '',
  office_location: '',
  is_active: true
})

const facultyId = Number(route.params.id)

const loadFaculty = async () => {
  if (!facultyId) return
  
  loading.value = true
  try {
    await facultyStore.fetchFacultyById(facultyId)
    const facultyData = facultyStore.selectedItem
    
    if (facultyData) {
      faculty.value = {
        name: facultyData.name,
        code: facultyData.code,
        description: facultyData.description,
        dean: facultyData.dean,
        office_location: facultyData.office_location,
        is_active: facultyData.is_active
      }
    } else {
      snackbarText.value = 'Faculty not found'
      snackbarColor.value = 'error'
      showSnackbar.value = true
      setTimeout(() => router.push('/admin/faculties'), 1500)
    }
  } catch (error) {
    console.error('Error loading faculty:', error)
    snackbarText.value = 'Error loading faculty'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    loading.value = false
  }
}

const updateFaculty = async () => {
  if (!isFormValid.value || !facultyId) return

  saveLoading.value = true
  try {
    await facultyStore.updateFaculty(facultyId, faculty.value)
    snackbarText.value = 'Faculty updated successfully'
    snackbarColor.value = 'success'
    showSnackbar.value = true
    
    // Navigate back to faculties list after a short delay
    setTimeout(() => {
      router.push('/admin/faculties')
    }, 1000)
  } catch (error) {
    console.error('Error updating faculty:', error)
    snackbarText.value = 'Error updating faculty'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    saveLoading.value = false
  }
}

onMounted(() => {
  loadFaculty()
})
</script>

<style scoped>
.edit-faculty-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style> 