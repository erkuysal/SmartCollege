<template>
  <base-actions
    title="Binding"
    :selectedItem="selectedBinding"
    @add="handleAddBinding"
    @edit="handleEditBinding"
  >
    <!-- Add Binding Form -->
    <template #add-form>
      <div class="form-group">
        <label>Student</label>
        <select v-model="newBinding.studentId" required>
          <option value="">Select Student</option>
          <!-- Student options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Course</label>
        <select v-model="newBinding.courseId" required>
          <option value="">Select Course</option>
          <!-- Course options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Lecturer</label>
        <select v-model="newBinding.lecturerId" required>
          <option value="">Select Lecturer</option>
          <!-- Lecturer options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Term</label>
        <select v-model="newBinding.termId" required>
          <option value="">Select Term</option>
          <!-- Term options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Binding Date</label>
        <input v-model="newBinding.bindingDate" type="date" required>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="newBinding.status" required>
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </template>

    <!-- Edit Binding Form -->
    <template #edit-form>
      <div class="form-group">
        <label>Student</label>
        <select v-model="editingBinding.studentId" required>
          <option value="">Select Student</option>
          <!-- Student options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Course</label>
        <select v-model="editingBinding.courseId" required>
          <option value="">Select Course</option>
          <!-- Course options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Lecturer</label>
        <select v-model="editingBinding.lecturerId" required>
          <option value="">Select Lecturer</option>
          <!-- Lecturer options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Term</label>
        <select v-model="editingBinding.termId" required>
          <option value="">Select Term</option>
          <!-- Term options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Binding Date</label>
        <input v-model="editingBinding.bindingDate" type="date" required>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="editingBinding.status" required>
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </template>
  </base-actions>
</template>

<script>
import BaseActions from '../../users/actions/BaseActions.vue'

export default {
  name: 'BindingActions',
  components: {
    BaseActions
  },
  props: {
    selectedBinding: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      newBinding: {
        studentId: '',
        courseId: '',
        lecturerId: '',
        termId: '',
        bindingDate: '',
        status: ''
      },
      editingBinding: {
        studentId: '',
        courseId: '',
        lecturerId: '',
        termId: '',
        bindingDate: '',
        status: ''
      }
    }
  },
  watch: {
    selectedBinding: {
      handler(newVal) {
        if (newVal) {
          this.editingBinding = { ...newVal }
        }
      },
      immediate: true
    }
  },
  methods: {
    async handleAddBinding() {
      try {
        // API call to add binding
        this.$emit('binding-added', this.newBinding)
        this.resetNewBinding()
      } catch (error) {
        console.error('Error adding binding:', error)
      }
    },
    async handleEditBinding() {
      try {
        // API call to update binding
        this.$emit('binding-updated', this.editingBinding)
      } catch (error) {
        console.error('Error updating binding:', error)
      }
    },
    resetNewBinding() {
      this.newBinding = {
        studentId: '',
        courseId: '',
        lecturerId: '',
        termId: '',
        bindingDate: '',
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
