<template>
  <div class="wallet-manager">
    <!-- Statistics Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="primary" theme="dark">
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-account-group" size="large" class="mr-2"></v-icon>
              <div class="text-h6">Total Students</div>
            </div>
            <div class="text-h4">{{ wallets.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="success" theme="dark">
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-star" size="large" class="mr-2"></v-icon>
              <div class="text-h6">Total Points</div>
            </div>
            <div class="text-h4">{{ formattedTotalBalance }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="info" theme="dark">
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-trophy" size="large" class="mr-2"></v-icon>
              <div class="text-h6">Points Earned</div>
            </div>
            <div class="text-h4">{{ totalEarned }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="warning" theme="dark">
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-gift" size="large" class="mr-2"></v-icon>
              <div class="text-h6">Points Spent</div>
            </div>
            <div class="text-h4">{{ totalSpent }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div class="manager-header">
      <div class="d-flex align-center">
        <v-icon icon="mdi-star-circle" size="large" color="primary" class="mr-2"></v-icon>
        <h2>Student Points</h2>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus-circle" @click="showDialog = true">Add Student Points</v-btn>
    </div>
    
    <div class="manager-filters">
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            label="Search students"
            prepend-inner-icon="mdi-magnify"
            single-line
            hide-details
            density="compact"
            class="search-field"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            label="Status"
            hide-details
            density="compact"
            prepend-inner-icon="mdi-filter-variant"
            class="filter-select"
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            label="Sort By"
            hide-details
            density="compact"
            prepend-inner-icon="mdi-sort"
            class="sort-select"
          ></v-select>
        </v-col>
      </v-row>
    </div>

    <List
      :headers="headers"
      :rows="formattedWallets"
      :loading="isLoadingWallets"
      :itemsPerPage="itemsPerPage"
      :sortableColumns="['balance', 'created_at']"
      :actions="tableActions"
      @rowClick="handleRowClick"
      @sort="handleSort"
    >
      <template #item-student="{ row }">
        <div class="d-flex align-center">
          <v-avatar
            :color="getStudentColor(row.id)"
            size="32"
            class="mr-2"
          >
            <v-icon :icon="getStudentIcon(row.id)" color="white" size="small"></v-icon>
          </v-avatar>
          <span class="text-subtitle-1">{{ row.student_name }}</span>
        </div>
      </template>

      <template #item-balance="{ row }">
        <div class="d-flex align-center">
          <v-avatar
            :color="row.balance > 0 ? 'success' : 'error'"
            size="32"
            class="mr-2"
          >
            <v-icon :icon="row.balance > 0 ? 'mdi-star' : 'mdi-star-off'" color="white" size="small"></v-icon>
          </v-avatar>
          <span
            class="text-subtitle-1 font-weight-bold"
            :class="{ 'text-success': row.balance > 0, 'text-error': row.balance <= 0 }"
          >
            {{ row.balance }} points
          </span>
        </div>
      </template>

      <template #item-created_at="{ row }">
        <div class="d-flex align-center">
          <v-avatar
            color="grey-lighten-1"
            size="32"
            class="mr-2"
          >
            <v-icon icon="mdi-calendar-clock" color="white" size="small"></v-icon>
          </v-avatar>
          <div class="d-flex flex-column">
            <div class="cell-title">{{ formatDate(row.created_at) }}</div>
            <div class="cell-subtitle">{{ formatTime(row.created_at) }}</div>
          </div>
        </div>
      </template>

      <template #item-status="{ row }">
        <div class="cell-status">
          <v-avatar
            :color="row.is_active ? 'success' : 'error'"
            size="32"
            class="mr-2"
          >
            <v-icon :icon="row.is_active ? 'mdi-check-circle' : 'mdi-close-circle'" color="white" size="small"></v-icon>
          </v-avatar>
          <span :class="['status-text', row.is_active ? 'status-green' : 'status-red']">
            {{ row.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </template>
    </List>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon :icon="isEditing ? 'mdi-pencil-circle' : 'mdi-plus-circle'" class="mr-2" :color="isEditing ? 'warning' : 'success'"></v-icon>
          {{ isEditing ? 'Edit Student Points' : 'Add Student Points' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="isFormValid">
            <v-text-field
              v-model="formData.student"
              label="Student"
              :rules="[v => !!v || 'Student is required']"
              required
              prepend-inner-icon="mdi-account"
            ></v-text-field>
            <v-text-field
              v-model="formData.balance"
              label="Points"
              type="number"
              :rules="[v => !!v || 'Points are required']"
              required
              prepend-inner-icon="mdi-star"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDialog = false" prepend-icon="mdi-close">Cancel</v-btn>
          <v-btn
            color="primary"
            :disabled="!isFormValid"
            @click="saveWallet"
            :loading="isLoadingWallets"
            :prepend-icon="isEditing ? 'mdi-content-save' : 'mdi-plus-circle'"
          >
            {{ isEditing ? 'Update' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon icon="mdi-alert-circle" color="error" class="mr-2"></v-icon>
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this student's points record?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDeleteDialog = false" prepend-icon="mdi-close">Cancel</v-btn>
          <v-btn color="error" @click="deleteWallet" :loading="isLoadingWallets" prepend-icon="mdi-delete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useWalletStore } from '@/client/stores/wallet';
import type { Wallet } from '@/client/api';
import List from '@/components/common/List.vue';

const walletStore = useWalletStore();
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const isEditing = ref(false);
const isFormValid = ref(false);
const search = ref('');
const form = ref();
const selectedWallet = ref<Wallet | null>(null);
const statusFilter = ref('all');
const sortBy = ref('created_at');
const currentPage = ref(1);
const itemsPerPage = ref(10);

const statusOptions = [
  { title: 'All', value: 'all' },
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' }
];

const sortOptions = [
  { title: 'Balance', value: 'balance' },
  { title: 'Student', value: 'student' }
];

const headers = [
  'Student Number',
  'Student Name',
  'Balance'
];

const tableActions = [
  {
    label: 'Edit',
    handler: (row: any) => editWallet(row)
  },
  {
    label: 'Delete',
    handler: (row: any) => confirmDelete(row)
  }
];

const formData = ref({
  student: '',
  balance: ''
});

const wallets = computed(() => walletStore.wallets);
const isLoadingWallets = computed(() => walletStore.isLoadingWallets);

const totalBalance = computed(() => {
  return wallets.value.reduce((sum, w) => sum + Number(w.balance), 0);
});

const formattedTotalBalance = computed(() => {
  return Number(totalBalance.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
});

const totalEarned = computed(() => {
  // Implementation of totalEarned calculation
  return 0; // Placeholder return, actual implementation needed
});

const totalSpent = computed(() => {
  // Implementation of totalSpent calculation
  return 0; // Placeholder return, actual implementation needed
});

const formattedWallets = computed(() => {
  let filtered = [...wallets.value];
  filtered.sort((a, b) => {
    if (sortBy.value === 'balance') {
      return b.balance - a.balance;
    } else if (sortBy.value === 'student') {
      return a.student - b.student;
    }
    return 0;
  });
  return filtered.map(w => ({
    ...w,
    'Student Number': w.student_number,
    'Student Name': w.student_name,
    'Balance': w.balance
  }));
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString();
};

const handleSearch = (value: string) => {
  search.value = value;
};

const handleSort = (column: string, direction: 'asc' | 'desc') => {
  sortBy.value = column;
};

const handleRowClick = (row: any) => {
  editWallet(row);
};

onMounted(async () => {
  await walletStore.fetchWallets();
});

const resetForm = () => {
  formData.value = {
    student: '',
    balance: ''
  };
  isEditing.value = false;
  selectedWallet.value = null;
};

const editWallet = (wallet: Wallet) => {
  isEditing.value = true;
  selectedWallet.value = wallet;
  formData.value = {
    student: wallet.student.toString(),
    balance: wallet.balance.toString()
  };
  showDialog.value = true;
};

const confirmDelete = (wallet: Wallet) => {
  selectedWallet.value = wallet;
  showDeleteDialog.value = true;
};

const deleteWallet = async () => {
  if (selectedWallet.value) {
    await walletStore.removeWallet(selectedWallet.value.id);
    showDeleteDialog.value = false;
    selectedWallet.value = null;
  }
};

const saveWallet = async () => {
  if (!form.value?.validate()) return;
  const data = {
    student: parseInt(formData.value.student),
    balance: parseFloat(formData.value.balance)
  };
  if (isEditing.value && selectedWallet.value) {
    await walletStore.editWallet(selectedWallet.value.id, data);
  } else {
    await walletStore.addWallet(data);
  }
  showDialog.value = false;
  resetForm();
};

// Watch for dialog close
watch(showDialog, (newVal: boolean) => {
  if (!newVal) {
    resetForm();
  }
});

const getStudentColor = (id: number) => {
  const colors = ['primary', 'success', 'info', 'warning', 'error'];
  return colors[id % colors.length];
};

const getStudentIcon = (id: number) => {
  const icons = ['mdi-account', 'mdi-account-school', 'mdi-account-tie', 'mdi-account-star', 'mdi-account-supervisor'];
  return icons[id % icons.length];
};
</script>

<style scoped>
.wallet-manager {
  padding: 12px 0;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.manager-filters {
  margin-bottom: 16px;
}

.stat-card {
  transition: transform 0.2s;
  border-radius: 12px;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.search-field,
.filter-select,
.sort-select {
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.cell-title {
  font-size: 0.875rem;
  font-weight: 500;
}

.cell-subtitle {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}

.cell-status {
  display: flex;
  align-items: center;
}

.status-text {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-green {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.status-red {
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.v-card {
  border-radius: 12px;
}

.v-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
}

.v-text-field,
.v-select {
  border-radius: 8px;
}
</style> 