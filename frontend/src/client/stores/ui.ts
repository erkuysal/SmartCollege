import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    isLoading: false,
    error: '',
    successMessage: '',
    activeModal: null as string | null,
    snackbar: {
      show: false,
      text: '',
      color: 'success' as 'success' | 'error' | 'warning' | 'info'
    }
  }),

  actions: {
    showError(message: string) {
      this.error = message
      this.showSnackbar(message, 'error')
    },

    showSuccess(message: string) {
      this.successMessage = message
      this.showSnackbar(message, 'success')
    },

    showSnackbar(text: string, color: 'success' | 'error' | 'warning' | 'info' = 'success') {
      this.snackbar = {
        show: true,
        text,
        color
      }
    },

    hideSnackbar() {
      this.snackbar.show = false
    },

    clearMessages() {
      this.error = ''
      this.successMessage = ''
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    openModal(modalName: string) {
      this.activeModal = modalName
    },

    closeModal() {
      this.activeModal = null
    }
  }
}) 