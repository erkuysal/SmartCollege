import { BaseService, type QueryParams } from '../baseService';
import { API_ROUTES } from '../../config/apiRoutes';
import type { Department, Program } from '../../interfaces/college/departmentInterface';
import type { PaginatedResponse } from '../baseService';

export class DepartmentService extends BaseService {
  constructor() {
    super(API_ROUTES.DEPARTMENTS_ROUTE);
  }

  /**
   * Get a list of departments with optional filtering
   */
  async getDepartments(params?: QueryParams) {
    return this.getList<Department>('', params);
  }

  /**
   * Get a department by ID
   */
  async getDepartmentById(id: number) {
    return this.getById<Department>(id);
  }

  /**
   * Create a new department
   */
  async createDepartment(departmentData: Partial<Department>) {
    return this.create<Department>(departmentData);
  }

  /**
   * Update a department
   */
  async updateDepartment(id: number, departmentData: Partial<Department>) {
    return this.update<Department>(id, departmentData);
  }

  /**
   * Delete a department
   */
  async deleteDepartment(id: number) {
    return this.delete<Department>(id);
  }

  /**
   * Get programs for a department
   */
  async getDepartmentPrograms(departmentId: number) {
    const url = API_ROUTES.DEPARTMENT_PROGRAMS.replace('{id}', departmentId.toString());
    return this.get<PaginatedResponse<Program>>(url);
  }

  /**
   * Add a program to a department
   */
  async addDepartmentProgram(departmentId: number, programData: Partial<Program>) {
    const url = API_ROUTES.DEPARTMENT_PROGRAMS.replace('{id}', departmentId.toString());
    return this.post<Program>(url, programData);
  }

  /**
   * Update a program in a department
   */
  async updateDepartmentProgram(departmentId: number, programId: number, programData: Partial<Program>) {
    const url = API_ROUTES.DEPARTMENT_PROGRAMS.replace('{id}', departmentId.toString());
    return this.patch<Program>(`${url}/${programId}`, programData);
  }

  /**
   * Remove a program from a department
   */
  async removeDepartmentProgram(departmentId: number, programId: number) {
    const url = API_ROUTES.DEPARTMENT_PROGRAMS.replace('{id}', departmentId.toString());
    return this.delete<void>(`${url}/${programId}`);
  }

  /**
   * Get active departments
   */
  async getActiveDepartments() {
    return this.getList<Department>('', { is_active: true });
  }
}

// Create and export a singleton instance
const departmentService = new DepartmentService();
export default departmentService; 