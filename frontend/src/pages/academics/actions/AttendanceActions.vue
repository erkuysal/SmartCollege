<template>
  <base-actions
    title="Attendance"
    :selectedItem="selectedAttendance"
    @add="handleAddAttendance"
    @edit="handleEditAttendance"
  >
    <!-- Add Attendance Form -->
    <template #add-form>
      <div class="form-group">
        <label>Student</label>
        <select v-model="newAttendance.studentId" required>
          <option value="">Select Student</option>
          <!-- Student options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Course</label>
        <select v-model="newAttendance.courseId" required>
          <option value="">Select Course</option>
          <!-- Course options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Date</label>
        <input v-model="newAttendance.date" type="date" required>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="newAttendance.status" required>
          <option value="">Select Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="excused">Excused</option>
        </select>
      </div>
      <div class="form-group">
        <label>Notes</label>
        <textarea v-model="newAttendance.notes" rows="3"></textarea>
      </div>
    </template>

    <!-- Edit Attendance Form -->
    <template #edit-form>
      <div class="form-group">
        <label>Student</label>
        <select v-model="editingAttendance.studentId" required>
          <option value="">Select Student</option>
          <!-- Student options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Course</label>
        <select v-model="editingAttendance.courseId" required>
          <option value="">Select Course</option>
          <!-- Course options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Date</label>
        <input v-model="editingAttendance.date" type="date" required>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="editingAttendance.status" required>
          <option value="">Select Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="excused">Excused</option>
        </select>
      </div>
      <div class="form-group">
        <label>Notes</label>
        <textarea v-model="editingAttendance.notes" rows="3"></textarea>
      </div>
    </template>
  </base-actions>
</template>

<script>
import BaseActions from '../../users/actions/BaseActions.vue'

export default {
  name: 'AttendanceActions',
  components: {
    BaseActions
  },
  props: {
    selectedAttendance: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      newAttendance: {
        studentId: '',
        courseId: '',
        date: '',
        status: '',
        notes: ''
      },
      editingAttendance: {
        studentId: '',
        courseId: '',
        date: '',
        status: '',
        notes: ''
      }
    }
  },
  watch: {
    selectedAttendance: {
      handler(newVal) {
        if (newVal) {
          this.editingAttendance = { ...newVal }
        }
      },
      immediate: true
    }
  },
  methods: {
    async handleAddAttendance() {
      try {
        // API call to add attendance
        this.$emit('attendance-added', this.newAttendance)
        this.resetNewAttendance()
      } catch (error) {
        console.error('Error adding attendance:', error)
      }
    },
    async handleEditAttendance() {
      try {
        // API call to update attendance
        this.$emit('attendance-updated', this.editingAttendance)
      } catch (error) {
        console.error('Error updating attendance:', error)
      }
    },
    resetNewAttendance() {
      this.newAttendance = {
        studentId: '',
        courseId: '',
        date: '',
        status: '',
        notes: ''
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2196F3;
}
</style>
