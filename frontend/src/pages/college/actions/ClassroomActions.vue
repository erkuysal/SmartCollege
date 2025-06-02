<template>
  <base-actions
    title="Classroom"
    :selectedItem="selectedClassroom"
    @add="handleAddClassroom"
    @edit="handleEditClassroom"
  >
    <!-- Add Classroom Form -->
    <template #add-form>
      <div class="form-group">
        <label>Room Number</label>
        <input v-model="newClassroom.roomNumber" type="text" required>
      </div>
      <div class="form-group">
        <label>Building</label>
        <input v-model="newClassroom.building" type="text" required>
      </div>
      <div class="form-group">
        <label>Floor</label>
        <input v-model="newClassroom.floor" type="number" min="0" required>
      </div>
      <div class="form-group">
        <label>Capacity</label>
        <input v-model="newClassroom.capacity" type="number" min="1" required>
      </div>
      <div class="form-group">
        <label>Room Type</label>
        <select v-model="newClassroom.type" required>
          <option value="">Select Type</option>
          <option value="lecture">Lecture Hall</option>
          <option value="seminar">Seminar Room</option>
          <option value="laboratory">Laboratory</option>
          <option value="computer">Computer Lab</option>
        </select>
      </div>
      <div class="form-group">
        <label>Facilities</label>
        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="newClassroom.facilities" value="projector">
            Projector
          </label>
          <label>
            <input type="checkbox" v-model="newClassroom.facilities" value="whiteboard">
            Whiteboard
          </label>
          <label>
            <input type="checkbox" v-model="newClassroom.facilities" value="computers">
            Computers
          </label>
          <label>
            <input type="checkbox" v-model="newClassroom.facilities" value="audio">
            Audio System
          </label>
        </div>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="newClassroom.status" required>
          <option value="">Select Status</option>
          <option value="available">Available</option>
          <option value="maintenance">Under Maintenance</option>
          <option value="reserved">Reserved</option>
        </select>
      </div>
    </template>

    <!-- Edit Classroom Form -->
    <template #edit-form>
      <div class="form-group">
        <label>Room Number</label>
        <input v-model="editingClassroom.roomNumber" type="text" required>
      </div>
      <div class="form-group">
        <label>Building</label>
        <input v-model="editingClassroom.building" type="text" required>
      </div>
      <div class="form-group">
        <label>Floor</label>
        <input v-model="editingClassroom.floor" type="number" min="0" required>
      </div>
      <div class="form-group">
        <label>Capacity</label>
        <input v-model="editingClassroom.capacity" type="number" min="1" required>
      </div>
      <div class="form-group">
        <label>Room Type</label>
        <select v-model="editingClassroom.type" required>
          <option value="">Select Type</option>
          <option value="lecture">Lecture Hall</option>
          <option value="seminar">Seminar Room</option>
          <option value="laboratory">Laboratory</option>
          <option value="computer">Computer Lab</option>
        </select>
      </div>
      <div class="form-group">
        <label>Facilities</label>
        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="editingClassroom.facilities" value="projector">
            Projector
          </label>
          <label>
            <input type="checkbox" v-model="editingClassroom.facilities" value="whiteboard">
            Whiteboard
          </label>
          <label>
            <input type="checkbox" v-model="editingClassroom.facilities" value="computers">
            Computers
          </label>
          <label>
            <input type="checkbox" v-model="editingClassroom.facilities" value="audio">
            Audio System
          </label>
        </div>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="editingClassroom.status" required>
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
  name: 'ClassroomActions',
  components: {
    BaseActions
  },
  props: {
    selectedClassroom: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      newClassroom: {
        roomNumber: '',
        building: '',
        floor: '',
        capacity: '',
        type: '',
        facilities: [],
        status: ''
      },
      editingClassroom: {
        roomNumber: '',
        building: '',
        floor: '',
        capacity: '',
        type: '',
        facilities: [],
        status: ''
      }
    }
  },
  watch: {
    selectedClassroom: {
      handler(newVal) {
        if (newVal) {
          this.editingClassroom = { ...newVal }
        }
      },
      immediate: true
    }
  },
  methods: {
    async handleAddClassroom() {
      try {
        // API call to add classroom
        this.$emit('classroom-added', this.newClassroom)
        this.resetNewClassroom()
      } catch (error) {
        console.error('Error adding classroom:', error)
      }
    },
    async handleEditClassroom() {
      try {
        // API call to update classroom
        this.$emit('classroom-updated', this.editingClassroom)
      } catch (error) {
        console.error('Error updating classroom:', error)
      }
    },
    resetNewClassroom() {
      this.newClassroom = {
        roomNumber: '',
        building: '',
        floor: '',
        capacity: '',
        type: '',
        facilities: [],
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

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: normal;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
}
</style>
