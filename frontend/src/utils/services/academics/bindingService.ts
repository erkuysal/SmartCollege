import { BaseService } from '../baseService';

export enum LecturerRole {
  INSTRUCTOR = 'Instructor',
  LAB_ASSISTANT = 'Lab Assistant',
  TA = 'TA'
}

export interface Lecturer {
  id: number;
  user: {
    username: string;
    first_name: string;
    last_name: string;
  };
}

export interface CourseSection {
  id: number;
  course: {
    id: number;
    code: string;
    name: string;
  };
  section_number: string;
  academic_term: {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
  };
}

export interface Binding {
  id: number;
  lecturer: number;
  section: number;
  is_primary: boolean;
  role: LecturerRole | null;
  hours_per_week: number;
  created_at: string;
  updated_at: string;
  
  // Expanded fields (when using expand=true in API)
  lecturer_details?: Lecturer;
  section_details?: CourseSection;
}

class BindingService extends BaseService {
  private static instance: BindingService;
  private readonly BASE_URL = '/api/academics/bindings';

  private constructor() {
    super('/api/academics/bindings');
  }

  public static getInstance(): BindingService {
    if (!BindingService.instance) {
      BindingService.instance = new BindingService();
    }
    return BindingService.instance;
  }

  async getAllBindings(expand: boolean = false): Promise<Binding[]> {
    const response = await this.getList<Binding>(`?expand=${expand}`);
    return response.data.results;
  }

  async getBindingById(id: number, expand: boolean = false): Promise<Binding> {
    const response = await this.getById<Binding>(id, `?expand=${expand}`);
    return response.data;
  }

  async createBinding(binding: Omit<Binding, 'id' | 'created_at' | 'updated_at' | 'lecturer_details' | 'section_details'>): Promise<Binding> {
    const response = await this.create<Binding>(binding);
    return response.data;
  }

  async updateBinding(id: number, binding: Partial<Omit<Binding, 'lecturer_details' | 'section_details'>>): Promise<Binding> {
    const response = await this.patch<Binding>(id, binding);
    return response.data;
  }

  async deleteBinding(id: number): Promise<void> {
    await this.delete(id);
  }
}

export const bindingService = BindingService.getInstance(); 