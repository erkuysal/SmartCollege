<template>
  <base-actions
    title="Enrollment"
    :selectedItem="selectedEnrollment"
    @add="handleAddEnrollment"
    @edit="handleEditEnrollment"
  >
    <!-- Add Enrollment Form -->
    <template #add-form>
      <div class="form-group">
        <label>Student</label>
        <select v-model="newEnrollment.studentId" required>
          <option value="">Select Student</option>
          <!-- Student options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Course</label>
        <select v-model="newEnrollment.courseId" required>
          <option value="">Select Course</option>
          <!-- Course options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Term</label>
        <select v-model="newEnrollment.termId" required>
          <option value="">Select Term</option>
          <!-- Term options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Enrollment Date</label>
        <input v-model="newEnrollment.enrollmentDate" type="date" required>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="newEnrollment.status" required>
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="dropped">Dropped</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div class="form-group">
        <label>Grade</label>
        <select v-model="newEnrollment.grade">
          <option value="">Select Grade</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="F">F</option>
          <option value="W">W</option>
          <option value="I">I</option>
        </select>
      </div>
    </template>

    <!-- Edit Enrollment Form -->
    <template #edit-form>
      <div class="form-group">
        <label>Student</label>
        <select v-model="editingEnrollment.studentId" required>
          <option value="">Select Student</option>
          <!-- Student options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Course</label>
        <select v-model="editingEnrollment.courseId" required>
          <option value="">Select Course</option>
          <!-- Course options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Term</label>
        <select v-model="editingEnrollment.termId" required>
          <option value="">Select Term</option>
          <!-- Term options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Enrollment Date</label>
        <input v-model="editingEnrollment.enrollmentDate" type="date" required>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="editingEnrollment.status" required>
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="dropped">Dropped</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div class="form-group">
        <label>Grade</label>
        <select v-model="editingEnrollment.grade">
          <option value="">Select Grade</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="F">F</option>
          <option value="W">W</option>
          <option value="I">I</option>
        </select>
      </div>
    </template>
  </base-actions>
</template>

<script>
import BaseActions from '../../users/actions/BaseActions.vue'

export default {
  name: 'EnrollmentActions',
  components: {
    BaseActions
  },
  props: {
    selectedEnrollment: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      newEnrollment: {
        studentId: '',
        courseId: '',
        termId: '',
        enrollmentDate: '',
        status: '',
        grade: ''
      },
      editingEnrollment: {
        studentId: '',
        courseId: '',
        termId: '',
        enrollmentDate: '',
        status: '',
        grade: ''
      }
    }
  },
  watch: {
    selectedEnrollment: {
      handler(newVal) {
        if (newVal) {
          this.editingEnrollment = { ...newVal }
        }
      },
      immediate: true
    }
  },
  methods: {
    async handleAddEnrollment() {
      try {
        // API call to add enrollment
        this.$emit('enrollment-added', this.newEnrollment)
        this.resetNewEnrollment()
      } catch (error) {
        console.error('Error adding enrollment:', error)
      }
    },
    async handleEditEnrollment() {
      try {
        // API call to update enrollment
        this.$emit('enrollment-updated', this.editingEnrollment)
      } catch (error) {
        console.error('Error updating enrollment:', error)
      }
    },
    resetNewEnrollment() {
      this.newEnrollment = {
        studentId: '',
        courseId: '',
        termId: '',
        enrollmentDate: '',
        status: '',
        grade: ''
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
