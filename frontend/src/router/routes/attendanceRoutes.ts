import type { RouteRecordRaw } from 'vue-router';
import SessionsView from '@/views/attendance/SessionsView.vue';
import AttendanceView from '@/views/attendance/AttendanceView.vue';
import RFIDTestView from '@/views/rfid/RFIDTestView.vue';
import AttendanceRecordsView from '@/views/attendance/AttendanceRecordsView.vue';
import AttendanceStatsView from '@/views/attendance/AttendanceStatsView.vue';

export const attendanceRoutes: RouteRecordRaw[] = [
  { path: 'sessions', component: SessionsView },
  { path: 'attendance', component: AttendanceView },
  { path: 'attendance-records', component: AttendanceRecordsView },
  { path: 'attendance-stats', component: AttendanceStatsView },
  { path: 'rfid-test', component: RFIDTestView }
];
