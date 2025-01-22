import type { Teacher } from './users/teacherInterface';
import type { Student } from './users/studentInterface';

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
  description: string;
  teacher: number;
}

export interface Enrollment {
  id: number;
  student: number;
  course: number;
  enrollment_date: string;
  is_active: boolean;
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
  day_of_week: number;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  course: number;
  classroom: number;
}

export interface Attendance {
  id: number;
  schedule: number;
  student: number;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export interface PopulatedSchedule extends Omit<Schedule, 'course' | 'classroom'> {
  courseName: string;
  teacherName: string;
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

// If you need a populated version with teacher details
export interface PopulatedCourse extends Omit<Course, 'teacher'> {
  teacher: {
    id: number;
    first_name: string;
    last_name: string;
  } | null;
}
