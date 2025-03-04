import type { Student } from '../users/studentInterface';
import type { Course } from './courseInterface';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
  id: number;
  session: number; // AttendanceSession ID
  student: number; // Student ID
  attendance_status: AttendanceStatus;
  timestamp: string;
  notes?: string;
}

export interface AttendanceSession {
  id: number;
  course: number; // Course ID
  classroom: number; // Classroom ID
  lecturer: number; // Lecturer ID
  date: string;
  start_time: string;
  end_time: string;
  semester: string;
  academic_year: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: number;
  course: number; // Course ID
  date: string;
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  created_by: number; // Lecturer ID
  created_at: string;
  updated_at: string;
}

export interface PopulatedAttendance extends Omit<Attendance, 'session' | 'student'> {
  session: {
    id: number;
    course: {
      id: number;
      code: string;
      name: string;
    };
    date: string;
  };
  student: {
    id: number;
    first_name: string;
    last_name: string;
    student_id: string;
  };
}

export interface PopulatedAttendanceSession extends Omit<AttendanceSession, 'course' | 'classroom' | 'lecturer'> {
  course: {
    id: number;
    code: string;
    name: string;
  };
  classroom: {
    id: number;
    name: string;
    building: string;
  };
  lecturer: {
    id: number;
    first_name: string;
    last_name: string;
  };
  attendances?: PopulatedAttendance[];
  attendance_stats?: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
}

export interface PopulatedAttendanceRecord extends Omit<AttendanceRecord, 'course' | 'created_by'> {
  course: Course;
  created_by: {
    id: number;
    first_name: string;
    last_name: string;
  };
  attendances: PopulatedAttendance[];
}
