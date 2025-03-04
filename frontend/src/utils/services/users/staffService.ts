import { BaseService, type QueryParams } from '../baseService';
import { API_ROUTES } from '../../config/apiRoutes';
import type { Staff, Permission, StaffRole } from '../../interfaces/users/staffInterface';
import type { PaginatedResponse } from '../baseService';
import type { RFIDCard } from '../../interfaces/utilities/RFIDInterface';

export class StaffService extends BaseService {
  constructor() {
    super(API_ROUTES.STAFF_ROUTE);
  }

  /**
   * Get a list of staff members with optional filtering
   */
  async getStaffMembers(params?: QueryParams) {
    return this.getList<Staff>('', params);
  }

  /**
   * Get a staff member by ID
   */
  async getStaffMemberById(id: number) {
    return this.getById<Staff>(id);
  }

  /**
   * Create a new staff member
   */
  async createStaffMember(staffData: Partial<Staff>) {
    return this.create<Staff>(staffData);
  }

  /**
   * Update a staff member
   */
  async updateStaffMember(id: number, staffData: Partial<Staff>) {
    return this.patch<Staff>(id, staffData);
  }

  /**
   * Delete a staff member
   */
  async deleteStaffMember(id: number) {
    return this.delete<Staff>(id);
  }

  /**
   * Get permissions for a staff member
   */
  async getStaffPermissions(staffId: number) {
    return this.get<PaginatedResponse<Permission>>(`${staffId}/permissions`);
  }

  /**
   * Update permissions for a staff member
   */
  async updateStaffPermissions(staffId: number, permissionIds: number[]) {
    return this.patch<Staff>(`${staffId}/permissions`, { permissions: permissionIds });
  }

  /**
   * Get all available permissions
   */
  async getAllPermissions() {
    return this.get<PaginatedResponse<Permission>>(API_ROUTES.STAFF_PERMISSIONS);
  }

  /**
   * Get all staff roles
   */
  async getStaffRoles() {
    return this.get<PaginatedResponse<StaffRole>>('/roles');
  }

  /**
   * Create a new staff role
   */
  async createStaffRole(roleData: Partial<StaffRole>) {
    return this.post<StaffRole>('/roles', roleData);
  }

  /**
   * Update a staff role
   */
  async updateStaffRole(roleId: number, roleData: Partial<StaffRole>) {
    return this.patch<StaffRole>(`/roles/${roleId}`, roleData);
  }

  /**
   * Delete a staff role
   */
  async deleteStaffRole(roleId: number) {
    return this.delete<void>(`/roles/${roleId}`);
  }

  /**
   * Get RFID card for a staff member
   */
  async getStaffRFIDCard(staffId: number) {
    return this.get<RFIDCard>(`${staffId}/rfid`);
  }

  /**
   * Assign RFID card to a staff member
   */
  async assignRFIDCard(staffId: number, cardId: string) {
    return this.post<RFIDCard>(`${staffId}/rfid`, { card_id: cardId });
  }

  /**
   * Remove RFID card from a staff member
   */
  async removeRFIDCard(staffId: number) {
    return this.delete<void>(`${staffId}/rfid`);
  }
}

// Create and export a singleton instance
const staffService = new StaffService();
export default staffService; 