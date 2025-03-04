import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ListStoreState, FilterState } from '../base/types';
import type { Staff } from '../../interfaces/users/staffInterface';
import type { RFIDCard } from '../../interfaces/utilities/RFIDInterface';
import staffService from '../../services/users/staffService';
import rfidService from '../../services/utilities/RFIDService';

// Initial filters
const initialFilters: FilterState = {
  search: '',
  sortBy: 'last_name',
  sortOrder: 'asc',
  filters: {},
  page: 1,
  pageSize: 10
};

export const useStaffStore = defineStore('staff', () => {
  // State
  const items = ref<Staff[]>([]);
  const pagination = ref({
    count: 0,
    next: null as string | null,
    previous: null as string | null
  });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedItem = ref<Staff | null>(null);
  const rfidCard = ref<RFIDCard | null>(null);
  const filters = ref<FilterState>({ ...initialFilters });
  
  // Helper methods
  const staffById = (id: number): Staff | null => {
    return items.value.find(staff => staff.id === id) || null;
  };
  
  // Actions
  async function fetchStaff(params = {}) {
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
      
      const response = await staffService.getStaffMembers(queryParams);
      items.value = response.data.results;
      pagination.value = {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous
      };
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Failed to fetch staff';
    }
  }
  
  async function fetchStaffById(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await staffService.getStaffMemberById(id);
      selectedItem.value = response.data;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to fetch staff with ID ${id}`;
    }
  }
  
  async function createStaff(staffData: Partial<Staff>) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await staffService.createStaffMember(staffData);
      items.value = [response.data, ...items.value];
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Failed to create staff';
    }
  }
  
  async function updateStaff(id: number, staffData: Partial<Staff>) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await staffService.updateStaffMember(id, staffData);
      items.value = items.value.map(item => item.id === id ? response.data : item);
      if (selectedItem.value?.id === id) {
        selectedItem.value = response.data;
      }
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to update staff with ID ${id}`;
    }
  }
  
  async function deleteStaff(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      await staffService.deleteStaffMember(id);
      items.value = items.value.filter(item => item.id !== id);
      if (selectedItem.value?.id === id) {
        selectedItem.value = null;
      }
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to delete staff with ID ${id}`;
    }
  }
  
  async function readRFID() {
    loading.value = true;
    error.value = null;
    
    try {
      // This is a placeholder - we need to implement the actual RFID reading functionality
      // This might involve a different service call or hardware integration
      // For now, we'll simulate it by creating a new RFID card
      const dummyCard: Partial<RFIDCard> = {
        card_id: `RFID-${Date.now()}`,
        is_active: true
      };
      const response = await rfidService.createRFIDCard(dummyCard);
      rfidCard.value = response.data;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Failed to read RFID card';
    }
  }
  
  async function assignRFID(staffId: number, cardId: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await staffService.assignRFIDCard(staffId, cardId);
      items.value = items.value.map(item => 
        item.id === staffId ? { ...item, rfid_card_id: cardId } : item
      );
      if (selectedItem.value?.id === staffId) {
        selectedItem.value = { ...selectedItem.value, rfid_card_id: cardId };
      }
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to assign RFID to staff with ID ${staffId}`;
    }
  }
  
  async function removeRFID(staffId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      await staffService.removeRFIDCard(staffId);
      items.value = items.value.map(item => 
        item.id === staffId ? { ...item, rfid_card_id: undefined } : item
      );
      if (selectedItem.value?.id === staffId) {
        selectedItem.value = { ...selectedItem.value, rfid_card_id: undefined };
      }
      rfidCard.value = null;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to remove RFID from staff with ID ${staffId}`;
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
    rfidCard.value = null;
    filters.value = { ...initialFilters };
  }

  return {
    // State
    items,
    pagination,
    loading,
    error,
    selectedItem,
    rfidCard,
    filters,
    
    // Helper methods
    staffById,
    
    // Actions
    fetchStaff,
    fetchStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
    readRFID,
    assignRFID,
    removeRFID,
    setFilters,
    resetFilters,
    clearError,
    resetState
  };
}); 