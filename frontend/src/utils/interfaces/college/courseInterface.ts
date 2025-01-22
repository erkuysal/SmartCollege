import type { Student } from '@/utils/interfaces/users/studentInterface';
import type { Teacher } from '@/utils/interfaces/users/teacherInterface';

export interface Course {
  id: number;
  title: string;
  description?: string;
  teacher?: number;
}

export interface PopulatedCourse extends Omit<Course, 'teacher'> {
  teacher?: Teacher;
  students?: Student[];
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
