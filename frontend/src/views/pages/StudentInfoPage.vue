<template>
  <v-container>

    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64" color="primary" />
    </v-overlay>

    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <span class="text-h5">Student Information</span>
          </v-card-title>
          <v-card-text>
            <v-alert v-if="error" type="error" outlined>
              {{ error }}
            </v-alert>
            <div v-else-if="student">
              <v-list>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Student Number</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ student.student_number }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>First Name</v-list-item-title>
                    <v-list-item-subtitle>{{ student.first_name }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Last Name</v-list-item-title>
                    <v-list-item-subtitle>{{ student.last_name }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Email</v-list-item-title>
                    <v-list-item-subtitle>{{ student.email }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
// import {onBeforeMount, onMounted} from "vue";
// import { useRoute } from "vue-router";
// import { useStudentStore } from "@/utils/stores/studentStore";
//
// // Access the student store
// const studentStore = useStudentStore();
//
// // Destructure required state and actions from the store
// const { currentStudent: student, error, loading, fetchStudentByNumber } = studentStore;
//
// // Router setup
// const route = useRoute();
//
// // Fetch student details on mount
// onMounted(async () => {
//   const student_number = route.params.student_number as string;
//   await fetchStudentByNumber(student_number); // Fetch student using the store
// });


// ---------------------------------------------------
// import { watch } from 'vue'
// import { useRoute } from 'vue-router'
// import { useStudentStore } from '@/utils/stores/studentStore'
//
// const route = useRoute()
// const studentStore = useStudentStore()
// const { currentStudent: student, error, loading, fetchStudentByNumber } = studentStore;
//
// onMounted(() => {
//   // Initial fetch
//   fetchStudentByNumber(route.params.student_number as string)
// })
//
// // Watch for param changes
// watch(
//   () => route.params.student_number,
//   (newVal, oldVal) => {
//     if (newVal && newVal !== oldVal) {
//       fetchStudentByNumber(newVal as string)
//     }
//   }
// )

// ---------------------------------------------------------

import { onMounted, watch } from "vue"
import { useRoute } from "vue-router"
import { useStudentStore } from "@/utils/stores/studentStore"

const route = useRoute()
const studentStore = useStudentStore()
const { currentStudent, fetchStudentByNumber } = studentStore

onMounted(() => {
  // Fetch on first load
  const studentNumber = route.params.student_number as string
  fetchStudentByNumber(studentNumber)
})

// Watch for changes to :student_number
watch(
  () => route.params.student_number,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      fetchStudentByNumber(newVal as string)
    }
  }
)

</script>
