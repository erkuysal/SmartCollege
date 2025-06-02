import { defineStore } from 'pinia';
import { ref } from 'vue';
import { termService } from '@/utils/services/academics/termService';
import type { Term } from '@/utils/services/academics/enrollmentService';

export const useTermStore = defineStore('term', () => {
  // State
  const terms = ref<Term[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  async function fetchTerms() {
    loading.value = true;
    error.value = null;
    try {
      const response = await termService.getAllTerms();
      console.log('Fetched terms in store:', response);
      terms.value = response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      loading.value = false;
    }
  }

  async function createTerm(termData: Omit<Term, 'id'>) {
    loading.value = true;
    error.value = null;
    try {
      const newTerm = await termService.createTerm(termData);
      terms.value.push(newTerm);
      return newTerm;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateTerm(id: number, termData: Partial<Term>) {
    loading.value = true;
    error.value = null;
    try {
      const updatedTerm = await termService.updateTerm(id, termData);
      const index = terms.value.findIndex(term => term.id === id);
      if (index !== -1) {
        terms.value[index] = updatedTerm;
      }
      return updatedTerm;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteTerm(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await termService.deleteTerm(id);
      terms.value = terms.value.filter(term => term.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function resetState() {
    terms.value = [];
    loading.value = false;
    error.value = null;
  }

  return {
    terms,
    loading,
    error,
    fetchTerms,
    createTerm,
    updateTerm,
    deleteTerm,
    resetState
  };
}); 