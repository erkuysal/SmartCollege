import type { Teacher } from './teacherInterface';
import type { Student } from './studentInterface';

// Base interfaces for each model
export interface Classroom {
  id: number;
  name: string;
  capacity: number;
  building?: string;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  teacher?: number;
}

export enum DAY_OF_WEEK {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6
}

export interface Schedule {
  id: number;
  course: number;
  classroom: number;
  day_of_week: DAY_OF_WEEK;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
}

export interface Attendance {
  id: number;
  schedule: number;
  student: number;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export interface PopulatedSchedule extends Omit<Schedule, 'course' | 'classroom'> {
  course: Course;
  classroom: Classroom;
}

export interface PopulatedAttendance extends Omit<Attendance, 'schedule' | 'student'> {
  schedule: PopulatedSchedule;
  student: Student;
}

// State interface
export interface CollegeState {
  classrooms: Classroom[];
  courses: Course[];
  schedules: Schedule[];
  attendances: Attendance[];
  isLoading: boolean;
  error: string | null;
}

// Helper types for form data
export type CourseFormData = Omit<Course, 'id'>;
export type ScheduleFormData = Omit<Schedule, 'id'>;
export type AttendanceFormData = Omit<Attendance, 'id' | 'attendance_date'>; 