import { BaseService } from '../baseService';
import { API_ROUTES } from '@/utils/config/apiRoutes';

export interface Section {
  id: number;
  course: number;
  section_number: string;
  academic_term: number;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSectionData {
  course: number;
  section_number: string;
  academic_term: number;
  capacity: number;
}

class SectionService extends BaseService {
  private static instance: SectionService;

  private constructor() {
    super();
  }

  public static getInstance(): SectionService {
    if (!SectionService.instance) {
      SectionService.instance = new SectionService();
    }
    return SectionService.instance;
  }

  async getSections(params?: { course?: number; academic_term?: number; active_only?: boolean }): Promise<Section[]> {
    const queryParams = new URLSearchParams();
    if (params?.course) queryParams.append('course', params.course.toString());
    if (params?.academic_term) queryParams.append('academic_term', params.academic_term.toString());
    if (params?.active_only !== undefined) queryParams.append('active_only', params.active_only.toString());

    const response = await this.get(`${API_ROUTES.SECTION_ROUTE}?${queryParams.toString()}`);
    return response.results;
  }

  async createSection(data: CreateSectionData): Promise<Section> {
    return await this.post(API_ROUTES.SECTION_ROUTE, data);
  }

  async updateSection(id: number, data: Partial<CreateSectionData>): Promise<Section> {
    return await this.put(`${API_ROUTES.SECTION_ROUTE}${id}/`, data);
  }

  async deleteSection(id: number): Promise<void> {
    await this.delete(`${API_ROUTES.SECTION_ROUTE}${id}/`);
  }
}

export const sectionService = SectionService.getInstance(); 