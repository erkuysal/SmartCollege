import { defineStore } from 'pinia';
import { facilityService, type Facility } from '../../services/college/facilityService';

interface FacilityState {
  facilities: Facility[];
  currentFacility: Facility | null;
  loading: boolean;
  error: string | null;
}

export const useFacilityStore = defineStore('facility', {
  state: (): FacilityState => ({
    facilities: [],
    currentFacility: null,
    loading: false,
    error: null
  }),

  getters: {
    getFacilities: (state) => state.facilities,
    getCurrentFacility: (state) => state.currentFacility,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    
    // Get active facilities
    getActiveFacilities: (state) => 
      state.facilities.filter(facility => facility.is_active),
    
    // Get facilities by type
    getFacilitiesByType: (state) => (type: string) => 
      state.facilities.filter(facility => facility.type === type),
    
    // Get facilities by capacity range
    getFacilitiesByCapacityRange: (state) => (min: number, max: number) => 
      state.facilities.filter(facility => 
        facility.capacity >= min && facility.capacity <= max
      ),
    
    // Get facilities by location
    getFacilitiesByLocation: (state) => (location: string) => 
      state.facilities.filter(facility => 
        facility.location.toLowerCase().includes(location.toLowerCase())
      )
  },

  actions: {
    async fetchFacilities() {
      this.loading = true;
      this.error = null;
      try {
        const facilities = await facilityService.getAllFacilities();
        this.facilities = facilities;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch facilities';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchFacilityById(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const facility = await facilityService.getFacilityById(id);
        this.currentFacility = facility;
        return facility;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch facility';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createFacility(facility: Omit<Facility, 'id' | 'created_at' | 'updated_at'>) {
      this.loading = true;
      this.error = null;
      try {
        const newFacility = await facilityService.createFacility(facility);
        this.facilities.push(newFacility);
        return newFacility;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create facility';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateFacility(id: number, facility: Partial<Facility>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedFacility = await facilityService.updateFacility(id, facility);
        const index = this.facilities.findIndex(f => f.id === id);
        if (index !== -1) {
          this.facilities[index] = updatedFacility;
        }
        if (this.currentFacility?.id === id) {
          this.currentFacility = updatedFacility;
        }
        return updatedFacility;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update facility';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteFacility(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await facilityService.deleteFacility(id);
        this.facilities = this.facilities.filter(f => f.id !== id);
        if (this.currentFacility?.id === id) {
          this.currentFacility = null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete facility';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    clearCurrentFacility() {
      this.currentFacility = null;
    }
  }
}); 