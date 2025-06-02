<template>
  <base-actions
    title="Lecturer"
    :selectedItem="selectedLecturer"
    @add="handleAddLecturer"
    @edit="handleEditLecturer"
  >
    <!-- Add Lecturer Form -->
    <template #add-form>
      <div class="form-group">
        <label>Lecturer ID</label>
        <input v-model="newLecturer.lecturerId" type="text" required>
      </div>
      <div class="form-group">
        <label>First Name</label>
        <input v-model="newLecturer.firstName" type="text" required>
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <input v-model="newLecturer.lastName" type="text" required>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="newLecturer.email" type="email" required>
      </div>
      <div class="form-group">
        <label>Department</label>
        <select v-model="newLecturer.departmentId" required>
          <option value="">Select Department</option>
          <!-- Department options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Specialization</label>
        <input v-model="newLecturer.specialization" type="text" required>
      </div>
      <div class="form-group">
        <label>Academic Rank</label>
        <select v-model="newLecturer.academicRank" required>
          <option value="">Select Rank</option>
          <option value="professor">Professor</option>
          <option value="associate">Associate Professor</option>
          <option value="assistant">Assistant Professor</option>
          <option value="lecturer">Lecturer</option>
        </select>
      </div>
      <div class="form-group">
        <label>Qualifications</label>
        <textarea v-model="newLecturer.qualifications" rows="3" required></textarea>
      </div>
    </template>

    <!-- Edit Lecturer Form -->
    <template #edit-form>
      <div class="form-group">
        <label>Lecturer ID</label>
        <input v-model="editingLecturer.lecturerId" type="text" required>
      </div>
      <div class="form-group">
        <label>First Name</label>
        <input v-model="editingLecturer.firstName" type="text" required>
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <input v-model="editingLecturer.lastName" type="text" required>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="editingLecturer.email" type="email" required>
      </div>
      <div class="form-group">
        <label>Department</label>
        <select v-model="editingLecturer.departmentId" required>
          <option value="">Select Department</option>
          <!-- Department options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Specialization</label>
        <input v-model="editingLecturer.specialization" type="text" required>
      </div>
      <div class="form-group">
        <label>Academic Rank</label>
        <select v-model="editingLecturer.academicRank" required>
          <option value="">Select Rank</option>
          <option value="professor">Professor</option>
          <option value="associate">Associate Professor</option>
          <option value="assistant">Assistant Professor</option>
          <option value="lecturer">Lecturer</option>
        </select>
      </div>
      <div class="form-group">
        <label>Qualifications</label>
        <textarea v-model="editingLecturer.qualifications" rows="3" required></textarea>
      </div>
    </template>
  </base-actions>
</template>

<script>
import BaseActions from './BaseActions.vue'

export default {
  name: 'LecturerActions',
  components: {
    BaseActions
  },
  props: {
    selectedLecturer: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      newLecturer: {
        lecturerId: '',
        firstName: '',
        lastName: '',
        email: '',
        departmentId: '',
        specialization: '',
        academicRank: '',
        qualifications: ''
      },
      editingLecturer: {
        lecturerId: '',
        firstName: '',
        lastName: '',
        email: '',
        departmentId: '',
        specialization: '',
        academicRank: '',
        qualifications: ''
      }
    }
  },
  watch: {
    selectedLecturer: {
      handler(newVal) {
        if (newVal) {
          this.editingLecturer = { ...newVal }
        }
      },
      immediate: true
    }
  },
  methods: {
    async handleAddLecturer() {
      try {
        // API call to add lecturer
        this.$emit('lecturer-added', this.newLecturer)
        this.resetNewLecturer()
      } catch (error) {
        console.error('Error adding lecturer:', error)
      }
    },
    async handleEditLecturer() {
      try {
        // API call to update lecturer
        this.$emit('lecturer-updated', this.editingLecturer)
      } catch (error) {
        console.error('Error updating lecturer:', error)
      }
    },
    resetNewLecturer() {
      this.newLecturer = {
        lecturerId: '',
        firstName: '',
        lastName: '',
        email: '',
        departmentId: '',
        specialization: '',
        academicRank: '',
        qualifications: ''
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
