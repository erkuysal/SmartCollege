import { BaseService } from '../baseService';
import { API_ROUTES } from '@/utils/config/apiRoutes';

export interface Enrollment {
  id: number;
  student: number;
  section: number;
  status: string;
  date_enrolled: string;
  date_status_changed: string;
  grade: string;
  notes: string;
}

export interface CreateEnrollmentData {
  student: number;
  section: number;
  status: string;
  date_enrolled: string;
  grade: string;
  notes: string;
}

export interface Term {
  id: number;
  name: string;
  term: string | null;
  academic_year: string;
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  is_active: boolean;
}

class EnrollmentService extends BaseService {
  private static instance: EnrollmentService;

  private constructor() {
    super();
  }

  public static getInstance(): EnrollmentService {
    if (!EnrollmentService.instance) {
      EnrollmentService.instance = new EnrollmentService();
    }
    return EnrollmentService.instance;
  }

  async getEnrollments(params?: { student?: number; section?: number }): Promise<Enrollment[]> {
    const queryParams = new URLSearchParams();
    if (params?.student) queryParams.append('student', params.student.toString());
    if (params?.section) queryParams.append('section', params.section.toString());

    const response = await this.get(`${API_ROUTES.ENROLLMENT_ROUTE}?${queryParams.toString()}`);
    return response.results;
  }

  async createEnrollment(data: CreateEnrollmentData): Promise<Enrollment> {
    return await this.post(API_ROUTES.ENROLLMENT_ROUTE, data);
  }

  async updateEnrollment(id: number, data: Partial<CreateEnrollmentData>): Promise<Enrollment> {
    return await this.put(`${API_ROUTES.ENROLLMENT_ROUTE}${id}/`, data);
  }

  async deleteEnrollment(id: number): Promise<void> {
    await this.delete(`${API_ROUTES.ENROLLMENT_ROUTE}${id}/`);
  }

  async refreshEnrollment(): Promise<Enrollment> {
    const response = await this.post<Enrollment>('refresh-enrollment/');
    return response.data;
  }
}

export const enrollmentService = EnrollmentService.getInstance(); 