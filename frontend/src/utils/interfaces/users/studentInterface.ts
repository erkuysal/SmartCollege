import type { BaseUser } from './baseUserInterface';
import type { Faculty } from '../college/facultyInterface';

export interface EnrolledCourse {
  id: number;
  course_id: number;
  course_name: string;
  course_code: string;
  credits: number;
  semester: string;
  status: 'active' | 'completed' | 'dropped';
  grade?: string;
  enrollment_date: string;
}

export interface StudentAttendance {
  id: number;
  course_id: number;
  course_name: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export interface StudentGrade {
  id: number;
  course_id: number;
  course_name: string;
  grade: string;
  semester: string;
  credits: number;
  grade_date: string;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  faculty: number | Faculty;
  faculty_name?: string;
  student_status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  semester: number;
  student_number: string;
  rfid_tag?: string;
  balance_points: number;
  enrolled_at: string;
  
  // Additional fields that might be populated from related endpoints
  courses?: EnrolledCourse[];
  attendance_records?: StudentAttendance[];
  grades?: StudentGrade[];
}