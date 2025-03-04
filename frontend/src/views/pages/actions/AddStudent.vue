<template>
  <div class="add-student-container p-4">
    <v-card class="mx-auto pa-4" max-width="800">
      <v-card-title class="text-h5 mb-4">Add New Student</v-card-title>
      
      <v-form @submit.prevent="onSubmit" v-model="isFormValid" ref="form">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.first_name"
              label="First Name"
              :rules="[rules.required]"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.last_name"
              label="Last Name"
              :rules="[rules.required]"
              required
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="formData.faculty"
              :items="facultyOptions"
              label="Faculty"
              :rules="[rules.required]"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="formData.student_status"
              :items="studentStatusOptions"
              label="Student Status"
              :rules="[rules.required]"
              required
            />
          </v-col>
        </v-row>

        <v-alert
          v-if="formData.faculty"
          type="info"
          class="mt-4"
          border="start"
          density="comfortable"
        >
          <strong>Note:</strong> Upon registration:
          <ul class="mt-2">
            <li>A unique student number will be generated automatically</li>
            <li>An institutional email will be created based on the student number</li>
            <li>Default credentials will be provided to the student</li>
            <li>RFID tag can be assigned later by an administrator</li>
          </ul>
        </v-alert>

        <div class="d-flex justify-end mt-4">
          <v-btn
            color="primary"
            type="submit"
            :loading="loading"
            :disabled="!isFormValid || loading"
          >
            Add Student
          </v-btn>
        </div>
      </v-form>

      <v-snackbar
        v-model="showSnackbar"
        :color="snackbarColor"
        timeout="3000"
      >
        {{ snackbarText }}
      </v-snackbar>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentStore } from '@/utils/stores/users/studentStore'
import { useFacultyStore } from '@/utils/stores/college/facultyStore'
import type { Faculty } from '@/utils/interfaces/college/facultyInterface'

const router = useRouter()
const studentStore = useStudentStore()
const facultyStore = useFacultyStore()

const form = ref<HTMLFormElement | null>(null)
const isFormValid = ref(false)
const loading = ref(false)
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Convert faculties to simple options format for v-select
const facultyOptions = computed(() => {
  return facultyStore.items.map(faculty => ({
    title: faculty.name,
    value: faculty.id
  }))
})

const studentStatusOptions = [
  { title: 'Active', value: 'ACTIVE' },
  { title: 'Inactive', value: 'INACTIVE' }
]

const formData = ref({
  first_name: '',
  last_name: '',
  faculty: null as number | null,
  student_status: 'ACTIVE'
})

const rules = {
  required: (v: any) => !!v || 'This field is required'
}

const onSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  try {
    const studentData = {
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
      faculty_id: formData.value.faculty,
      student_status: formData.value.student_status
    }

    await studentStore.createStudent(studentData)
    
    snackbarText.value = 'Student added successfully! Student credentials will be generated automatically.'
    snackbarColor.value = 'success'
    showSnackbar.value = true

    // Reset form
    formData.value = {
      first_name: '',
      last_name: '',
      faculty: null,
      student_status: 'ACTIVE'
    }
    
    // Navigate to students list after short delay
    setTimeout(() => {
      router.push('/dashboard/students')
    }, 2000)

  } catch (error: any) {
    console.error('Error creating student:', error)
    snackbarText.value = error.message || 'Error creating student'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    if (!facultyStore.items?.length) {
      await facultyStore.fetchFaculties()
    }
  } catch (error) {
    console.error('Error fetching faculties:', error)
    snackbarText.value = 'Error loading faculties'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  }
})
</script>

<style scoped>
.add-student-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
