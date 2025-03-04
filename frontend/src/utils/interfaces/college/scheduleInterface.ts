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

export interface Schedule {
  id: number;
  course: number; // Course ID
  classroom: number; // Classroom ID
  lecturer: number; // Lecturer ID
  day_of_week: DAY_OF_WEEK;
  start_time: string;
  end_time: string;
  semester: string;
  is_recurring: boolean;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

export interface PopulatedSchedule extends Omit<Schedule, 'course' | 'classroom' | 'lecturer'> {
  course: Course;
  classroom: Classroom;
  lecturer: Lecturer;
}
