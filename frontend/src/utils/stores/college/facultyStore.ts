import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ListStoreState, FilterState } from '../base/types';
import type { Faculty } from '../../interfaces/college/facultyInterface';
import facultyService from '../../services/college/facultyService';
import { facilityService } from '@/utils/services/college/facilityService';
import type { Facility } from '@/utils/services/college/facilityService';

// Initial filters
const initialFilters: FilterState = {
  search: '',
  sortBy: 'name',
  sortOrder: 'asc',
  filters: {},
  page: 1,
  pageSize: 10
};

export const useFacultyStore = defineStore('faculty', () => {
  // State
  const items = ref<Faculty[]>([]);
  const pagination = ref({
    count: 0,
    next: null as string | null,
    previous: null as string | null
  });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedItem = ref<Faculty | null>(null);
  const filters = ref<FilterState>({ ...initialFilters });
  
  // Helper methods
  const facultyById = (id: number): Faculty | null => {
    return items.value.find(faculty => faculty.id === id) || null;
  };
  
  // Actions
  async function fetchFaculties(params = {}) {
    loading.value = true;
    error.value = null;
    
    try {
      const queryParams = {
        page: filters.value.page,
        page_size: filters.value.pageSize,
        search: filters.value.search,
        ordering: `${filters.value.sortOrder === 'desc' ? '-' : ''}${filters.value.sortBy}`,
        ...filters.value.filters,
        ...params
      };
      
      const response = await facultyService.getFaculties(queryParams);
      items.value = response.data.results;
      pagination.value = {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous
      };
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Failed to fetch faculties';
    }
  }
  
  async function fetchFacultyById(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await facultyService.getFacultyById(id);
      selectedItem.value = response.data;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to fetch faculty with ID ${id}`;
    }
  }
  
  async function createFaculty(facultyData: Partial<Faculty>) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await facultyService.createFaculty(facultyData);
      items.value = [response.data, ...items.value];
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Failed to create faculty';
    }
  }
  
  async function updateFaculty(id: number, facultyData: Partial<Faculty>) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await facultyService.updateFaculty(id, facultyData);
      items.value = items.value.map(item => item.id === id ? response.data : item);
      if (selectedItem.value?.id === id) {
        selectedItem.value = response.data;
      }
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to update faculty with ID ${id}`;
    }
  }
  
  async function deleteFaculty(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      await facultyService.deleteFaculty(id);
      items.value = items.value.filter(item => item.id !== id);
      if (selectedItem.value?.id === id) {
        selectedItem.value = null;
      }
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to delete faculty with ID ${id}`;
    }
  }
  
  function setFilters(newFilters: Partial<FilterState>) {
    filters.value = { ...filters.value, ...newFilters };
  }
  
  function resetFilters() {
    filters.value = { ...initialFilters };
  }
  
  function clearError() {
    error.value = null;
  }
  
  function resetState() {
    items.value = [];
    pagination.value = {
      count: 0,
      next: null,
      previous: null
    };
    loading.value = false;
    error.value = null;
    selectedItem.value = null;
    filters.value = { ...initialFilters };
  }

  return {
    // State
    items,
    pagination,
    loading,
    error,
    selectedItem,
    filters,
    
    // Helper methods
    facultyById,
    
    // Actions
    fetchFaculties,
    fetchFacultyById,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    setFilters,
    resetFilters,
    clearError,
    resetState
  };
});

export const useFacilityStore = defineStore('facility', () => {
  const items = ref<Facility[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchFacilities() {
    loading.value = true;
    error.value = null;
    try {
      items.value = await facilityService.getAllFacilities();
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      loading.value = false;
    }
  }

  async function createFacility(facilityData: Omit<Facility, 'id' | 'created_at' | 'updated_at'>) {
    loading.value = true;
    error.value = null;
    try {
      await facilityService.createFacility(facilityData);
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    items,
    loading,
    error,
    fetchFacilities,
    createFacility
  };
}); 