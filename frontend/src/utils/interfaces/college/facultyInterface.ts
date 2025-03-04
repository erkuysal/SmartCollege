export interface Faculty {
  id: number;
  name: string;
  code: string;
  description?: string;
  dean?: string;
  office_location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PopulatedFaculty extends Faculty {
  departments_count?: number;
  lecturers_count?: number;
  students_count?: number;
} 