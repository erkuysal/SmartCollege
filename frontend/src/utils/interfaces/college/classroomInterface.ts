export interface Classroom {
  id: number;
  name: string;
  capacity: number;
  building?: string;
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