import type { Student } from '@/utils/interfaces/users/studentInterface';
import type { PopulatedSchedule } from './scheduleInterface';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
  id: number;
  schedule: number;
  student: number;
  attendance_date: string;
  status: AttendanceStatus;
}

export interface PopulatedAttendance extends Omit<Attendance, 'schedule' | 'student'> {
  schedule: PopulatedSchedule;
  student: Student;
}
