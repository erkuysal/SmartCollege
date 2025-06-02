<template>
  <base-actions
    title="Student"
    :selectedItem="selectedStudent"
    @add="handleAddStudent"
    @edit="handleEditStudent"
  >
    <!-- Add Student Form -->
    <template #add-form>
      <div class="form-group">
        <label>Student ID</label>
        <input v-model="newStudent.studentId" type="text" required>
      </div>
      <div class="form-group">
        <label>First Name</label>
        <input v-model="newStudent.firstName" type="text" required>
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <input v-model="newStudent.lastName" type="text" required>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="newStudent.email" type="email" required>
      </div>
      <div class="form-group">
        <label>Department</label>
        <select v-model="newStudent.departmentId" required>
          <option value="">Select Department</option>
          <!-- Department options will be populated here -->
        </select>
      </div>
    </template>

    <!-- Edit Student Form -->
    <template #edit-form>
      <div class="form-group">
        <label>Student ID</label>
        <input v-model="editingStudent.studentId" type="text" required>
      </div>
      <div class="form-group">
        <label>First Name</label>
        <input v-model="editingStudent.firstName" type="text" required>
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <input v-model="editingStudent.lastName" type="text" required>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="editingStudent.email" type="email" required>
      </div>
      <div class="form-group">
        <label>Department</label>
        <select v-model="editingStudent.departmentId" required>
          <option value="">Select Department</option>
          <!-- Department options will be populated here -->
        </select>
      </div>
    </template>
  </base-actions>
</template>

<script>
import BaseActions from './BaseActions.vue'

export default {
  name: 'StudentActions',
  components: {
    BaseActions
  },
  props: {
    selectedStudent: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      newStudent: {
        studentId: '',
        firstName: '',
        lastName: '',
        email: '',
        departmentId: ''
      },
      editingStudent: {
        studentId: '',
        firstName: '',
        lastName: '',
        email: '',
        departmentId: ''
      }
    }
  },
  watch: {
    selectedStudent: {
      handler(newVal) {
        if (newVal) {
          this.editingStudent = { ...newVal }
        }
      },
      immediate: true
    }
  },
  methods: {
    async handleAddStudent() {
      try {
        // API call to add student
        this.$emit('student-added', this.newStudent)
        this.resetNewStudent()
      } catch (error) {
        console.error('Error adding student:', error)
      }
    },
    async handleEditStudent() {
      try {
        // API call to update student
        this.$emit('student-updated', this.editingStudent)
      } catch (error) {
        console.error('Error updating student:', error)
      }
    },
    resetNewStudent() {
      this.newStudent = {
        studentId: '',
        firstName: '',
        lastName: '',
        email: '',
        departmentId: ''
      }
    }
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2196F3;
}
</style>
