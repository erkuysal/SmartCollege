import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ListStoreState, FilterState } from '../base/types';
import type { Department } from '../../interfaces/college/departmentInterface';
import departmentService from '../../services/college/departmentService';

// Initial filters
const initialFilters: FilterState = {
  search: '',
  sortBy: 'name',
  sortOrder: 'asc',
  filters: {},
  page: 1,
  pageSize: 10
};

export const useDepartmentStore = defineStore('department', () => {
  // State
  const items = ref<Department[]>([]);
  const pagination = ref({
    count: 0,
    next: null as string | null,
    previous: null as string | null
  });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedItem = ref<Department | null>(null);
  const filters = ref<FilterState>({ ...initialFilters });
  
  // Helper methods
  const departmentById = (id: number): Department | null => {
    return items.value.find(department => department.id === id) || null;
  };
  
  // Actions
  async function fetchDepartments(params = {}) {
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
      
      const response = await departmentService.getDepartments(queryParams);
      items.value = response.data.results;
      pagination.value = {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous
      };
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Failed to fetch departments';
    }
  }
  
  async function fetchDepartmentById(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await departmentService.getDepartmentById(id);
      selectedItem.value = response.data;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to fetch department with ID ${id}`;
    }
  }
  
  async function createDepartment(departmentData: Partial<Department>) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await departmentService.createDepartment(departmentData);
      items.value = [response.data, ...items.value];
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Failed to create department';
    }
  }
  
  async function updateDepartment(id: number, departmentData: Partial<Department>) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await departmentService.updateDepartment(id, departmentData);
      items.value = items.value.map(item => item.id === id ? response.data : item);
      if (selectedItem.value?.id === id) {
        selectedItem.value = response.data;
      }
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to update department with ID ${id}`;
    }
  }
  
  async function deleteDepartment(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      await departmentService.deleteDepartment(id);
      items.value = items.value.filter(item => item.id !== id);
      if (selectedItem.value?.id === id) {
        selectedItem.value = null;
      }
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to delete department with ID ${id}`;
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
    departmentById,
    
    // Actions
    fetchDepartments,
    fetchDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    setFilters,
    resetFilters,
    clearError,
    resetState
  };
}); 