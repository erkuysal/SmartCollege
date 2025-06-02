import type { Course } from './courseInterface';
import type { Classroom } from './classroomInterface';
import type { Lecturer } from '../users/lecturerInterface';

export enum DAY_OF_WEEK {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7
}

// Updated to match the actual API response format
export interface Schedule {
  id: number;
  classroom: number;
  classroom_name: string;
  section: number;
  section_name: string;
  course_name: string;
  time_slot: number;
  time_slot_display: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Interface for time slots
export interface TimeSlot {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

// Legacy interface for backward compatibility with existing code
export interface LegacySchedule {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
  course_id?: number;
  lecturer_id?: number;
  classroom_id?: number;
  status: 'active' | 'cancelled' | 'postponed';
  created_at: string;
  updated_at: string;
}

export interface PopulatedSchedule extends LegacySchedule {
  course?: {
    id: number;
    name: string;
    code: string;
  };
  lecturer?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  classroom?: {
    id: number;
    name: string;
    building: string;
    capacity: number;
  };
}

export interface ScheduleFilter {
  classroom?: number;
  section?: number;
  time_slot?: number;
  is_active?: boolean;
}

export interface ScheduleResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Schedule[];
}
