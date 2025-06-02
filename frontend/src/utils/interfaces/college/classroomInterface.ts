export interface Classroom {
  id: number;
  name: string;
  building: string;
  room_number?: string;
  capacity: number;
  has_projector: boolean;
  has_whiteboard: boolean;
  is_active: boolean;
  is_in_use: boolean;
  notes?: string;
  
  // Additional fields from actual API response
  department: number;
  department_name: string;
  facility: number;
  facility_name: string;
  created_at: string;
  updated_at: string;
}

export interface ClassroomSchedule {
  id: number;
  classroom: number; // Classroom ID
  course: number; // Course ID
  day_of_week: number; // 1-7 (Monday-Sunday)
  start_time: string;
  end_time: string;
  semester: string;
  is_recurring: boolean;
  start_date?: string;
  end_date?: string;
}

export interface PopulatedClassroomSchedule extends Omit<ClassroomSchedule, 'classroom' | 'course'> {
  classroom: Classroom;
  course: {
    id: number;
    code: string;
    name: string;
  };
  lecturer?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}