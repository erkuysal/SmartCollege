import { BaseService } from '../baseService';
import { API_ROUTES } from '@/utils/config/apiRoutes';
import type { Enrollment, CreateEnrollmentData } from './enrollmentService';

export interface EnrollmentStatistics {
  total_enrollments: number;
  active_enrollments: number;
  waitlisted_enrollments: number;
  dropped_enrollments: number;
  by_status: {
    registered: number;
    waitlisted: number;
    dropped: number;
  };
  by_section: {
    [sectionId: number]: number;
  };
  by_term: {
    [termId: number]: number;
  };
}

export interface WaitlistEntry {
  id: number;
  student: number;
  section: number;
  position: number;
  date_added: string;
  status: 'waiting' | 'offered' | 'expired';
}

export interface BatchEnrollmentResult {
  successful: Enrollment[];
  failed: {
    student: number;
    section: number;
    reason: string;
  }[];
}

class EnhancedEnrollmentService extends BaseService {
  private static instance: EnhancedEnrollmentService;

  private constructor() {
    super(API_ROUTES.ENROLLMENT_ROUTE);
  }

  public static getInstance(): EnhancedEnrollmentService {
    if (!EnhancedEnrollmentService.instance) {
      EnhancedEnrollmentService.instance = new EnhancedEnrollmentService();
    }
    return EnhancedEnrollmentService.instance;
  }

  /**
   * Batch enroll multiple students in a section
   */
  async batchEnroll(sectionId: number, studentIds: number[]): Promise<BatchEnrollmentResult> {
    return await this.post('batch-enroll/', {
      section_id: sectionId,
      student_ids: studentIds
    });
  }

  /**
   * Get enrollment statistics
   */
  async getEnrollmentStatistics(params?: {
    term?: number;
    section?: number;
    course?: number;
  }): Promise<EnrollmentStatistics> {
    const queryParams = new URLSearchParams();
    if (params?.term) queryParams.append('term', params.term.toString());
    if (params?.section) queryParams.append('section', params.section.toString());
    if (params?.course) queryParams.append('course', params.course.toString());

    const response = await this.get(`statistics/?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Add student to waitlist
   */
  async addToWaitlist(sectionId: number, studentId: number): Promise<WaitlistEntry> {
    return await this.post('waitlist/', {
      section_id: sectionId,
      student_id: studentId
    });
  }

  /**
   * Get waitlist for a section
   */
  async getWaitlist(sectionId: number): Promise<WaitlistEntry[]> {
    const response = await this.get(`waitlist/${sectionId}/`);
    return response.data;
  }

  /**
   * Offer spot to next student on waitlist
   */
  async offerWaitlistSpot(sectionId: number): Promise<{
    offered: WaitlistEntry | null;
    enrollment: Enrollment | null;
  }> {
    return await this.post(`waitlist/${sectionId}/offer/`);
  }

  /**
   * Validate enrollment eligibility
   */
  async validateEnrollment(studentId: number, sectionId: number): Promise<{
    eligible: boolean;
    reasons: string[];
  }> {
    const response = await this.get(`validate/${studentId}/${sectionId}/`);
    return response.data;
  }

  /**
   * Get enrollment history for a student
   */
  async getEnrollmentHistory(studentId: number): Promise<{
    current: Enrollment[];
    past: Enrollment[];
    waitlisted: WaitlistEntry[];
  }> {
    const response = await this.get(`history/${studentId}/`);
    return response.data;
  }
}

export const enhancedEnrollmentService = EnhancedEnrollmentService.getInstance(); 