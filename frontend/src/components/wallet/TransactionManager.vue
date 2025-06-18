<template>
  <div class="transaction-manager">
    <!-- Statistics Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="primary" theme="dark">
          <v-card-text>
            <div class="text-h6">Total Transactions</div>
            <div class="text-h4">{{ transactions.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="success" theme="dark">
          <v-card-text>
            <div class="text-h6">Credits</div>
            <div class="text-h4">{{ creditCount }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="error" theme="dark">
          <v-card-text>
            <div class="text-h6">Debits</div>
            <div class="text-h4">{{ debitCount }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="info" theme="dark">
          <v-card-text>
            <div class="text-h6">Net Balance</div>
            <div class="text-h4">{{ netBalance }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div class="manager-header">
      <h2>Transactions</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showDialog = true">Add Transaction</v-btn>
    </div>
    
    <div class="manager-filters">
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            label="Search transactions"
            prepend-inner-icon="mdi-magnify"
            single-line
            hide-details
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="typeFilter"
            :items="typeOptions"
            label="Type"
            hide-details
            density="compact"
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            label="Sort By"
            hide-details
            density="compact"
          ></v-select>
        </v-col>
      </v-row>
    </div>

    <List
      :headers="headers"
      :rows="formattedTransactions"
      :loading="isLoadingTransactions"
      :itemsPerPage="itemsPerPage"
      :sortableColumns="['amount', 'timestamp', 'transaction_type']"
      :actions="tableActions"
      @rowClick="handleRowClick"
      @sort="handleSort"
    >
      <template #item-amount="{ row }">
        <div class="d-flex align-center">
          <v-avatar
            :color="row.transaction_type === 'earn' ? 'success' : 'error'"
            size="32"
            class="mr-2"
          >
            <v-icon :icon="getTransactionIcon(row.activity_type?.name ?? '')" color="white" size="small"></v-icon>
          </v-avatar>
          <span
            class="text-subtitle-1 font-weight-bold"
            :class="{ 'text-success': row.transaction_type === 'earn', 'text-error': row.transaction_type === 'spend' }"
          >
            {{ row.transaction_type === 'earn' ? '+' : '-' }}{{ row.points }}
          </span>
        </div>
      </template>

      <template #item-timestamp="{ row }">
        <div class="d-flex flex-column">
          <div class="cell-title">{{ formatDate(row.timestamp) }}</div>
          <div class="cell-subtitle">{{ formatTime(row.timestamp) }}</div>
        </div>
      </template>

      <template #item-status="{ row }">
        <div class="cell-status">
          <span :class="['status-text', row.transaction_type === 'earn' ? 'status-green' : 'status-red']">
            {{ row.transaction_type === 'earn' ? 'Credit' : 'Debit' }}
          </span>
        </div>
      </template>
    </List>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon :icon="isEditing ? 'mdi-pencil' : 'mdi-plus'" class="mr-2"></v-icon>
          {{ isEditing ? 'Edit Transaction' : 'Add Transaction' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="isFormValid">
            <v-select
              v-model="formData.student"
              :items="wallets"
              item-title="owner"
              item-value="id"
              label="Wallet"
              :rules="[v => !!v || 'Wallet is required']"
              required
              prepend-inner-icon="mdi-wallet"
            ></v-select>
            <v-select
              v-model="formData.activity_type"
              :items="activityTypes"
              item-title="name"
              item-value="id"
              label="Activity Type"
              :rules="[v => !!v || 'Activity type is required']"
              required
              prepend-inner-icon="mdi-tag"
            ></v-select>
            <v-text-field
              v-model="formData.points"
              label="Amount"
              type="number"
              :rules="[v => !!v || 'Amount is required']"
              required
              prepend-inner-icon="mdi-currency-usd"
            ></v-text-field>
            <v-select
              v-model="formData.transaction_type"
              :items="['earn', 'spend', 'adjust', 'expire']"
              label="Transaction Type"
              :rules="[v => !!v || 'Transaction type is required']"
              required
              prepend-inner-icon="mdi-swap-horizontal"
            ></v-select>
            <v-textarea
              v-model="formData.description"
              label="Description"
              :rules="[v => !!v || 'Description is required']"
              required
              prepend-inner-icon="mdi-text"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :disabled="!isFormValid"
            @click="saveTransaction"
            :loading="isLoadingTransactions"
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
          <v-icon icon="mdi-alert" color="error" class="mr-2"></v-icon>
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this transaction?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteTransaction" :loading="isLoadingTransactions">
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
import type { Transaction, Wallet, ActivityType } from '@/client/api';
import List from '@/components/common/List.vue';

const walletStore = useWalletStore();
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const isEditing = ref(false);
const isFormValid = ref(false);
const search = ref('');
const form = ref();
const selectedTransaction = ref<Transaction | null>(null);
const typeFilter = ref('all');
const sortBy = ref('timestamp');
const currentPage = ref(1);
const itemsPerPage = ref(10);

const typeOptions = [
  { title: 'All', value: 'all' },
  { title: 'Earn', value: 'earn' },
  { title: 'Spend', value: 'spend' }
];

const sortOptions = [
  { title: 'Date', value: 'timestamp' },
  { title: 'Amount', value: 'points' },
  { title: 'Type', value: 'transaction_type' }
];

const headers = [
  {
    title: 'Activity Type',
    key: 'activity_type',
    sortable: true
  },
  {
    title: 'Amount',
    key: 'points',
    sortable: true
  },
  {
    title: 'Description',
    key: 'description',
    sortable: false
  },
  {
    title: 'Date',
    key: 'timestamp',
    sortable: true
  },
  {
    title: 'Status',
    key: 'status',
    sortable: true
  }
];

const tableActions = [
  {
    label: 'Edit',
    handler: (row: any) => editTransaction(row)
  },
  {
    label: 'Delete',
    handler: (row: any) => confirmDelete(row)
  }
];

const formData = ref({
  student: 0 as number,
  activity_type: undefined as number | undefined,
  points: '',
  transaction_type: 'earn' as 'earn' | 'spend' | 'adjust' | 'expire',
  description: ''
});

const transactions = computed(() => walletStore.transactions);
const wallets = computed(() => walletStore.wallets);
const activityTypes = computed(() => walletStore.activityTypes);
const isLoadingTransactions = computed(() => walletStore.isLoadingTransactions);

const creditCount = computed(() => transactions.value.filter(t => t.transaction_type === 'earn').length);
const debitCount = computed(() => transactions.value.filter(t => t.transaction_type === 'spend').length);
const netBalance = computed(() => {
  return transactions.value.reduce((sum, t) => {
    return sum + (t.transaction_type === 'earn' ? t.points : -t.points);
  }, 0);
});

const formattedTransactions = computed(() => {
  let filtered = [...transactions.value];
  
  // Apply type filter
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(t => t.transaction_type === typeFilter.value);
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    if (sortBy.value === 'points') {
      return b.points - a.points;
    } else if (sortBy.value === 'transaction_type') {
      return a.transaction_type.localeCompare(b.transaction_type);
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  
  return filtered.map(t => ({
    ...t,
    activity_type: t.activity_type?.name ?? 'N/A',
    points: t.points,
    description: t.description,
    timestamp: t.timestamp,
    status: t.transaction_type.charAt(0).toUpperCase() + t.transaction_type.slice(1)
  }));
});

const getTransactionIcon = (activityType: string) => {
  const type = activityType.toLowerCase();
  if (type.includes('attendance')) return 'mdi-calendar-check';
  if (type.includes('bonus')) return 'mdi-gift';
  if (type.includes('penalty')) return 'mdi-alert';
  if (type.includes('reward')) return 'mdi-star';
  if (type.includes('purchase')) return 'mdi-cart';
  if (type.includes('refund')) return 'mdi-cash-refund';
  return 'mdi-swap-horizontal';
};

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
  editTransaction(row);
};

onMounted(async () => {
  await Promise.all([
    walletStore.fetchTransactions(),
    walletStore.fetchWallets(),
    walletStore.fetchActivityTypes()
  ]);
});

const resetForm = () => {
  formData.value = {
    student: 0,
    activity_type: undefined,
    points: '',
    transaction_type: 'earn',
    description: ''
  };
  isEditing.value = false;
  selectedTransaction.value = null;
};

const editTransaction = (transaction: Transaction) => {
  isEditing.value = true;
  selectedTransaction.value = transaction;
  formData.value = {
    student: transaction.student,
    activity_type: transaction.activity_type?.id,
    points: transaction.points.toString(),
    transaction_type: transaction.transaction_type,
    description: transaction.description
  };
  showDialog.value = true;
};

const confirmDelete = (transaction: Transaction) => {
  selectedTransaction.value = transaction;
  showDeleteDialog.value = true;
};

const deleteTransaction = async () => {
  if (selectedTransaction.value) {
    await walletStore.removeTransaction(selectedTransaction.value.id);
    showDeleteDialog.value = false;
    selectedTransaction.value = null;
  }
};

const saveTransaction = async () => {
  if (!form.value?.validate()) return;

  if (isEditing.value && selectedTransaction.value) {
    // For updates, we need to match the Transaction interface
    const updateData: Partial<Transaction> = {
      student: formData.value.student,
      points: parseFloat(formData.value.points),
      transaction_type: formData.value.transaction_type,
      description: formData.value.description
    };
    await walletStore.editTransaction(selectedTransaction.value.id, updateData);
  } else {
    // For creation, we use the API's expected format
    const createData = {
      student: formData.value.student,
      activity_type: formData.value.activity_type,
      points: parseFloat(formData.value.points),
      transaction_type: formData.value.transaction_type,
      description: formData.value.description
    };
    await walletStore.addTransaction(createData);
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
</script>

<style scoped>
.transaction-manager {
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
}

.stat-card:hover {
  transform: translateY(-5px);
}
</style> 