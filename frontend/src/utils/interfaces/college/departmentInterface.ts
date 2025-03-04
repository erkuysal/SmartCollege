export interface Program {
  id: number;
  name: string;
  code: string;
  description: string;
  degree_level: 'associate' | 'bachelor' | 'master' | 'doctorate';
  duration_years: number;
  credits_required: number;
  is_active: boolean;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  faculty?: number; // Faculty ID
  head_of_department?: number; // Lecturer ID
  office_location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PopulatedDepartment extends Omit<Department, 'faculty' | 'head_of_department'> {
  faculty?: {
    id: number;
    name: string;
  };
  head_of_department?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  lecturers_count?: number;
  students_count?: number;
  courses_count?: number;
} 