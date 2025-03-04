<template>
  <div class="add-faculty-container p-4">
    <v-card>
      <v-card-title class="text-h5 pa-4">
        Add Faculty
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="isFormValid" @submit.prevent="saveFaculty">
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
                :loading="loading"
                :disabled="!isFormValid"
              >
                Save Faculty
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFacultyStore } from '@/utils/stores/college/facultyStore'
import type { Faculty } from '@/utils/interfaces/college/facultyInterface'

const router = useRouter()
const facultyStore = useFacultyStore()

const form = ref<any>(null)
const isFormValid = ref(false)
const loading = ref(false)
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

const saveFaculty = async () => {
  if (!isFormValid.value) return

  loading.value = true
  try {
    await facultyStore.createFaculty(faculty.value)
    snackbarText.value = 'Faculty created successfully'
    snackbarColor.value = 'success'
    showSnackbar.value = true
    
    // Navigate back to faculties list after a short delay
    setTimeout(() => {
      router.push('/admin/faculties')
    }, 1000)
  } catch (error) {
    console.error('Error creating faculty:', error)
    snackbarText.value = 'Error creating faculty'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.add-faculty-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style> 