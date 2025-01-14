import type { Student , Teacher} from "@/utils/interfaces/studentInterface";

export interface Classroom {
  id: number;
  name: string;
  capacity: number;
  building?: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  teacher: Teacher;
}

export interface Schedule {
  id: number;
  lesson: Lesson;

  // Consider Multiple Classrooms per schedule (Change Many To Many field in django if change is decided to execute.)
  classroom: Classroom;

  day_of_week: number;

  start_time: string;
  end_time: string;

  start_date: string;
  end_date: string;
}


export interface Attendance {
  id: number;
  schedule: Schedule;
  student: Student;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

