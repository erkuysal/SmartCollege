import { BaseService } from '../baseService';
import type { Term } from './enrollmentService';

class TermService extends BaseService {
  private static instance: TermService;

  private constructor() {
    super('/api/academics');
  }

  public static getInstance(): TermService {
    if (!TermService.instance) {
      TermService.instance = new TermService();
    }
    return TermService.instance;
  }

  async getAllTerms(): Promise<Term[]> {
    const response = await this.getList<Term>('terms/');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return [];
  }

  async getTermById(id: number): Promise<Term> {
    const response = await this.getById<Term>(id, 'terms/');
    return response.data;
  }

  async createTerm(term: Omit<Term, 'id'>): Promise<Term> {
    const response = await this.create<Term>(term, 'terms/');
    return response.data;
  }

  async updateTerm(id: number, term: Partial<Term>): Promise<Term> {
    const response = await this.patch<Term>(id, term, 'terms/');
    return response.data;
  }

  async updateTermFull(id: number, term: Omit<Term, 'id'>): Promise<Term> {
    const response = await this.update<Term>(id, term, 'terms/');
    return response.data;
  }

  async deleteTerm(id: number): Promise<void> {
    await this.delete(id, 'terms/');
  }
}

export const termService = TermService.getInstance(); 