<template>
  <base-actions
    title="Facility"
    :selectedItem="selectedFacility"
    @add="handleAddFacility"
    @edit="handleEditFacility"
  >
    <!-- Add Facility Form -->
    <template #add-form>
      <div class="form-group">
        <label>Facility Name</label>
        <input v-model="newFacility.name" type="text" required>
      </div>
      <div class="form-group">
        <label>Facility Type</label>
        <select v-model="newFacility.type" required>
          <option value="">Select Type</option>
          <option value="classroom">Classroom</option>
          <option value="laboratory">Laboratory</option>
          <option value="library">Library</option>
          <option value="sports">Sports Facility</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Location</label>
        <input v-model="newFacility.location" type="text" required>
      </div>
      <div class="form-group">
        <label>Capacity</label>
        <input v-model="newFacility.capacity" type="number" min="1" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea v-model="newFacility.description" rows="3" required></textarea>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="newFacility.status" required>
          <option value="">Select Status</option>
          <option value="available">Available</option>
          <option value="maintenance">Under Maintenance</option>
          <option value="reserved">Reserved</option>
        </select>
      </div>
    </template>

    <!-- Edit Facility Form -->
    <template #edit-form>
      <div class="form-group">
        <label>Facility Name</label>
        <input v-model="editingFacility.name" type="text" required>
      </div>
      <div class="form-group">
        <label>Facility Type</label>
        <select v-model="editingFacility.type" required>
          <option value="">Select Type</option>
          <option value="classroom">Classroom</option>
          <option value="laboratory">Laboratory</option>
          <option value="library">Library</option>
          <option value="sports">Sports Facility</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Location</label>
        <input v-model="editingFacility.location" type="text" required>
      </div>
      <div class="form-group">
        <label>Capacity</label>
        <input v-model="editingFacility.capacity" type="number" min="1" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea v-model="editingFacility.description" rows="3" required></textarea>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="editingFacility.status" required>
          <option value="">Select Status</option>
          <option value="available">Available</option>
          <option value="maintenance">Under Maintenance</option>
          <option value="reserved">Reserved</option>
        </select>
      </div>
    </template>
  </base-actions>
</template>

<script>
import BaseActions from '../../users/actions/BaseActions.vue'

export default {
  name: 'FacilityActions',
  components: {
    BaseActions
  },
  props: {
    selectedFacility: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      newFacility: {
        name: '',
        type: '',
        location: '',
        capacity: '',
        description: '',
        status: ''
      },
      editingFacility: {
        name: '',
        type: '',
        location: '',
        capacity: '',
        description: '',
        status: ''
      }
    }
  },
  watch: {
    selectedFacility: {
      handler(newVal) {
        if (newVal) {
          this.editingFacility = { ...newVal }
        }
      },
      immediate: true
    }
  },
  methods: {
    async handleAddFacility() {
      try {
        // API call to add facility
        this.$emit('facility-added', this.newFacility)
        this.resetNewFacility()
      } catch (error) {
        console.error('Error adding facility:', error)
      }
    },
    async handleEditFacility() {
      try {
        // API call to update facility
        this.$emit('facility-updated', this.editingFacility)
      } catch (error) {
        console.error('Error updating facility:', error)
      }
    },
    resetNewFacility() {
      this.newFacility = {
        name: '',
        type: '',
        location: '',
        capacity: '',
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
