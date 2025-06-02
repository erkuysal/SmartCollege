<template>
  <base-actions
    title="Course"
    :selectedItem="selectedCourse"
    @add="handleAddCourse"
    @edit="handleEditCourse"
  >
    <!-- Add Course Form -->
    <template #add-form>
      <div class="form-group">
        <label>Course Name</label>
        <input v-model="newCourse.name" type="text" required>
      </div>
      <div class="form-group">
        <label>Course Code</label>
        <input v-model="newCourse.code" type="text" required>
      </div>
      <div class="form-group">
        <label>Department</label>
        <select v-model="newCourse.departmentId" required>
          <option value="">Select Department</option>
          <!-- Department options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Credits</label>
        <input v-model="newCourse.credits" type="number" min="1" required>
      </div>
      <div class="form-group">
        <label>Course Type</label>
        <select v-model="newCourse.type" required>
          <option value="">Select Type</option>
          <option value="lecture">Lecture</option>
          <option value="laboratory">Laboratory</option>
          <option value="seminar">Seminar</option>
          <option value="workshop">Workshop</option>
        </select>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea v-model="newCourse.description" rows="3" required></textarea>
      </div>
      <div class="form-group">
        <label>Prerequisites</label>
        <select v-model="newCourse.prerequisites" multiple>
          <option value="">Select Prerequisites</option>
          <!-- Course options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="newCourse.status" required>
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </template>

    <!-- Edit Course Form -->
    <template #edit-form>
      <div class="form-group">
        <label>Course Name</label>
        <input v-model="editingCourse.name" type="text" required>
      </div>
      <div class="form-group">
        <label>Course Code</label>
        <input v-model="editingCourse.code" type="text" required>
      </div>
      <div class="form-group">
        <label>Department</label>
        <select v-model="editingCourse.departmentId" required>
          <option value="">Select Department</option>
          <!-- Department options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Credits</label>
        <input v-model="editingCourse.credits" type="number" min="1" required>
      </div>
      <div class="form-group">
        <label>Course Type</label>
        <select v-model="editingCourse.type" required>
          <option value="">Select Type</option>
          <option value="lecture">Lecture</option>
          <option value="laboratory">Laboratory</option>
          <option value="seminar">Seminar</option>
          <option value="workshop">Workshop</option>
        </select>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea v-model="editingCourse.description" rows="3" required></textarea>
      </div>
      <div class="form-group">
        <label>Prerequisites</label>
        <select v-model="editingCourse.prerequisites" multiple>
          <option value="">Select Prerequisites</option>
          <!-- Course options will be populated here -->
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="editingCourse.status" required>
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
  name: 'CourseActions',
  components: {
    BaseActions
  },
  props: {
    selectedCourse: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      newCourse: {
        name: '',
        code: '',
        departmentId: '',
        credits: '',
        type: '',
        description: '',
        prerequisites: [],
        status: ''
      },
      editingCourse: {
        name: '',
        code: '',
        departmentId: '',
        credits: '',
        type: '',
        description: '',
        prerequisites: [],
        status: ''
      }
    }
  },
  watch: {
    selectedCourse: {
      handler(newVal) {
        if (newVal) {
          this.editingCourse = { ...newVal }
        }
      },
      immediate: true
    }
  },
  methods: {
    async handleAddCourse() {
      try {
        // API call to add course
        this.$emit('course-added', this.newCourse)
        this.resetNewCourse()
      } catch (error) {
        console.error('Error adding course:', error)
      }
    },
    async handleEditCourse() {
      try {
        // API call to update course
        this.$emit('course-updated', this.editingCourse)
      } catch (error) {
        console.error('Error updating course:', error)
      }
    },
    resetNewCourse() {
      this.newCourse = {
        name: '',
        code: '',
        departmentId: '',
        credits: '',
        type: '',
        description: '',
        prerequisites: [],
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

.form-group select[multiple] {
  height: 100px;
}
</style>
