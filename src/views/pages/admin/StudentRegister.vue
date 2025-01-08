<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card>
          <v-card-title>
            <span class="text-h5">Register Student</span>
          </v-card-title>

          <v-card-text>
            <v-form ref="formRef" v-model="isFormValid">
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.firstName"
                    label="First Name"
                    outlined
                    required
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.lastName"
                    label="Last Name"
                    outlined
                    required
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-text-field
                v-model="formData.email"
                label="Email"
                type="email"
                outlined
                required
                :rules="[rules.required, rules.email]"
              ></v-text-field>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="submitForm">Submit</v-btn>
            <v-btn color="secondary" @click="resetForm">Reset</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useStudentStore } from "@/utils/stores/userStore"

// 1. Set up reactive data for the form
const formData = ref({
  firstName: "",
  lastName: "",
  email: "",
})

// 2. Validation rules
const rules = {
  required: (value: string) => !!value || "Field is required.",
  email: (value: string) =>
    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
    "Invalid email format.",
}

// 3. Form validation references
const isFormValid = ref(false)
const formRef = ref<never>(null)

// 4. Use the store
const studentStore = useStudentStore()

// 5. Handle form submission
const submitForm = async () => {
  if (formRef.value.validate()) {
    try {
      const newStudent = await studentStore.createStudent({
        student_number,
        first_name: formData.value.firstName,
        last_name: formData.value.lastName,
        email: formData.value.email,
      })
      console.log("Created new student:", newStudent)

      // Reset the form upon success
      resetForm()
    } catch (error) {
      console.error("Error creating student:", error)
    }
  } else {
    console.log("Validation failed.")
  }
}

// 6. Reset the form
const resetForm = () => {
  formData.value = {
    firstName: "",
    lastName: "",
    email: "",
  }
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}
</script>

<style scoped>
/* Add any custom styles for responsiveness or design adjustments */
</style>
