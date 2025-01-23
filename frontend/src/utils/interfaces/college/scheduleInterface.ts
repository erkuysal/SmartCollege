import type { Course } from './courseInterface';
import type { Classroom } from './classroomInterface';

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
  course: number;
  classroom: number;
  day_of_week: DAY_OF_WEEK;
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
