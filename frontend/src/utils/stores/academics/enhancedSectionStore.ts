import { defineStore } from 'pinia';
import { enhancedSectionService } from '../../services/academics/enhancedSectionService';
import type { Section } from '../../services/academics/sectionService';
import type { SectionStatistics, ScheduleConflict, CapacityAlert } from '../../services/academics/enhancedSectionService';
import type { Schedule } from '../../interfaces/college/scheduleInterface';

interface EnhancedSectionState {
  statistics: SectionStatistics | null;
  conflicts: {
    [sectionId: number]: ScheduleConflict[];
  };
  capacityAlerts: CapacityAlert[];
  schedules: {
    [sectionId: number]: Schedule[];
  };
  loading: {
    statistics: boolean;
    conflicts: boolean;
    capacityAlerts: boolean;
    schedule: boolean;
    capacityUpdate: boolean;
  };
  error: {
    statistics: string | null;
    conflicts: string | null;
    capacityAlerts: string | null;
    schedule: string | null;
    capacityUpdate: string | null;
  };
}

export const useEnhancedSectionStore = defineStore('enhancedSection', {
  state: (): EnhancedSectionState => ({
    statistics: null,
    conflicts: {},
    capacityAlerts: [],
    schedules: {},
    loading: {
      statistics: false,
      conflicts: false,
      capacityAlerts: false,
      schedule: false,
      capacityUpdate: false,
    },
    error: {
      statistics: null,
      conflicts: null,
      capacityAlerts: null,
      schedule: null,
      capacityUpdate: null,
    },
  }),

  getters: {
    getConflictsBySection: (state) => (sectionId: number) => state.conflicts[sectionId] || [],
    getScheduleBySection: (state) => (sectionId: number) => state.schedules[sectionId] || [],
    getStatistics: (state) => state.statistics,
    getCapacityAlerts: (state) => state.capacityAlerts,
    isLoading: (state) => Object.values(state.loading).some(Boolean),
    hasError: (state) => Object.values(state.error).some(Boolean),
  },

  actions: {
    async fetchStatistics(params?: { term?: number; course?: number }) {
      this.loading.statistics = true;
      this.error.statistics = null;
      try {
        this.statistics = await enhancedSectionService.getSectionStatistics(params);
      } catch (error) {
        this.error.statistics = error instanceof Error ? error.message : 'Failed to fetch statistics';
        throw error;
      } finally {
        this.loading.statistics = false;
      }
    },

    async fetchConflicts(sectionId: number) {
      this.loading.conflicts = true;
      this.error.conflicts = null;
      try {
        const conflicts = await enhancedSectionService.checkScheduleConflicts(sectionId);
        this.conflicts[sectionId] = conflicts;
      } catch (error) {
        this.error.conflicts = error instanceof Error ? error.message : 'Failed to fetch conflicts';
        throw error;
      } finally {
        this.loading.conflicts = false;
      }
    },

    async fetchCapacityAlerts(params?: { term?: number; course?: number; threshold?: number }) {
      this.loading.capacityAlerts = true;
      this.error.capacityAlerts = null;
      try {
        this.capacityAlerts = await enhancedSectionService.getCapacityAlerts(params);
      } catch (error) {
        this.error.capacityAlerts = error instanceof Error ? error.message : 'Failed to fetch capacity alerts';
        throw error;
      } finally {
        this.loading.capacityAlerts = false;
      }
    },

    async fetchSectionSchedule(sectionId: number) {
      this.loading.schedule = true;
      this.error.schedule = null;
      try {
        const schedule = await enhancedSectionService.getSectionSchedule(sectionId);
        this.schedules[sectionId] = schedule;
      } catch (error) {
        this.error.schedule = error instanceof Error ? error.message : 'Failed to fetch section schedule';
        throw error;
      } finally {
        this.loading.schedule = false;
      }
    },

    async validateSchedule(sectionId: number, schedule: Partial<Schedule>) {
      try {
        const result = await enhancedSectionService.validateSchedule(sectionId, schedule);
        if (result.conflicts.length > 0) {
          this.conflicts[sectionId] = result.conflicts;
        }
        return result;
      } catch (error) {
        throw error;
      }
    },

    async updateCapacity(sectionId: number, newCapacity: number) {
      this.loading.capacityUpdate = true;
      this.error.capacityUpdate = null;
      try {
        const result = await enhancedSectionService.updateCapacity(sectionId, newCapacity);
        // Refresh statistics and capacity alerts
        await Promise.all([
          this.fetchStatistics(),
          this.fetchCapacityAlerts()
        ]);
        return result;
      } catch (error) {
        this.error.capacityUpdate = error instanceof Error ? error.message : 'Failed to update capacity';
        throw error;
      } finally {
        this.loading.capacityUpdate = false;
      }
    },

    clearErrors() {
      this.error = {
        statistics: null,
        conflicts: null,
        capacityAlerts: null,
        schedule: null,
        capacityUpdate: null,
      };
    },

    clearState() {
      this.statistics = null;
      this.conflicts = {};
      this.capacityAlerts = [];
      this.schedules = {};
      this.clearErrors();
    },
  },
}); 