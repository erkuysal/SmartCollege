<template>
  <v-container class="py-5">
    <h1 class="text-h4 mb-4">Add Student</h1>

    <v-alert
      v-if="store.error"
      type="error"
      class="mb-4"
      border="start"
      elevation="2"
    >
      {{ store.error }}
    </v-alert>

    <v-progress-linear
      v-if="store.loading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <v-form
      ref="form"
      @submit.prevent="onSubmit"
    >
      <v-text-field
        v-model="newStudent.first_name"
        label="First Name"
        variant="outlined"
        required
        class="mb-4"
      />

      <v-text-field
        v-model="newStudent.last_name"
        label="Last Name"
        variant="outlined"
        required
        class="mb-4"
      />

      <v-text-field
        v-model="newStudent.email"
        label="Email"
        variant="outlined"
        type="email"
        required
        class="mb-4"
      />

      <div class="d-flex gap-2">
        <v-btn
          type="submit"
          color="primary"
          :disabled="store.loading"
        >
          Add Student
        </v-btn>

        <v-btn
          color="secondary"
          :disabled="store.loading"
          @click="router.back()"
        >
          Cancel
        </v-btn>
      </div>
    </v-form>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentStore } from '@/utils/stores/users/studentStore'
import type { Student } from '@/utils/interfaces/users/studentInterface'

const router = useRouter()
const store = useStudentStore()
const form = ref<any>(null)

const newStudent = ref({
  first_name: '',
  last_name: '',
  email: '',
})

async function onSubmit() {
  try {
    if (!form.value?.validate()) return

    await store.addStudent(newStudent.value as Omit<Student, 'student_number'>)
    
    // Clear form after successful creation
    newStudent.value = {
      first_name: '',
      last_name: '',
      email: '',
    }

    await router.push({ name: 'students' })
  } catch (error) {
    console.error('Failed to add student:', error)
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
