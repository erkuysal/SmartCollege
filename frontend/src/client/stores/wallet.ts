import { defineStore } from 'pinia';
import type {
  Wallet,
  ActivityType,
  MultiplierRule,
  Transaction
} from '../api';
import {
  getWallets,
  getWallet,
  createWallet,
  updateWallet,
  deleteWallet,
  getActivityTypes,
  getActivityType,
  createActivityType,
  updateActivityType,
  deleteActivityType,
  getMultiplierRules,
  getMultiplierRule,
  createMultiplierRule,
  updateMultiplierRule,
  deleteMultiplierRule,
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../api';

interface WalletState {
  // Wallets
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  isLoadingWallets: boolean;
  error: string | null;
  
  // Activity Types
  activityTypes: ActivityType[];
  selectedActivityType: ActivityType | null;
  isLoadingActivityTypes: boolean;
  
  // Multiplier Rules
  multiplierRules: MultiplierRule[];
  selectedMultiplierRule: MultiplierRule | null;
  isLoadingMultiplierRules: boolean;
  
  // Transactions
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  isLoadingTransactions: boolean;
}

export const useWalletStore = defineStore('wallet', {
  state: (): WalletState => ({
    // Initial State
    wallets: [],
    selectedWallet: null,
    isLoadingWallets: false,
    error: null,
    
    activityTypes: [],
    selectedActivityType: null,
    isLoadingActivityTypes: false,
    
    multiplierRules: [],
    selectedMultiplierRule: null,
    isLoadingMultiplierRules: false,
    
    transactions: [],
    selectedTransaction: null,
    isLoadingTransactions: false,
  }),

  actions: {
    // Wallet Actions
    async fetchWallets() {
      this.isLoadingWallets = true;
      this.error = null;
      try {
        const response = await getWallets();
        this.wallets = response.data.results;
      } catch (error) {
        this.error = 'Failed to fetch wallets';
      } finally {
        this.isLoadingWallets = false;
      }
    },

    async fetchWallet(id: number) {
      this.isLoadingWallets = true;
      this.error = null;
      try {
        const response = await getWallet(id);
        this.selectedWallet = response.data;
      } catch (error) {
        this.error = 'Failed to fetch wallet';
      } finally {
        this.isLoadingWallets = false;
      }
    },

    async addWallet(data: { student: number }) {
      this.isLoadingWallets = true;
      this.error = null;
      try {
        await createWallet(data);
        await this.fetchWallets();
      } catch (error) {
        this.error = 'Failed to create wallet';
      } finally {
        this.isLoadingWallets = false;
      }
    },

    async editWallet(id: number, data: Partial<Wallet>) {
      this.isLoadingWallets = true;
      this.error = null;
      try {
        await updateWallet(id, data);
        await this.fetchWallets();
        if (this.selectedWallet?.id === id) {
          await this.fetchWallet(id);
        }
      } catch (error) {
        this.error = 'Failed to update wallet';
      } finally {
        this.isLoadingWallets = false;
      }
    },

    async removeWallet(id: number) {
      this.isLoadingWallets = true;
      this.error = null;
      try {
        await deleteWallet(id);
        await this.fetchWallets();
        if (this.selectedWallet?.id === id) {
          this.selectedWallet = null;
        }
      } catch (error) {
        this.error = 'Failed to delete wallet';
      } finally {
        this.isLoadingWallets = false;
      }
    },

    // Activity Type Actions
    async fetchActivityTypes() {
      this.isLoadingActivityTypes = true;
      this.error = null;
      try {
        const response = await getActivityTypes();
        this.activityTypes = response.data.results;
      } catch (error) {
        this.error = 'Failed to fetch activity types';
      } finally {
        this.isLoadingActivityTypes = false;
      }
    },

    async fetchActivityType(id: number) {
      this.isLoadingActivityTypes = true;
      this.error = null;
      try {
        const response = await getActivityType(id);
        this.selectedActivityType = response.data;
      } catch (error) {
        this.error = 'Failed to fetch activity type';
      } finally {
        this.isLoadingActivityTypes = false;
      }
    },

    async addActivityType(data: { 
      name: string; 
      description: string; 
      is_active?: boolean 
    }) {
      this.isLoadingActivityTypes = true;
      this.error = null;
      try {
        await createActivityType(data);
        await this.fetchActivityTypes();
      } catch (error) {
        this.error = 'Failed to create activity type';
      } finally {
        this.isLoadingActivityTypes = false;
      }
    },

    async editActivityType(id: number, data: Partial<ActivityType>) {
      this.isLoadingActivityTypes = true;
      this.error = null;
      try {
        await updateActivityType(id, data);
        await this.fetchActivityTypes();
        if (this.selectedActivityType?.id === id) {
          await this.fetchActivityType(id);
        }
      } catch (error) {
        this.error = 'Failed to update activity type';
      } finally {
        this.isLoadingActivityTypes = false;
      }
    },

    async removeActivityType(id: number) {
      this.isLoadingActivityTypes = true;
      this.error = null;
      try {
        await deleteActivityType(id);
        await this.fetchActivityTypes();
        if (this.selectedActivityType?.id === id) {
          this.selectedActivityType = null;
        }
      } catch (error) {
        this.error = 'Failed to delete activity type';
      } finally {
        this.isLoadingActivityTypes = false;
      }
    },

    // Multiplier Rule Actions
    async fetchMultiplierRules() {
      this.isLoadingMultiplierRules = true;
      this.error = null;
      try {
        const response = await getMultiplierRules();
        this.multiplierRules = response.data.results;
      } catch (error) {
        this.error = 'Failed to fetch multiplier rules';
      } finally {
        this.isLoadingMultiplierRules = false;
      }
    },

    async fetchMultiplierRule(id: number) {
      this.isLoadingMultiplierRules = true;
      this.error = null;
      try {
        const response = await getMultiplierRule(id);
        this.selectedMultiplierRule = response.data;
      } catch (error) {
        this.error = 'Failed to fetch multiplier rule';
      } finally {
        this.isLoadingMultiplierRules = false;
      }
    },

    async addMultiplierRule(data: { 
      name: string;
      description: string;
      multiplier: number;
      condition_type: 'streak' | 'special_event' | 'time_of_day' | 'location' | 'custom';
      condition_value: any;
      is_active?: boolean;
      start_date?: string;
      end_date?: string;
    }) {
      this.isLoadingMultiplierRules = true;
      this.error = null;
      try {
        await createMultiplierRule(data);
        await this.fetchMultiplierRules();
      } catch (error) {
        this.error = 'Failed to create multiplier rule';
      } finally {
        this.isLoadingMultiplierRules = false;
      }
    },

    async editMultiplierRule(id: number, data: Partial<MultiplierRule>) {
      this.isLoadingMultiplierRules = true;
      this.error = null;
      try {
        await updateMultiplierRule(id, data);
        await this.fetchMultiplierRules();
        if (this.selectedMultiplierRule?.id === id) {
          await this.fetchMultiplierRule(id);
        }
      } catch (error) {
        this.error = 'Failed to update multiplier rule';
      } finally {
        this.isLoadingMultiplierRules = false;
      }
    },

    async removeMultiplierRule(id: number) {
      this.isLoadingMultiplierRules = true;
      this.error = null;
      try {
        await deleteMultiplierRule(id);
        await this.fetchMultiplierRules();
        if (this.selectedMultiplierRule?.id === id) {
          this.selectedMultiplierRule = null;
        }
      } catch (error) {
        this.error = 'Failed to delete multiplier rule';
      } finally {
        this.isLoadingMultiplierRules = false;
      }
    },

    // Transaction Actions
    async fetchTransactions(params?: { student?: number; activity_type?: number }) {
      this.isLoadingTransactions = true;
      this.error = null;
      try {
        const response = await getTransactions(params);
        this.transactions = response.data.results;
      } catch (error) {
        this.error = 'Failed to fetch transactions';
      } finally {
        this.isLoadingTransactions = false;
      }
    },

    async fetchTransaction(id: number) {
      this.isLoadingTransactions = true;
      this.error = null;
      try {
        const response = await getTransaction(id);
        this.selectedTransaction = response.data;
      } catch (error) {
        this.error = 'Failed to fetch transaction';
      } finally {
        this.isLoadingTransactions = false;
      }
    },

    async addTransaction(data: { 
      student: number;
      transaction_type: 'earn' | 'spend' | 'adjust' | 'expire';
      activity_type?: number;
      points: number;
      multiplier_applied?: number;
      multiplier_rule?: number;
      reference_id?: string;
      description?: string;
    }) {
      this.isLoadingTransactions = true;
      this.error = null;
      try {
        await createTransaction(data);
        await this.fetchTransactions();
      } catch (error) {
        this.error = 'Failed to create transaction';
      } finally {
        this.isLoadingTransactions = false;
      }
    },

    async editTransaction(id: number, data: Partial<Transaction>) {
      this.isLoadingTransactions = true;
      this.error = null;
      try {
        await updateTransaction(id, data);
        await this.fetchTransactions();
        if (this.selectedTransaction?.id === id) {
          await this.fetchTransaction(id);
        }
      } catch (error) {
        this.error = 'Failed to update transaction';
      } finally {
        this.isLoadingTransactions = false;
      }
    },

    async removeTransaction(id: number) {
      this.isLoadingTransactions = true;
      this.error = null;
      try {
        await deleteTransaction(id);
        await this.fetchTransactions();
        if (this.selectedTransaction?.id === id) {
          this.selectedTransaction = null;
        }
      } catch (error) {
        this.error = 'Failed to delete transaction';
      } finally {
        this.isLoadingTransactions = false;
      }
    },

    // Reset Actions
    resetWallet() {
      this.selectedWallet = null;
    },
    resetActivityType() {
      this.selectedActivityType = null;
    },
    resetMultiplierRule() {
      this.selectedMultiplierRule = null;
    },
    resetTransaction() {
      this.selectedTransaction = null;
    },
  },
}); 