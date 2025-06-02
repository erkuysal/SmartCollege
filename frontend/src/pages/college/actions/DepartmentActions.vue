<template>
  <base-actions
    title="Department"
    :selectedItem="selectedDepartment"
    @add="handleAddDepartment"
    @edit="handleEditDepartment"
  >
    <!-- Add Department Form -->
    <template #add-form>
      <div class="form-group">
        <label>Department Name</label>
        <input v-model="newDepartment.name" type="text" required>
      </div>
      <div class="form-group">
        <label>Department Code</label>
        <input v-model="newDepartment.code" type="text" required>
      </div>
      <div class="form-group">
        <label>Faculty</label>
        <select v-model="newDepartment.facultyId" required>
          <option value="">Select Faculty</option>
          <!-- Faculty options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Head of Department</label>
        <select v-model="newDepartment.headId" required>
          <option value="">Select Head</option>
          <!-- Head options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea v-model="newDepartment.description" rows="3" required></textarea>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="newDepartment.status" required>
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </template>

    <!-- Edit Department Form -->
    <template #edit-form>
      <div class="form-group">
        <label>Department Name</label>
        <input v-model="editingDepartment.name" type="text" required>
      </div>
      <div class="form-group">
        <label>Department Code</label>
        <input v-model="editingDepartment.code" type="text" required>
      </div>
      <div class="form-group">
        <label>Faculty</label>
        <select v-model="editingDepartment.facultyId" required>
          <option value="">Select Faculty</option>
          <!-- Faculty options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Head of Department</label>
        <select v-model="editingDepartment.headId" required>
          <option value="">Select Head</option>
          <!-- Head options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea v-model="editingDepartment.description" rows="3" required></textarea>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="editingDepartment.status" required>
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </template>
  </base-actions>
</template>

<script>
import BaseActions from '../../users/actions/BaseActions.vue'

export default {
  name: 'DepartmentActions',
  components: {
    BaseActions
  },
  props: {
    selectedDepartment: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      newDepartment: {
        name: '',
        code: '',
        facultyId: '',
        headId: '',
        description: '',
        status: ''
      },
      editingDepartment: {
        name: '',
        code: '',
        facultyId: '',
        headId: '',
        description: '',
        status: ''
      }
    }
  },
  watch: {
    selectedDepartment: {
      handler(newVal) {
        if (newVal) {
          this.editingDepartment = { ...newVal }
        }
      },
      immediate: true
    }
  },
  methods: {
    async handleAddDepartment() {
      try {
        // API call to add department
        this.$emit('department-added', this.newDepartment)
        this.resetNewDepartment()
      } catch (error) {
        console.error('Error adding department:', error)
      }
    },
    async handleEditDepartment() {
      try {
        // API call to update department
        this.$emit('department-updated', this.editingDepartment)
      } catch (error) {
        console.error('Error updating department:', error)
      }
    },
    resetNewDepartment() {
      this.newDepartment = {
        name: '',
        code: '',
        facultyId: '',
        headId: '',
        description: '',
        status: ''
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
