export interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface TeacherState {
  teachers: Teacher[];
  isLoading: boolean;
  error: string | null;
} 