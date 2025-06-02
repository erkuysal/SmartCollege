import { BaseService, type QueryParams } from '../baseService';
import { API_ROUTES } from '../../config/apiRoutes';
import type { 
  RFIDCard, 
  RFIDAccessLog, 
  RFIDAccessVerification, 
  RFIDAccessResponse,
  RFIDResponse,
  WriteRFIDResponse
} from '../../interfaces/utilities/RFIDInterface';
import type { PaginatedResponse } from '../baseService';

export class RFIDService extends BaseService {
  private static instance: RFIDService;

  private constructor() {
    super(API_ROUTES.UTILITIES_BASE_URL);
  }

  public static getInstance(): RFIDService {
    if (!RFIDService.instance) {
      RFIDService.instance = new RFIDService();
    }
    return RFIDService.instance;
  }

  /**
   * Read an RFID card
   */
  async readRFID() {
    return this.get<RFIDResponse>('/read/');
  }

  /**
   * Write to an RFID card
   */
  async writeRFID(userId: number, staffId?: number) {
    const data = staffId ? { user_id: userId, staff_id: staffId } : { user_id: userId };
    return this.post<WriteRFIDResponse>('/write/', data);
  }

  /**
   * Get a list of RFID cards with optional filtering
   */
  async getRFIDCards(params?: QueryParams) {
    return this.getList<RFIDCard>('/cards/', params);
  }

  /**
   * Get an RFID card by ID
   */
  async getRFIDCardById(id: number) {
    return this.getById<RFIDCard>(id, '/cards/');
  }

  /**
   * Create a new RFID card
   */
  async createRFIDCard(cardData: Partial<RFIDCard>) {
    return this.create<RFIDCard>(cardData, '/cards/');
  }

  /**
   * Update an RFID card
   */
  async updateRFIDCard(id: number, cardData: Partial<RFIDCard>) {
    return this.patch<RFIDCard>(id, cardData, '/cards/');
  }

  /**
   * Delete an RFID card
   */
  async deleteRFIDCard(id: number) {
    return this.delete<RFIDCard>(id, '/cards/');
  }

  /**
   * Get access logs for RFID cards
   */
  async getAccessLogs(params?: QueryParams) {
    return this.get<PaginatedResponse<RFIDAccessLog>>(API_ROUTES.RFID_ACCESS.LOGS, params);
  }

  /**
   * Get access logs for a specific RFID card
   */
  async getCardAccessLogs(cardId: string, params?: QueryParams) {
    return this.get<PaginatedResponse<RFIDAccessLog>>(
      `${API_ROUTES.RFID_ACCESS.LOGS}/${cardId}`,
      params
    );
  }

  /**
   * Get access logs for a specific user
   */
  async getUserAccessLogs(userId: number, userType: 'student' | 'lecturer' | 'staff', params?: QueryParams) {
    return this.get<PaginatedResponse<RFIDAccessLog>>(
      `${API_ROUTES.RFID_ACCESS.LOGS}/user/${userId}`,
      { ...params, user_type: userType }
    );
  }

  /**
   * Get access logs for a specific access point
   */
  async getAccessPointLogs(accessPoint: string, params?: QueryParams) {
    return this.get<PaginatedResponse<RFIDAccessLog>>(
      `${API_ROUTES.RFID_ACCESS.LOGS}/point/${accessPoint}`,
      params
    );
  }

  // Auto-assign new RFID (POST)
  async assignRFID(data: { user_id: number }) {
    return this.post('/assign/', data);
  }

  // List staff who can write RFID (GET)
  async getStaffList() {
    return this.get('/staff/');
  }

  // Card status and personnel assignment
  async assignToPersonnel(cardId: number, staffId: number) {
    return this.post(`/cards/${cardId}/assign_to_personnel/`, { staff_id: staffId });
  }

  async updateCardStatus(cardId: number, newStatus: string, notes?: string) {
    const data = notes ? { new_status: newStatus, notes } : { new_status: newStatus };
    return this.post(`/cards/${cardId}/update_status/`, data);
  }

  // Assigned and pending cards
  async getAssignedCards() {
    return this.get<RFIDCard[]>('/cards/assigned/');
  }

  async getPendingCards() {
    return this.get<RFIDCard[]>('/cards/pending/');
  }
}

// Create and export a singleton instance
export const rfidService = RFIDService.getInstance();
