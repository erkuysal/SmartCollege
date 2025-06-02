import { defineStore } from 'pinia';

interface ErrorState {
  error: {
    message: string;
    type?: 'error' | 'warning' | 'info' | 'success';
  } | null;
}

export const useErrorStore = defineStore('error', {
  state: (): ErrorState => ({
    error: null
  }),

  actions: {
    setError(message: string, type: 'error' | 'warning' | 'info' | 'success' = 'error') {
      this.error = { message, type };
    },

    clearError() {
      this.error = null;
    }
  }
}); 