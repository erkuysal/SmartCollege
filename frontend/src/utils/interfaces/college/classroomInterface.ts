export interface Classroom {
  id: number;
  name: string;
  building: string;
  room_number: string;
  capacity: number;
  has_projector: boolean;
  has_computers: boolean;
  is_lab: boolean;
  is_active: boolean;
  notes?: string;
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