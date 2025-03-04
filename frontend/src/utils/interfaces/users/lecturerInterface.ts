import type { BaseUser } from './baseUserInterface';

export interface CourseAssignment {
  id: number;
  course_id: number;
  course_name: string;
  course_code: string;
  semester: string;
  credits: number;
  assignment_date: string;
  status: 'active' | 'completed' | 'planned';
}

export interface LecturerSchedule {
  id: number;
  course_id: number;
  course_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  classroom: string;
  building: string;
}

export interface OfficeHours {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string;
  is_available: boolean;
}

export interface Attendance {
  id: number;
  course_id: number;
  course_name: string;
  date: string;
  students_present: number;
  students_absent: number;
  students_late: number;
  students_excused: number;
  total_students: number;
}

export interface Lecturer extends BaseUser {
  lecturer_id: string;
  department: string;
  position: string;
  specialization?: string;
  office_location?: string;
  office_hours?: OfficeHours[];
  assigned_courses?: CourseAssignment[];
  schedule?: LecturerSchedule[];
  attendance_records?: Attendance[];
  teaching_load?: number;
  rfid_card_id?: string;
} 