import { BaseService, type QueryParams } from '../baseService';
import { API_ROUTES } from '../../config/apiRoutes';
import type { 
  RFIDCard, 
  RFIDAccessLog, 
  RFIDAccessVerification, 
  RFIDAccessResponse 
} from '../../interfaces/utilities/RFIDInterface';
import type { PaginatedResponse } from '../baseService';

export class RFIDService extends BaseService {
  constructor() {
    super(API_ROUTES.UTILITIES_BASE_URL);
  }

  /**
   * Get a list of RFID cards with optional filtering
   */
  async getRFIDCards(params?: QueryParams) {
    return this.getList<RFIDCard>(API_ROUTES.RFID_CARDS, params);
  }

  /**
   * Get an RFID card by ID
   */
  async getRFIDCardById(id: number) {
    return this.getById<RFIDCard>(id, API_ROUTES.RFID_CARDS);
  }

  /**
   * Create a new RFID card
   */
  async createRFIDCard(cardData: Partial<RFIDCard>) {
    return this.create<RFIDCard>(cardData, API_ROUTES.RFID_CARDS);
  }

  /**
   * Update an RFID card
   */
  async updateRFIDCard(id: number, cardData: Partial<RFIDCard>) {
    return this.patch<RFIDCard>(id, cardData, API_ROUTES.RFID_CARDS);
  }

  /**
   * Delete an RFID card
   */
  async deleteRFIDCard(id: number) {
    return this.delete<RFIDCard>(id, API_ROUTES.RFID_CARDS);
  }

  /**
   * Verify access for an RFID card
   */
  async verifyAccess(verificationData: RFIDAccessVerification) {
    return this.post<RFIDAccessResponse>(API_ROUTES.RFID_ACCESS.VERIFY, verificationData);
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
}

// Create and export a singleton instance
const rfidService = new RFIDService();
export default rfidService;
