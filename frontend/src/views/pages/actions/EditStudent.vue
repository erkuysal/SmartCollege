<template>
  <div class="edit-student-container p-4">
    <v-card class="mx-auto pa-4" max-width="800">
      <v-card-title class="text-h5 mb-4">Edit Student</v-card-title>
      
      <v-progress-circular v-if="loading" indeterminate class="mx-auto d-block my-4" />
      
      <v-form v-else @submit.prevent="onSubmit" v-model="isFormValid" ref="form">
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

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.student_number"
              label="Student Number"
              disabled
              hint="Student number cannot be changed"
              persistent-hint
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.email"
              label="Email"
              disabled
              hint="Email is generated automatically"
              persistent-hint
            />
          </v-col>
        </v-row>

        <div class="d-flex justify-end mt-4">
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
            :disabled="!isFormValid || saveLoading"
          >
            Update Student
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
import { useRouter, useRoute } from 'vue-router'
import { useStudentStore } from '@/utils/stores/users/studentStore'
import { useFacultyStore } from '@/utils/stores/college/facultyStore'
import type { Student } from '@/utils/interfaces/users/studentInterface'
import type { Faculty } from '@/utils/interfaces/college/facultyInterface'

const router = useRouter()
const route = useRoute()
const studentStore = useStudentStore()
const facultyStore = useFacultyStore()

const form = ref<HTMLFormElement | null>(null)
const isFormValid = ref(false)
const loading = ref(false)
const saveLoading = ref(false)
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
  { title: 'Inactive', value: 'INACTIVE' },
  { title: 'Graduated', value: 'GRADUATED' }
]

const formData = ref({
  first_name: '',
  last_name: '',
  faculty: null as number | null,
  student_status: 'ACTIVE',
  student_number: '',
  email: ''
})

const rules = {
  required: (v: any) => !!v || 'This field is required'
}

const studentId = computed(() => {
  return route.params.id ? Number(route.params.id) : null
})

const loadStudent = async () => {
  if (!studentId.value) {
    snackbarText.value = 'Invalid student ID'
    snackbarColor.value = 'error'
    showSnackbar.value = true
    return
  }

  loading.value = true
  try {
    await studentStore.fetchStudentById(studentId.value)
    const student = studentStore.selectedItem
    
    if (student) {
      formData.value = {
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        faculty: typeof student.faculty === 'string' ? null : Number(student.faculty) || null,
        student_status: student.academic_status || 'ACTIVE',
        student_number: student.student_id || '',
        email: student.email || ''
      }
    } else {
      snackbarText.value = 'Student not found'
      snackbarColor.value = 'error'
      showSnackbar.value = true
      setTimeout(() => router.push('/admin/students'), 1500)
    }
  } catch (error) {
    console.error('Error loading student:', error)
    snackbarText.value = 'Error loading student'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  if (!isFormValid.value || !studentId.value) return

  saveLoading.value = true
  try {
    const studentData: any = {
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
      faculty_id: formData.value.faculty,
      student_status: formData.value.student_status
    }

    await studentStore.updateStudent(studentId.value, studentData)
    
    snackbarText.value = 'Student updated successfully'
    snackbarColor.value = 'success'
    showSnackbar.value = true

    // Navigate back to students list after short delay
    setTimeout(() => {
      router.push('/admin/students')
    }, 1500)

  } catch (error: any) {
    console.error('Error updating student:', error)
    snackbarText.value = error.message || 'Error updating student'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    saveLoading.value = false
  }
}

onMounted(async () => {
  try {
    // Load faculties first
    if (!facultyStore.items?.length) {
      await facultyStore.fetchFaculties()
    }
    
    // Then load the student data
    await loadStudent()
  } catch (error) {
    console.error('Error in component initialization:', error)
    snackbarText.value = 'Error loading data'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  }
})
</script>

<style scoped>
.edit-student-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style> 