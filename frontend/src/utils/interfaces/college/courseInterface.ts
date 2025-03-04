import type { Lecturer } from '../users/lecturerInterface';
import type { Student } from '../users/studentInterface';

export interface Course {
  id: number;
  code: string;
  name: string;
  description: string;
  credits: number;
  department: number; // Department ID
  is_active: boolean;
  lecturer?: number; // Lecturer ID (used in place of teacher in the component)
  prerequisites?: number[]; // Array of course IDs
  created_at: string;
  updated_at: string;
}

export interface CourseSchedule {
  id: number;
  course: number; // Course ID
  day_of_week: number; // 1-7 (Monday-Sunday)
  start_time: string;
  end_time: string;
  classroom: number; // Classroom ID
  semester: string;
  is_active: boolean;
}

export interface CourseEnrollment {
  id: number;
  course: number; // Course ID
  student: number; // Student ID
  enrollment_date: string;
  status: 'active' | 'completed' | 'dropped';
  grade?: string;
  semester: string;
}

export interface PopulatedCourse extends Omit<Course, 'department' | 'prerequisites' | 'lecturer'> {
  department: {
    id: number;
    name: string;
    code: string;
  };
  prerequisites?: {
    id: number;
    code: string;
    name: string;
  }[];
  lecturer?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  lecturers?: Lecturer[];
  students?: Student[];
  schedules?: CourseSchedule[];
}

export interface PopulatedCourseEnrollment extends Omit<CourseEnrollment, 'course' | 'student'> {
  course: Course;
  student: Student;
}
