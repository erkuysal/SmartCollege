<template>
  <v-container class="py-5">
    <h1 class="text-h4 mb-4">Add Student</h1>

    <!-- Optional: Display error if something goes wrong -->
    <v-alert
      v-if="store.error"
      type="error"
      class="mb-4"
    >
      {{ store.error }}
    </v-alert>

    <!-- Optional: Display a loading indicator when submitting -->
    <v-progress-linear
      v-if="store.loading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <v-form
      ref="studentForm"
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
        class="mb-4"
      />

      <v-btn
        type="submit"
        color="primary"
        :disabled="store.loading"
        class="me-2"
      >
        Add Student
      </v-btn>
    </v-form>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useStudentStore } from '@/utils/stores/studentStore'
import { useRouter } from 'vue-router'
import type { Student } from '@/utils/interfaces/studentInterface'

const router = useRouter()

/**
 * Pinia store reference
 */
const store = useStudentStore()

/**
 * Reactive student object for binding our form fields
 */
const newStudent = ref<Student>({
  first_name: '',
  last_name: '',
  email: '',
})

/**
 * onSubmit - calls the Pinia store action to create a new student,
 * then clears the form (optional).
 */
async function onSubmit() {
  try {
    await store.addStudent(newStudent.value)
    // Clear form after successful creation
    newStudent.value = {
      first_name: '',
      last_name: '',
      email: '',
    }

    await router.push({ name: 'students' });
  } catch (error) {
    // The store action already sets store.error.
    // Additional handling (e.g., global toast) can go here if needed.
  }
}
</script>

<style scoped>
/* You can apply custom styles if needed */
</style>
