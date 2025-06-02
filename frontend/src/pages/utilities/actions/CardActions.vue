<template>
  <base-actions
    title="Card"
    :selectedItem="selectedCard"
    @add="handleAddCard"
    @edit="handleEditCard"
  >
    <!-- Add Card Form -->
    <template #add-form>
      <div class="form-group">
        <label>Card Number</label>
        <input v-model="newCard.cardNumber" type="text" required>
      </div>
      <div class="form-group">
        <label>Card Type</label>
        <select v-model="newCard.cardType" required>
          <option value="">Select Type</option>
          <option value="student">Student Card</option>
          <option value="staff">Staff Card</option>
          <option value="visitor">Visitor Card</option>
        </select>
      </div>
      <div class="form-group">
        <label>Cardholder ID</label>
        <input v-model="newCard.cardholderId" type="text" required>
      </div>
      <div class="form-group">
        <label>Issue Date</label>
        <input v-model="newCard.issueDate" type="date" required>
      </div>
      <div class="form-group">
        <label>Expiry Date</label>
        <input v-model="newCard.expiryDate" type="date" required>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="newCard.status" required>
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="lost">Lost</option>
          <option value="stolen">Stolen</option>
        </select>
      </div>
    </template>

    <!-- Edit Card Form -->
    <template #edit-form>
      <div class="form-group">
        <label>Card Number</label>
        <input v-model="editingCard.cardNumber" type="text" required>
      </div>
      <div class="form-group">
        <label>Card Type</label>
        <select v-model="editingCard.cardType" required>
          <option value="">Select Type</option>
          <option value="student">Student Card</option>
          <option value="staff">Staff Card</option>
          <option value="visitor">Visitor Card</option>
        </select>
      </div>
      <div class="form-group">
        <label>Cardholder ID</label>
        <input v-model="editingCard.cardholderId" type="text" required>
      </div>
      <div class="form-group">
        <label>Issue Date</label>
        <input v-model="editingCard.issueDate" type="date" required>
      </div>
      <div class="form-group">
        <label>Expiry Date</label>
        <input v-model="editingCard.expiryDate" type="date" required>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="editingCard.status" required>
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="lost">Lost</option>
          <option value="stolen">Stolen</option>
        </select>
      </div>
    </template>
  </base-actions>
</template>

<script>
import BaseActions from '../users/actions/BaseActions.vue'

export default {
  name: 'CardActions',
  components: {
    BaseActions
  },
  props: {
    selectedCard: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      newCard: {
        cardNumber: '',
        cardType: '',
        cardholderId: '',
        issueDate: '',
        expiryDate: '',
        status: ''
      },
      editingCard: {
        cardNumber: '',
        cardType: '',
        cardholderId: '',
        issueDate: '',
        expiryDate: '',
        status: ''
      }
    }
  },
  watch: {
    selectedCard: {
      handler(newVal) {
        if (newVal) {
          this.editingCard = { ...newVal }
        }
      },
      immediate: true
    }
  },
  methods: {
    async handleAddCard() {
      try {
        // API call to add card
        this.$emit('card-added', this.newCard)
        this.resetNewCard()
      } catch (error) {
        console.error('Error adding card:', error)
      }
    },
    async handleEditCard() {
      try {
        // API call to update card
        this.$emit('card-updated', this.editingCard)
      } catch (error) {
        console.error('Error updating card:', error)
      }
    },
    resetNewCard() {
      this.newCard = {
        cardNumber: '',
        cardType: '',
        cardholderId: '',
        issueDate: '',
        expiryDate: '',
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
