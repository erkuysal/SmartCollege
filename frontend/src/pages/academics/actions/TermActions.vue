<template>
  <base-actions
    title="Term"
    :selectedItem="selectedTerm"
    @add="handleAddTerm"
    @edit="handleEditTerm"
  >
    <!-- Add Term Form -->
    <template #add-form>
      <div class="form-group">
        <label>Term Name</label>
        <input v-model="newTerm.name" type="text" required>
      </div>
      <div class="form-group">
        <label>Academic Year</label>
        <input v-model="newTerm.academicYear" type="text" required>
      </div>
      <div class="form-group">
        <label>Start Date</label>
        <input v-model="newTerm.startDate" type="date" required>
      </div>
      <div class="form-group">
        <label>End Date</label>
        <input v-model="newTerm.endDate" type="date" required>
      </div>
      <div class="form-group">
        <label>Term Type</label>
        <select v-model="newTerm.type" required>
          <option value="">Select Type</option>
          <option value="fall">Fall</option>
          <option value="spring">Spring</option>
          <option value="summer">Summer</option>
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="newTerm.status" required>
          <option value="">Select Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="current">Current</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </template>

    <!-- Edit Term Form -->
    <template #edit-form>
      <div class="form-group">
        <label>Term Name</label>
        <input v-model="editingTerm.name" type="text" required>
      </div>
      <div class="form-group">
        <label>Academic Year</label>
        <input v-model="editingTerm.academicYear" type="text" required>
      </div>
      <div class="form-group">
        <label>Start Date</label>
        <input v-model="editingTerm.startDate" type="date" required>
      </div>
      <div class="form-group">
        <label>End Date</label>
        <input v-model="editingTerm.endDate" type="date" required>
      </div>
      <div class="form-group">
        <label>Term Type</label>
        <select v-model="editingTerm.type" required>
          <option value="">Select Type</option>
          <option value="fall">Fall</option>
          <option value="spring">Spring</option>
          <option value="summer">Summer</option>
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="editingTerm.status" required>
          <option value="">Select Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="current">Current</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </template>
  </base-actions>
</template>

<script>
import BaseActions from '../../users/actions/BaseActions.vue'

export default {
  name: 'TermActions',
  components: {
    BaseActions
  },
  props: {
    selectedTerm: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      newTerm: {
        name: '',
        academicYear: '',
        startDate: '',
        endDate: '',
        type: '',
        status: ''
      },
      editingTerm: {
        name: '',
        academicYear: '',
        startDate: '',
        endDate: '',
        type: '',
        status: ''
      }
    }
  },
  watch: {
    selectedTerm: {
      handler(newVal) {
        if (newVal) {
          this.editingTerm = { ...newVal }
        }
      },
      immediate: true
    }
  },
  methods: {
    async handleAddTerm() {
      try {
        // API call to add term
        this.$emit('term-added', this.newTerm)
        this.resetNewTerm()
      } catch (error) {
        console.error('Error adding term:', error)
      }
    },
    async handleEditTerm() {
      try {
        // API call to update term
        this.$emit('term-updated', this.editingTerm)
      } catch (error) {
        console.error('Error updating term:', error)
      }
    },
    resetNewTerm() {
      this.newTerm = {
        name: '',
        academicYear: '',
        startDate: '',
        endDate: '',
        type: '',
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
