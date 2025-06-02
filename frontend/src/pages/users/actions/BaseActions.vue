<template>
  <div class="base-actions">
    <div class="action-buttons">
      <button class="action-button add" @click="handleAdd">
        <i class="fas fa-plus"></i> Add New
      </button>
      <button class="action-button edit" @click="handleEdit" :disabled="!selectedItem">
        <i class="fas fa-edit"></i> Edit
      </button>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="modal">
      <div class="modal-content">
        <h3>Add New {{ title }}</h3>
        <form @submit.prevent="submitAdd">
          <slot name="add-form"></slot>
          <div class="modal-actions">
            <button type="button" @click="closeAddModal">Cancel</button>
            <button type="submit">Add</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <h3>Edit {{ title }}</h3>
        <form @submit.prevent="submitEdit">
          <slot name="edit-form"></slot>
          <div class="modal-actions">
            <button type="button" @click="closeEditModal">Cancel</button>
            <button type="submit">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseActions',
  props: {
    title: {
      type: String,
      required: true
    },
    selectedItem: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showAddModal: false,
      showEditModal: false
    }
  },
  methods: {
    handleAdd() {
      this.showAddModal = true
    },
    handleEdit() {
      if (this.selectedItem) {
        this.showEditModal = true
      }
    },
    closeAddModal() {
      this.showAddModal = false
    },
    closeEditModal() {
      this.showEditModal = false
    },
    async submitAdd() {
      this.$emit('add')
      this.closeAddModal()
    },
    async submitEdit() {
      this.$emit('edit')
      this.closeEditModal()
    }
  }
}
</script>

<style scoped>
.base-actions {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

.action-button.add {
  background-color: #4CAF50;
  color: white;
}

.action-button.edit {
  background-color: #2196F3;
  color: white;
}

.action-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 400px;
  max-width: 600px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button[type="submit"] {
  background-color: #4CAF50;
  color: white;
}

.modal-actions button[type="button"] {
  background-color: #f44336;
  color: white;
}
</style>
