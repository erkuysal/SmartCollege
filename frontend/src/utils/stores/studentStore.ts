// src/stores/studentStore.ts
import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {StudentService} from '@/utils/services/studentService'
import type {Student} from '@/utils/interfaces/studentInterface'

export const useStudentStore = defineStore('student', () => {
  // ========== State ==========
  const students = ref<Student[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ========== Actions ==========

  /**
   * Fetches all students from the server and updates the state.
   */
  async function listAllStudents() {
    loading.value = true
    error.value = null
    try {
      students.value = await StudentService.listStudents()
    } catch (err) {
      // Convert err to a string message
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Creates a new student on the server and adds it to the store’s state.
   * @param newStudent - The student data to create
   */
  async function addStudent(newStudent: Student) {
    loading.value = true
    error.value = null
    try {
      const created = await StudentService.addStudent(newStudent)
      // Update local state to include this new student
      students.value.push(created)
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      loading.value = false
    }
  }

  // ========== Getters ==========

  /**
   * Returns the number of students in the store.
   */
  const totalStudents = computed(() => students.value.length)

  // Expose everything this store provides
  return {
    // State
    students,
    loading,
    error,
    // Actions
    listAllStudents,
    addStudent,
    // Getters
    totalStudents,
  }
})
