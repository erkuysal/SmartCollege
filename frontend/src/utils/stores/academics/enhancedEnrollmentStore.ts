import { defineStore } from 'pinia';
import { enhancedEnrollmentService } from '../../services/academics/enhancedEnrollmentService';
import type { Enrollment } from '../../services/academics/enrollmentService';
import type { EnrollmentStatistics, WaitlistEntry, BatchEnrollmentResult } from '../../services/academics/enhancedEnrollmentService';

interface EnhancedEnrollmentState {
  statistics: EnrollmentStatistics | null;
  waitlist: {
    [sectionId: number]: WaitlistEntry[];
  };
  enrollmentHistory: {
    [studentId: number]: {
      current: Enrollment[];
      past: Enrollment[];
      waitlisted: WaitlistEntry[];
    };
  };
  loading: {
    statistics: boolean;
    waitlist: boolean;
    history: boolean;
    batchEnroll: boolean;
  };
  error: {
    statistics: string | null;
    waitlist: string | null;
    history: string | null;
    batchEnroll: string | null;
  };
}

export const useEnhancedEnrollmentStore = defineStore('enhancedEnrollment', {
  state: (): EnhancedEnrollmentState => ({
    statistics: null,
    waitlist: {},
    enrollmentHistory: {},
    loading: {
      statistics: false,
      waitlist: false,
      history: false,
      batchEnroll: false,
    },
    error: {
      statistics: null,
      waitlist: null,
      history: null,
      batchEnroll: null,
    },
  }),

  getters: {
    getWaitlistBySection: (state) => (sectionId: number) => state.waitlist[sectionId] || [],
    getEnrollmentHistory: (state) => (studentId: number) => state.enrollmentHistory[studentId],
    getStatistics: (state) => state.statistics,
    isLoading: (state) => Object.values(state.loading).some(Boolean),
    hasError: (state) => Object.values(state.error).some(Boolean),
  },

  actions: {
    async fetchStatistics(params?: { term?: number; section?: number; course?: number }) {
      this.loading.statistics = true;
      this.error.statistics = null;
      try {
        this.statistics = await enhancedEnrollmentService.getEnrollmentStatistics(params);
      } catch (error) {
        this.error.statistics = error instanceof Error ? error.message : 'Failed to fetch statistics';
        throw error;
      } finally {
        this.loading.statistics = false;
      }
    },

    async fetchWaitlist(sectionId: number) {
      this.loading.waitlist = true;
      this.error.waitlist = null;
      try {
        const waitlist = await enhancedEnrollmentService.getWaitlist(sectionId);
        this.waitlist[sectionId] = waitlist;
      } catch (error) {
        this.error.waitlist = error instanceof Error ? error.message : 'Failed to fetch waitlist';
        throw error;
      } finally {
        this.loading.waitlist = false;
      }
    },

    async fetchEnrollmentHistory(studentId: number) {
      this.loading.history = true;
      this.error.history = null;
      try {
        const history = await enhancedEnrollmentService.getEnrollmentHistory(studentId);
        this.enrollmentHistory[studentId] = history;
      } catch (error) {
        this.error.history = error instanceof Error ? error.message : 'Failed to fetch enrollment history';
        throw error;
      } finally {
        this.loading.history = false;
      }
    },

    async batchEnroll(sectionId: number, studentIds: number[]): Promise<BatchEnrollmentResult> {
      this.loading.batchEnroll = true;
      this.error.batchEnroll = null;
      try {
        const result = await enhancedEnrollmentService.batchEnroll(sectionId, studentIds);
        // Refresh statistics after batch enrollment
        await this.fetchStatistics({ section: sectionId });
        return result;
      } catch (error) {
        this.error.batchEnroll = error instanceof Error ? error.message : 'Failed to batch enroll students';
        throw error;
      } finally {
        this.loading.batchEnroll = false;
      }
    },

    async addToWaitlist(sectionId: number, studentId: number) {
      try {
        const entry = await enhancedEnrollmentService.addToWaitlist(sectionId, studentId);
        if (!this.waitlist[sectionId]) {
          this.waitlist[sectionId] = [];
        }
        this.waitlist[sectionId].push(entry);
        return entry;
      } catch (error) {
        throw error;
      }
    },

    async offerWaitlistSpot(sectionId: number) {
      try {
        const result = await enhancedEnrollmentService.offerWaitlistSpot(sectionId);
        if (result.offered) {
          // Update waitlist
          this.waitlist[sectionId] = this.waitlist[sectionId].filter(
            entry => entry.id !== result.offered!.id
          );
        }
        // Refresh statistics
        await this.fetchStatistics({ section: sectionId });
        return result;
      } catch (error) {
        throw error;
      }
    },

    clearErrors() {
      this.error = {
        statistics: null,
        waitlist: null,
        history: null,
        batchEnroll: null,
      };
    },

    clearState() {
      this.statistics = null;
      this.waitlist = {};
      this.enrollmentHistory = {};
      this.clearErrors();
    },
  },
}); 