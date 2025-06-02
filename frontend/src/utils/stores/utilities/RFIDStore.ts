import { defineStore } from 'pinia';
import { rfidService } from '../../services/utilities/RFIDService';
import type { RFIDCard, RFIDAccessLog, RFIDResponse, WriteRFIDResponse } from '../../interfaces/utilities/RFIDInterface';
import type { PaginatedResponse } from '../../services/baseService';

interface RFIDState {
  cards: RFIDCard[];
  accessLogs: RFIDAccessLog[];
  loading: boolean;
  error: string | null;
  lastReadResponse: RFIDResponse | null;
  lastScan: RFIDResponse | null;
  isScanning: boolean;
}

export const useRFIDStore = defineStore('rfid', {
  state: (): RFIDState => ({
    cards: [] as RFIDCard[],
    accessLogs: [] as RFIDAccessLog[],
    loading: false,
    error: null,
    lastReadResponse: null,
    lastScan: null,
    isScanning: false
  }),
  actions: {
    async readRFID(): Promise<RFIDResponse> {
      this.isScanning = true;
      this.error = null;

      try {
        // TODO: Implement actual RFID reading logic
        // This is a mock implementation
        const response = await fetch('/api/rfid/read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to read RFID card');
        }

        const data = await response.json();
        this.lastScan = data;
        return data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error occurred';
        throw error;
      } finally {
        this.isScanning = false;
      }
    },

    async writeRFID(userId: number, staffId?: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await rfidService.writeRFID(userId, staffId);
        return response.data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchRFIDCards() {
      this.loading = true;
      this.error = null;
      try {
        const response = await rfidService.getRFIDCards();
        this.cards = response.data.results;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
      } finally {
        this.loading = false;
      }
    },

    async assignToPersonnel(cardId: number, staffId: number) {
      this.loading = true;
      this.error = null;
      try {
        return await rfidService.assignToPersonnel(cardId, staffId);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateCardStatus(cardId: number, newStatus: string, notes?: string) {
      this.loading = true;
      this.error = null;
      try {
        return await rfidService.updateCardStatus(cardId, newStatus, notes);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getAssignedCards() {
      this.loading = true;
      this.error = null;
      try {
        const response = await rfidService.getAssignedCards();
        return response.data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getPendingCards() {
      this.loading = true;
      this.error = null;
      try {
        const response = await rfidService.getPendingCards();
        return response.data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchAccessLogs() {
      this.loading = true;
      this.error = null;
      try {
        const response = await rfidService.getAccessLogs();
        this.accessLogs = response.data.results;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
      } finally {
        this.loading = false;
      }
    },

    clearLastScan() {
      this.lastScan = null;
      this.error = null;
    }
  },
});
