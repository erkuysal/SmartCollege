// Central navigation configuration for the entire application
// This eliminates duplicate definitions across components

export interface NavItem {
  title: string;
  icon: string;
  to: { name: string };
  color?: string;
}

// Main navigation items visible in the sidebar and elsewhere
export const mainNavItems: NavItem[] = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: { name: 'dashboard' } },
  { title: 'Students', icon: 'mdi-account-school', to: { name: 'students' } },
  { title: 'Lecturers', icon: 'mdi-account-tie', to: { name: 'lecturers' } },
  { title: 'Classrooms', icon: 'mdi-door-open', to: { name: 'classrooms' } },
  { title: 'Enrollments', icon: 'mdi-file-document-edit', to: { name: 'enrollments' } },
  { title: 'Schedules', icon: 'mdi-calendar-clock', to: { name: 'schedules' } },
];

// Management items - for admin section
export const managementItems: NavItem[] = [
  { title: 'Courses', icon: 'mdi-book-multiple', to: { name: 'courses' } },
  { title: 'Faculties', icon: 'mdi-office-building', to: { name: 'faculties' } },
  { title: 'Departments', icon: 'mdi-domain', to: { name: 'departments' } },
  { title: 'Settings', icon: 'mdi-cog', to: { name: 'settings' } },
];

// Color mapping for statistics cards and other UI elements
export const itemColors: Record<string, string> = {
  'Dashboard': 'default',
  'Students': 'primary',
  'Lecturers': 'success',
  'Classrooms': 'info',
  'Faculties': 'warning',
  'Courses': 'error',
  'Enrollments': 'purple',
  'Schedules': 'indigo',
  'Departments': 'amber',
  'Users': 'secondary',
  'Settings': 'grey'
};

// Get color for a navigation item
export function getNavItemColor(title: string): string {
  return itemColors[title] || 'primary';
} 