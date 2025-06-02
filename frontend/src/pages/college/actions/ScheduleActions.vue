<template>
  <base-actions
    title="Schedule"
    :selectedItem="selectedSchedule"
    @add="handleAddSchedule"
    @edit="handleEditSchedule"
  >
    <!-- Add Schedule Form -->
    <template #add-form>
      <div class="form-group">
        <label>Course</label>
        <select v-model="newSchedule.courseId" required>
          <option value="">Select Course</option>
          <!-- Course options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Classroom</label>
        <select v-model="newSchedule.classroomId" required>
          <option value="">Select Classroom</option>
          <!-- Classroom options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Day of Week</label>
        <select v-model="newSchedule.dayOfWeek" required>
          <option value="">Select Day</option>
          <option value="monday">Monday</option>
          <option value="tuesday">Tuesday</option>
          <option value="wednesday">Wednesday</option>
          <option value="thursday">Thursday</option>
          <option value="friday">Friday</option>
        </select>
      </div>
      <div class="form-group">
        <label>Start Time</label>
        <input v-model="newSchedule.startTime" type="time" required>
      </div>
      <div class="form-group">
        <label>End Time</label>
        <input v-model="newSchedule.endTime" type="time" required>
      </div>
      <div class="form-group">
        <label>Term</label>
        <select v-model="newSchedule.termId" required>
          <option value="">Select Term</option>
          <!-- Term options will be populated here -->
        </select>
      </div>
    </template>

    <!-- Edit Schedule Form -->
    <template #edit-form>
      <div class="form-group">
        <label>Course</label>
        <select v-model="editingSchedule.courseId" required>
          <option value="">Select Course</option>
          <!-- Course options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Classroom</label>
        <select v-model="editingSchedule.classroomId" required>
          <option value="">Select Classroom</option>
          <!-- Classroom options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Day of Week</label>
        <select v-model="editingSchedule.dayOfWeek" required>
          <option value="">Select Day</option>
          <option value="monday">Monday</option>
          <option value="tuesday">Tuesday</option>
          <option value="wednesday">Wednesday</option>
          <option value="thursday">Thursday</option>
          <option value="friday">Friday</option>
        </select>
      </div>
      <div class="form-group">
        <label>Start Time</label>
        <input v-model="editingSchedule.startTime" type="time" required>
      </div>
      <div class="form-group">
        <label>End Time</label>
        <input v-model="editingSchedule.endTime" type="time" required>
      </div>
      <div class="form-group">
        <label>Term</label>
        <select v-model="editingSchedule.termId" required>
          <option value="">Select Term</option>
          <!-- Term options will be populated here -->
        </select>
      </div>
    </template>
  </base-actions>
</template>

<script>
import BaseActions from '../../users/actions/BaseActions.vue'

export default {
  name: 'ScheduleActions',
  components: {
    BaseActions
  },
  props: {
    selectedSchedule: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      newSchedule: {
        courseId: '',
        classroomId: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        termId: ''
      },
      editingSchedule: {
        courseId: '',
        classroomId: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        termId: ''
      }
    }
  },
  watch: {
    selectedSchedule: {
      handler(newVal) {
        if (newVal) {
          this.editingSchedule = { ...newVal }
        }
      },
      immediate: true
    }
  },
  methods: {
    async handleAddSchedule() {
      try {
        // API call to add schedule
        this.$emit('schedule-added', this.newSchedule)
        this.resetNewSchedule()
      } catch (error) {
        console.error('Error adding schedule:', error)
      }
    },
    async handleEditSchedule() {
      try {
        // API call to update schedule
        this.$emit('schedule-updated', this.editingSchedule)
      } catch (error) {
        console.error('Error updating schedule:', error)
      }
    },
    resetNewSchedule() {
      this.newSchedule = {
        courseId: '',
        classroomId: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        termId: ''
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
