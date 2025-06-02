import { defineStore } from 'pinia';
import { ref } from 'vue';
import { sectionService, type Section, type CreateSectionData } from '@/utils/services/academics/sectionService';

export const useSectionStore = defineStore('section', () => {
  const items = ref<Section[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchSections(params?: { course?: number; academic_term?: number; active_only?: boolean }) {
    loading.value = true;
    error.value = null;
    try {
      items.value = await sectionService.getSections(params);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch sections';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createSection(data: CreateSectionData) {
    loading.value = true;
    error.value = null;
    try {
      const newSection = await sectionService.createSection(data);
      items.value.push(newSection);
      return newSection;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create section';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateSection(id: number, data: Partial<CreateSectionData>) {
    loading.value = true;
    error.value = null;
    try {
      const updatedSection = await sectionService.updateSection(id, data);
      const index = items.value.findIndex(section => section.id === id);
      if (index !== -1) {
        items.value[index] = updatedSection;
      }
      return updatedSection;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update section';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteSection(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await sectionService.deleteSection(id);
      items.value = items.value.filter(section => section.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete section';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    items,
    loading,
    error,
    fetchSections,
    createSection,
    updateSection,
    deleteSection
  };
}); 