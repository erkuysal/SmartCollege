// src/stores/studentStore.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { StudentService } from '@/utils/services/studentService'
import type { Student } from '@/utils/interfaces/studentInterface'

export const useStudentStore = defineStore('student', () => {
  // ========== State ==========
  const students = ref<Student[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Optional: If you want to store RFID-related messages or status in state
  const rfidMessage = ref<string | null>(null)
  const rfidStatus = ref<{ valid?: boolean; error?: string } | null>(null)

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

  /**
   * Updates an existing student on the server, then updates it in the store’s state.
   * @param studentNumber - The student_number of the student to update
   * @param updateData - Partial fields to update
   */
  async function updateStudent(studentNumber: string, updateData: Partial<Student>) {
    loading.value = true
    error.value = null
    try {
      const updated = await StudentService.updateStudent(studentNumber, updateData)
      // Update local state to reflect the changes
      const index = students.value.findIndex((s) => s.student_number === studentNumber)
      if (index !== -1) {
        students.value[index] = updated
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Deletes an existing student on the server, then removes it from the store’s state.
   * @param studentNumber - The student_number of the student to delete
   */
  async function deleteStudent(studentNumber: string) {
    loading.value = true
    error.value = null
    try {
      await StudentService.deleteStudent(studentNumber)
      // Update local state to remove this student
      students.value = students.value.filter((s) => s.student_number !== studentNumber)
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Writes RFID data for a specific student.
   * @param studentNumber - The student_number to associate with the card
   */
  async function writeRFID(studentNumber: string) {
    loading.value = true
    error.value = null
    rfidMessage.value = null
    try {
      const response = await StudentService.writeRFID(studentNumber)
      rfidMessage.value = response.message
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Reads RFID data from the card and validates it against the DB.
   */
  async function readRFID() {
    loading.value = true
    error.value = null
    rfidMessage.value = null
    rfidStatus.value = null
    try {
      const data = await StudentService.readRFID()
      // data = { message?: string, valid?: boolean, error?: string }
      if (data.message) rfidMessage.value = data.message
      rfidStatus.value = { valid: data.valid, error: data.error }
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
    rfidMessage,
    rfidStatus,

    // Actions
    listAllStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    writeRFID,
    readRFID,

    // Getters
    totalStudents,
  }
})
