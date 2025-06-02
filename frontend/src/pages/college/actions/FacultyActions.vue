<template>
  <base-actions
    title="Faculty"
    :selectedItem="selectedFaculty"
    @add="handleAddFaculty"
    @edit="handleEditFaculty"
  >
    <!-- Add Faculty Form -->
    <template #add-form>
      <div class="form-group">
        <label>Faculty Name</label>
        <input v-model="newFaculty.name" type="text" required>
      </div>
      <div class="form-group">
        <label>Faculty Code</label>
        <input v-model="newFaculty.code" type="text" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea v-model="newFaculty.description" rows="3" required></textarea>
      </div>
      <div class="form-group">
        <label>Dean</label>
        <select v-model="newFaculty.deanId" required>
          <option value="">Select Dean</option>
          <!-- Dean options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="newFaculty.status" required>
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </template>

    <!-- Edit Faculty Form -->
    <template #edit-form>
      <div class="form-group">
        <label>Faculty Name</label>
        <input v-model="editingFaculty.name" type="text" required>
      </div>
      <div class="form-group">
        <label>Faculty Code</label>
        <input v-model="editingFaculty.code" type="text" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea v-model="editingFaculty.description" rows="3" required></textarea>
      </div>
      <div class="form-group">
        <label>Dean</label>
        <select v-model="editingFaculty.deanId" required>
          <option value="">Select Dean</option>
          <!-- Dean options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="editingFaculty.status" required>
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
  name: 'FacultyActions',
  components: {
    BaseActions
  },
  props: {
    selectedFaculty: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      newFaculty: {
        name: '',
        code: '',
        description: '',
        deanId: '',
        status: ''
      },
      editingFaculty: {
        name: '',
        code: '',
        description: '',
        deanId: '',
        status: ''
      }
    }
  },
  watch: {
    selectedFaculty: {
      handler(newVal) {
        if (newVal) {
          this.editingFaculty = { ...newVal }
        }
      },
      immediate: true
    }
  },
  methods: {
    async handleAddFaculty() {
      try {
        // API call to add faculty
        this.$emit('faculty-added', this.newFaculty)
        this.resetNewFaculty()
      } catch (error) {
        console.error('Error adding faculty:', error)
      }
    },
    async handleEditFaculty() {
      try {
        // API call to update faculty
        this.$emit('faculty-updated', this.editingFaculty)
      } catch (error) {
        console.error('Error updating faculty:', error)
      }
    },
    resetNewFaculty() {
      this.newFaculty = {
        name: '',
        code: '',
        description: '',
        deanId: '',
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
