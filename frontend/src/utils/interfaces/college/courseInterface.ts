import type { Student } from '@/utils/interfaces/users/studentInterface';
import type { Teacher } from '@/utils/interfaces/users/teacherInterface';

export interface Course {
  id: number;
  title: string;
  description?: string;
  teacher?: number;  // Unpopulated: just the ID
}

export interface PopulatedCourse extends Omit<Course, 'teacher'> {
  teacher?: {        // Populated: full teacher object
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  students?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    student_number: string;
  }[];
}

export interface Enrollment {
  id: number;
  student: number;
  course: number;
  enrollment_date: string;
  is_active: boolean;
}

export interface PopulatedEnrollment extends Omit<Enrollment, 'student' | 'course'> {
  student: Student;
  course: Course;
}
