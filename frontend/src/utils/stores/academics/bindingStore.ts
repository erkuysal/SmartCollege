import { defineStore } from 'pinia';
import { bindingService, type Binding } from '../../services/academics/bindingService';

interface BindingState {
  bindings: Binding[];
  currentBinding: Binding | null;
  loading: boolean;
  error: string | null;
}

export const useBindingStore = defineStore('binding', {
  state: (): BindingState => ({
    bindings: [],
    currentBinding: null,
    loading: false,
    error: null
  }),

  getters: {
    getBindings: (state) => state.bindings,
    getCurrentBinding: (state) => state.currentBinding,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    
    // Get bindings by lecturer
    getBindingsByLecturer: (state) => (lecturerId: number) => 
      state.bindings.filter(binding => binding.lecturer === lecturerId),
    
    // Get bindings by section
    getBindingsBySection: (state) => (sectionId: number) => 
      state.bindings.filter(binding => binding.section === sectionId),
    
    // Get primary bindings
    getPrimaryBindings: (state) => 
      state.bindings.filter(binding => binding.is_primary)
  },

  actions: {
    async fetchBindings() {
      this.loading = true;
      this.error = null;
      try {
        const bindings = await bindingService.getAllBindings();
        this.bindings = bindings;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch bindings';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchBindingById(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const binding = await bindingService.getBindingById(id);
        this.currentBinding = binding;
        return binding;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch binding';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createBinding(binding: Omit<Binding, 'id' | 'created_at' | 'updated_at'>) {
      this.loading = true;
      this.error = null;
      try {
        const newBinding = await bindingService.createBinding(binding);
        this.bindings.push(newBinding);
        return newBinding;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create binding';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateBinding(id: number, binding: Partial<Binding>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedBinding = await bindingService.updateBinding(id, binding);
        const index = this.bindings.findIndex(b => b.id === id);
        if (index !== -1) {
          this.bindings[index] = updatedBinding;
        }
        if (this.currentBinding?.id === id) {
          this.currentBinding = updatedBinding;
        }
        return updatedBinding;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update binding';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteBinding(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await bindingService.deleteBinding(id);
        this.bindings = this.bindings.filter(b => b.id !== id);
        if (this.currentBinding?.id === id) {
          this.currentBinding = null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete binding';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    clearCurrentBinding() {
      this.currentBinding = null;
    }
  }
}); 