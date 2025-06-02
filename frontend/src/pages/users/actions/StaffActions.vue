<template>
  <base-actions
    title="Staff"
    :selectedItem="selectedStaff"
    @add="handleAddStaff"
    @edit="handleEditStaff"
  >
    <!-- Add Staff Form -->
    <template #add-form>
      <div class="form-group">
        <label>Staff ID</label>
        <input v-model="newStaff.staffId" type="text" required>
      </div>
      <div class="form-group">
        <label>First Name</label>
        <input v-model="newStaff.firstName" type="text" required>
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <input v-model="newStaff.lastName" type="text" required>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="newStaff.email" type="email" required>
      </div>
      <div class="form-group">
        <label>Department</label>
        <select v-model="newStaff.departmentId" required>
          <option value="">Select Department</option>
          <!-- Department options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Position</label>
        <input v-model="newStaff.position" type="text" required>
      </div>
      <div class="form-group">
        <label>Role</label>
        <select v-model="newStaff.role" required>
          <option value="">Select Role</option>
          <option value="admin">Administrator</option>
          <option value="staff">Staff Member</option>
          <option value="support">Support Staff</option>
        </select>
      </div>
    </template>

    <!-- Edit Staff Form -->
    <template #edit-form>
      <div class="form-group">
        <label>Staff ID</label>
        <input v-model="editingStaff.staffId" type="text" required>
      </div>
      <div class="form-group">
        <label>First Name</label>
        <input v-model="editingStaff.firstName" type="text" required>
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <input v-model="editingStaff.lastName" type="text" required>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="editingStaff.email" type="email" required>
      </div>
      <div class="form-group">
        <label>Department</label>
        <select v-model="editingStaff.departmentId" required>
          <option value="">Select Department</option>
          <!-- Department options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Position</label>
        <input v-model="editingStaff.position" type="text" required>
      </div>
      <div class="form-group">
        <label>Role</label>
        <select v-model="editingStaff.role" required>
          <option value="">Select Role</option>
          <option value="admin">Administrator</option>
          <option value="staff">Staff Member</option>
          <option value="support">Support Staff</option>
        </select>
      </div>
    </template>
  </base-actions>
</template>

<script>
import BaseActions from './BaseActions.vue'

export default {
  name: 'StaffActions',
  components: {
    BaseActions
  },
  props: {
    selectedStaff: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      newStaff: {
        staffId: '',
        firstName: '',
        lastName: '',
        email: '',
        departmentId: '',
        position: '',
        role: ''
      },
      editingStaff: {
        staffId: '',
        firstName: '',
        lastName: '',
        email: '',
        departmentId: '',
        position: '',
        role: ''
      }
    }
  },
  watch: {
    selectedStaff: {
      handler(newVal) {
        if (newVal) {
          this.editingStaff = { ...newVal }
        }
      },
      immediate: true
    }
  },
  methods: {
    async handleAddStaff() {
      try {
        // API call to add staff
        this.$emit('staff-added', this.newStaff)
        this.resetNewStaff()
      } catch (error) {
        console.error('Error adding staff:', error)
      }
    },
    async handleEditStaff() {
      try {
        // API call to update staff
        this.$emit('staff-updated', this.editingStaff)
      } catch (error) {
        console.error('Error updating staff:', error)
      }
    },
    resetNewStaff() {
      this.newStaff = {
        staffId: '',
        firstName: '',
        lastName: '',
        email: '',
        departmentId: '',
        position: '',
        role: ''
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
