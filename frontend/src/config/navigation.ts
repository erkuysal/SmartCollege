export interface NavItem {
  to: string;
  icon: string;
  text: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigationConfig: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { to: '/overview', icon: 'mdi-view-dashboard', text: 'Overview' },
      { to: '/students', icon: 'mdi-account-group', text: 'Students' },
      { to: '/lecturers', icon: 'mdi-account-tie', text: 'Lecturers' }
    ]
  },
  {
    title: 'ACADEMIC',
    items: [
      { to: '/courses', icon: 'mdi-book-education', text: 'Courses' },
      { to: '/academic-settings', icon: 'mdi-cog', text: 'Academic Settings' },
      { to: '/course-offerings', icon: 'mdi-book-open-page-variant', text: 'Course Offerings' },
      { to: '/schedules', icon: 'mdi-calendar-clock', text: 'Schedules' }
    ]
  },
  {
    title: 'ATTENDANCE',
    items: [
      { to: '/attendance', icon: 'mdi-chart-box', text: 'Attendance' },
      { to: '/sessions', icon: 'mdi-calendar-check', text: 'Sessions' },
      { to: '/attendance-records', icon: 'mdi-clipboard-list', text: 'Records' },
      { to: '/attendance-stats', icon: 'mdi-chart-bar', text: 'Statistics' }
    ]
  },
  {
    title: 'WALLET',
    items: [
      { to: '/wallet-management', icon: 'mdi-wallet', text: 'Wallet Management' }
    ]
  },
  {
    title: 'INFRASTRUCTURE',
    items: [
      { to: '/classrooms', icon: 'mdi-door-open', text: 'Classrooms' },
      { to: '/rfid-tags', icon: 'mdi-credit-card-wireless', text: 'RFID Tags' },
      { to: '/rfid-test', icon: 'mdi-credit-card-scan', text: 'RFID Test' }
    ]
  }
]; 