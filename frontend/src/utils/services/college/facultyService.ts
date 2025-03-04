import { BaseService, type QueryParams } from '../baseService';
import { API_ROUTES } from '../../config/apiRoutes';
import type { Faculty } from '../../interfaces/college/facultyInterface';
import type { PaginatedResponse } from '../baseService';

export class FacultyService extends BaseService {
  constructor() {
    super(API_ROUTES.FACULTIES_ROUTE);
  }

  /**
   * Get a list of faculties with optional filtering
   */
  async getFaculties(params?: QueryParams) {
    return this.getList<Faculty>('', params);
  }

  /**
   * Get a faculty by ID
   */
  async getFacultyById(id: number) {
    return this.getById<Faculty>(id);
  }

  /**
   * Create a new faculty
   */
  async createFaculty(facultyData: Partial<Faculty>) {
    return this.create<Faculty>(facultyData);
  }

  /**
   * Update a faculty
   */
  async updateFaculty(id: number, facultyData: Partial<Faculty>) {
    return this.update<Faculty>(id, facultyData);
  }

  /**
   * Delete a faculty
   */
  async deleteFaculty(id: number) {
    return this.delete<Faculty>(id);
  }

  /**
   * Get active faculties
   */
  async getActiveFaculties() {
    return this.getList<Faculty>('', { is_active: true });
  }
}

// Create and export a singleton instance
const facultyService = new FacultyService();
export default facultyService; 