import { BaseService } from '../baseService';
import { API_ROUTES } from '@/utils/config/apiRoutes';
import type { Section, CreateSectionData } from './sectionService';
import type { Schedule } from '../../interfaces/college/scheduleInterface';

export interface SectionStatistics {
  total_sections: number;
  active_sections: number;
  total_capacity: number;
  total_enrolled: number;
  by_course: {
    [courseId: number]: {
      sections: number;
      capacity: number;
      enrolled: number;
    };
  };
  by_term: {
    [termId: number]: {
      sections: number;
      capacity: number;
      enrolled: number;
    };
  };
}

export interface ScheduleConflict {
  type: 'time' | 'classroom' | 'instructor';
  section1: number;
  section2: number;
  details: string;
}

export interface CapacityAlert {
  section_id: number;
  current_enrollment: number;
  capacity: number;
  percentage_filled: number;
  status: 'warning' | 'critical';
}

class EnhancedSectionService extends BaseService {
  private static instance: EnhancedSectionService;

  private constructor() {
    super(API_ROUTES.SECTION_ROUTE);
  }

  public static getInstance(): EnhancedSectionService {
    if (!EnhancedSectionService.instance) {
      EnhancedSectionService.instance = new EnhancedSectionService();
    }
    return EnhancedSectionService.instance;
  }

  /**
   * Get section statistics
   */
  async getSectionStatistics(params?: {
    term?: number;
    course?: number;
  }): Promise<SectionStatistics> {
    const queryParams = new URLSearchParams();
    if (params?.term) queryParams.append('term', params.term.toString());
    if (params?.course) queryParams.append('course', params.course.toString());

    const response = await this.get<SectionStatistics>(`statistics/?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Check for schedule conflicts
   */
  async checkScheduleConflicts(sectionId: number): Promise<ScheduleConflict[]> {
    const response = await this.get<ScheduleConflict[]>(`conflicts/${sectionId}/`);
    return response.data;
  }

  /**
   * Get capacity alerts for sections
   */
  async getCapacityAlerts(params?: {
    term?: number;
    course?: number;
    threshold?: number;
  }): Promise<CapacityAlert[]> {
    const queryParams = new URLSearchParams();
    if (params?.term) queryParams.append('term', params.term.toString());
    if (params?.course) queryParams.append('course', params.course.toString());
    if (params?.threshold) queryParams.append('threshold', params.threshold.toString());

    const response = await this.get<CapacityAlert[]>(`capacity-alerts/?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Validate section schedule
   */
  async validateSchedule(sectionId: number, schedule: Partial<Schedule>): Promise<{
    valid: boolean;
    conflicts: ScheduleConflict[];
    warnings: string[];
  }> {
    const response = await this.post<{
      valid: boolean;
      conflicts: ScheduleConflict[];
      warnings: string[];
    }>(`validate-schedule/${sectionId}/`, schedule);
    return response.data;
  }

  /**
   * Get section schedule
   */
  async getSectionSchedule(sectionId: number): Promise<Schedule[]> {
    const response = await this.get<Schedule[]>(`schedule/${sectionId}/`);
    return response.data;
  }

  /**
   * Update section capacity
   */
  async updateCapacity(sectionId: number, newCapacity: number): Promise<{
    section: Section;
    previous_capacity: number;
    new_capacity: number;
    affected_enrollments: number;
  }> {
    const response = await this.patch<{
      section: Section;
      previous_capacity: number;
      new_capacity: number;
      affected_enrollments: number;
    }>(`${sectionId}/capacity/`, { capacity: newCapacity });
    return response.data;
  }
}

export const enhancedSectionService = EnhancedSectionService.getInstance(); 