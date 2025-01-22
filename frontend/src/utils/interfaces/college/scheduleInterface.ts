import type { Course } from './courseInterface';
import type { Classroom } from './classroomInterface';

export interface Schedule {
  id: number;
  course: number;
  classroom: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
}

export interface PopulatedSchedule extends Omit<Schedule, 'course' | 'classroom'> {
  course: Course;
  classroom: Classroom;
  courseName: string;
  teacherName: string;
}
