<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStudentStore } from '@/utils/stores/users/studentStore';
import { useFacultyStore } from '@/utils/stores/college/facultyStore';
import { mainNavItems, getNavItemColor } from '@/utils/navigation';
import type { Student, EnrolledCourse, StudentAttendance, StudentGrade } from '@/utils/interfaces/users/studentInterface';
import type { NavItem } from '@/utils/navigation';
import { useDataFetching } from '@/composables/useDataFetching';
import { DATE_FORMATS } from '@/config/constants';

// Components
import ContentLayout from '@/pages/components/layouts/ContentLayout.vue';
import BaseButton from '@/pages/components/base/BaseButton.vue';
import BaseImage from '@/pages/components/base/BaseImage.vue';
import ErrorBoundary from '@/pages/components/base/ErrorBoundary.vue';
import NotificationComponent from '@/pages/components/Notification.vue';

// Router setup
const router = useRouter();

// State
const pageSubtitle = ref('Welcome to your college management system');
const showActivityChart = ref(true);
const chartPeriod = ref('weekly');
const animateItems = ref(false);

// Use our data fetching composable
const studentStore = useStudentStore();
const facultyStore = useFacultyStore();

// Data for chart - using our data fetcher composable
const { 
  data: activityData, 
  loading: chartLoading, 
  error: chartError,
  fetch: fetchActivityData
} = useDataFetching<{ day: string, count: number }[]>(
  async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { day: 'Mon', count: 15 },
          { day: 'Tue', count: 22 },
          { day: 'Wed', count: 18 },
          { day: 'Thu', count: 25 },
          { day: 'Fri', count: 30 },
          { day: 'Sat', count: 10 },
          { day: 'Sun', count: 5 },
        ]);
      }, 500);
    });
  },
  true // fetch immediately
);

// Dashboard data - combining multiple data sources
const { 
  loading: dashboardLoading, 
  error: dashboardError,
  fetch: fetchDashboardData
} = useDataFetching(
  async () => {
    // Reset animation state
    animateItems.value = false;
    
    try {
      await Promise.all([
        studentStore.fetchStudents(),
        facultyStore.fetchFaculties()
      ]);
      
      // Trigger animations after data loads
      setTimeout(() => {
        animateItems.value = true;
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      throw error;
    }
  },
  true // fetch immediately
);

// Create dashboard stats with % change from our central navigation
const dashboardStats = computed(() => [
  { 
    title: 'Total Students', 
    value: studentStore.items.length, 
    icon: mainNavItems.find(item => item.title === 'Students')?.icon || 'mdi-account-school',
    color: getNavItemColor('Students'),
    route: { name: 'students' },
    change: 12, // Percentage change (could be from API in real app)
    subtitle: 'Active enrolled students',
    footerText: 'View all students'
  },
  { 
    title: 'Total Lecturers', 
    value: 42, // Placeholder until we have lecturerStore
    icon: mainNavItems.find(item => item.title === 'Lecturers')?.icon || 'mdi-account-tie',
    color: getNavItemColor('Lecturers'),
    route: { name: 'lecturers' },
    change: 5,
    subtitle: 'Faculty members',
    footerText: 'View all lecturers'
  },
  { 
    title: 'Total Faculties', 
    value: facultyStore.items.length || 8, 
    icon: mainNavItems.find(item => item.title === 'Faculties')?.icon || 'mdi-office-building',
    color: getNavItemColor('Faculties'),
    route: { name: 'faculties' },
    change: 0,
    subtitle: 'Academic departments',
    footerText: 'View all faculties'
  },
  { 
    title: 'Active Courses', 
    value: 84, // Placeholder until we have courseStore
    icon: 'mdi-book-open-variant',
    color: getNavItemColor('Courses'),
    route: { name: 'courses' },
    change: -3,
    subtitle: 'Currently running courses',
    footerText: 'View all courses'
  },
]);

// Tasks section data
const tasks = ref([
  {
    id: 1,
    title: 'Review student applications',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    priority: 'high',
    status: 'pending',
    completed: false
  },
  {
    id: 2,
    title: 'Schedule faculty meeting',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    status: 'pending',
    completed: false
  },
  {
    id: 3,
    title: 'Update course materials',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    priority: 'low',
    status: 'overdue',
    completed: false
  }
]);

// Define notification interface
interface NotificationItem {
  id: number;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

// Notifications
const notifications = ref<NotificationItem[]>([
  {
    id: 1,
    title: 'New Student Registration',
    message: 'A new student has registered and is pending approval',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    read: false,
    type: 'info'
  },
  {
    id: 2,
    title: 'System Update',
    message: 'The system will undergo maintenance on Sunday at 2:00 AM',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: true,
    type: 'warning'
  }
]);

// Add a custom interface to extend Student with profile_image
interface ExtendedStudent extends Student {
  profile_image?: string;
}

// Recent students (limited to 5)
const recentStudents = computed<ExtendedStudent[]>(() => {
  // Convert Student[] to ExtendedStudent[] with profile_image
  return studentStore.items.slice(0, 5).map(student => ({
    ...student,
    profile_image: `/assets/students/${student.id}.jpg` // Default path pattern
  }));
});

// Computed properties for UI
const totalTasks = computed(() => tasks.value.length);
const pendingTasks = computed(() => tasks.value.filter(t => t.status === 'pending').length);
const overdueTasks = computed(() => tasks.value.filter(t => t.status === 'overdue').length);

// Error handling
const handleError = (error: Error) => {
  console.error('Dashboard error:', error);
};

// Handle card click
const handleCardClick = (route: { name: string, params?: any }) => {
  if (route) {
    router.push(route);
  }
};

// Handle notification click
const handleNotificationClick = (notification: NotificationItem) => {
  notification.read = true;
  // Handle specific notification actions here
};

// Mark task as complete
const completeTask = (taskId: number) => {
  const taskIndex = tasks.value.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    tasks.value[taskIndex].status = 'completed';
    // Animation could be added here
    setTimeout(() => {
      tasks.value = tasks.value.filter(t => t.id !== taskId);
    }, 500);
  }
};

// Format date for display
const formatDueDate = (date: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);
  
  if (taskDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (taskDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  }
};
</script>

<template>
  <ContentLayout 
    title="Dashboard" 
    :subtitle="pageSubtitle"
    :loading="dashboardLoading"
    :hasHeaderActions="true"
  >
    <!-- Header Actions Slot -->
    <template #actions>
      <BaseButton
        variant="outlined"
        icon="mdi-refresh"
        :loading="dashboardLoading"
        :disabled="dashboardLoading"
        @click="fetchDashboardData"
        class="mr-2"
        label="Refresh"
      />
      <BaseButton
        variant="tonal"
        icon="mdi-calendar-today"
        label="Today"
      />
    </template>
    
    <!-- Error Handling -->
    <ErrorBoundary @error="handleError">
      <!-- Stats Cards -->
      <v-row>
        <v-col 
          v-for="(stat, index) in dashboardStats" 
          :key="stat.title"
          cols="12" sm="6" md="3"
          class="dashboard-stat-col"
        >
          <v-card
            :class="{ 'animate-float': animateItems }"
            :style="{ animationDelay: `${index * 100}ms` }"
            class="dashboard-stat-card"
            @click="handleCardClick(stat.route)"
          >
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon
                  :icon="stat.icon"
                  :color="stat.color"
                  size="large"
                  class="mr-2"
                />
                <span class="text-h6">{{ stat.title }}</span>
              </div>
              <div class="text-h4 font-weight-bold mb-1">{{ stat.value }}</div>
              <div class="text-caption text-medium-emphasis">{{ stat.subtitle }}</div>
              <div class="d-flex align-center mt-2">
                <v-icon
                  :icon="stat.change >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down'"
                  :color="stat.change >= 0 ? 'success' : 'error'"
                  size="small"
                  class="mr-1"
                />
                <span
                  :class="stat.change >= 0 ? 'text-success' : 'text-error'"
                  class="text-caption"
                >
                  {{ Math.abs(stat.change) }}%
                </span>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                :to="stat.route"
              >
                {{ stat.footerText }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Main Dashboard Content -->
      <v-row class="mt-6">
        <!-- Chart & Activity -->
        <v-col cols="12" lg="8">
          <v-card class="dashboard-card h-100">
            <v-card-title class="d-flex justify-space-between align-center">
              <div>
                <span>Activity Overview</span>
                <v-chip 
                  size="small" 
                  color="primary" 
                  variant="flat" 
                  class="ml-2"
                >
                  {{ chartPeriod }}
                </v-chip>
              </div>
              <div>
                <v-btn-toggle
                  v-model="chartPeriod"
                  color="primary"
                  rounded="pill"
                  mandatory
                  density="comfortable"
                  variant="text"
                >
                  <v-btn value="daily">
                    Day
                  </v-btn>
                  <v-btn value="weekly">
                    Week
                  </v-btn>
                  <v-btn value="monthly">
                    Month
                  </v-btn>
                </v-btn-toggle>
              </div>
            </v-card-title>
            
            <v-card-text>
              <v-sheet
                v-if="chartLoading"
                height="300"
                class="d-flex align-center justify-center"
              >
                <v-progress-circular indeterminate color="primary" />
              </v-sheet>
              
              <v-sheet v-else-if="chartError" height="300" class="error-container">
                <div class="text-center">
                  <v-icon icon="mdi-alert-circle" size="large" color="error" />
                  <div class="text-body-1 mt-2">Failed to load activity data</div>
                  <BaseButton
                    class="mt-4"
                    variant="text"
                    label="Try Again"
                    icon="mdi-refresh"
                    @click="fetchActivityData"
                  />
                </div>
              </v-sheet>
              
              <v-sheet v-else height="300" class="position-relative">
                <!-- Chart visualization would go here - using a placeholder for now -->
                <div class="chart-container" aria-label="Activity chart showing data for the past week">
                  <div 
                    v-for="(item, i) in activityData" 
                    :key="i"
                    class="chart-bar"
                    :style="{ 
                      height: `${(item.count / 30) * 100}%`,
                      animationDelay: `${i * 100}ms`
                    }"
                    :aria-label="`${item.day}: ${item.count} activities`"
                  >
                    <div class="chart-value">{{ item.count }}</div>
                  </div>
                </div>
                <div class="chart-labels">
                  <div 
                    v-for="(item, i) in activityData" 
                    :key="i"
                    class="chart-label"
                  >
                    {{ item.day }}
                  </div>
                </div>
              </v-sheet>
            </v-card-text>
          </v-card>
        </v-col>
        
        <!-- Tasks -->
        <v-col cols="12" md="6" lg="4">
          <v-card class="dashboard-card h-100">
            <v-card-title class="d-flex justify-space-between align-center">
              <div>
                <span>Tasks</span>
                <v-chip size="small" color="info" class="ml-2">{{ totalTasks }}</v-chip>
              </div>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                prepend-icon="mdi-plus"
                to="/tasks/new"
              >
                Add
              </v-btn>
            </v-card-title>
            
            <v-card-text>
              <div 
                v-if="tasks.length === 0" 
                class="text-center py-8 text-grey"
              >
                <v-icon icon="mdi-check-all" size="48" class="mb-2" />
                <div>No pending tasks</div>
              </div>
              
              <v-list v-else lines="two" class="task-list">
                <v-list-item
                  v-for="task in tasks"
                  :key="task.id"
                  :ripple="false"
                  class="task-item"
                  :class="{
                    'task-high': task.priority === 'high',
                    'task-medium': task.priority === 'medium',
                    'task-low': task.priority === 'low',
                    'task-overdue': task.status === 'overdue'
                  }"
                >
                  <template #prepend>
                    <v-checkbox
                      v-model="task.completed"
                      hide-details
                      @click.stop="completeTask(task.id)"
                      color="primary"
                      :aria-label="`Mark task ${task.title} as complete`"
                    ></v-checkbox>
                  </template>
                  
                  <v-list-item-title>{{ task.title }}</v-list-item-title>
                  
                  <v-list-item-subtitle class="d-flex align-center">
                    <v-icon
                      size="small"
                      :icon="task.status === 'overdue' ? 'mdi-alert-circle' : 'mdi-calendar'"
                      :color="task.status === 'overdue' ? 'error' : ''"
                      class="mr-1"
                    ></v-icon>
                    <span :class="{ 'text-error': task.status === 'overdue' }">
                      {{ formatDueDate(task.dueDate) }}
                    </span>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
              
              <div class="d-flex justify-end mt-4">
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  to="/tasks"
                >
                  View all tasks
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <!-- Notifications & Recent Students -->
        <v-col cols="12" md="6" lg="4" class="mt-md-6 mt-lg-0">
          <v-card class="dashboard-card mb-6">
            <v-card-title class="d-flex justify-space-between align-center">
              <div>
                <span>Notifications</span>
                <v-badge
                  :content="notifications.filter(n => !n.read).length"
                  :model-value="notifications.filter(n => !n.read).length > 0"
                  color="error"
                  class="ml-2"
                ></v-badge>
              </div>
              <v-btn
                size="small"
                variant="text"
                icon="mdi-bell-outline"
                to="/notifications"
              ></v-btn>
            </v-card-title>
            
            <v-card-text class="px-0">
              <div 
                v-if="notifications.length === 0" 
                class="text-center py-6 text-grey"
              >
                <v-icon icon="mdi-bell-off" size="48" class="mb-2" />
                <div>No notifications</div>
              </div>
              
              <NotificationComponent
                v-for="notification in notifications"
                :key="notification.id"
                :title="notification.title"
                :message="notification.message"
                :timestamp="notification.timestamp"
                :read="notification.read"
                :type="notification.type"
                @click="handleNotificationClick(notification)"
              />
            </v-card-text>
          </v-card>
          
          <v-card class="dashboard-card">
            <v-card-title class="d-flex justify-space-between align-center">
              <span>Recent Students</span>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                to="/students"
              >
                View all
              </v-btn>
            </v-card-title>
            
            <v-card-text class="px-0">
              <div 
                v-if="dashboardLoading" 
                class="d-flex justify-center py-4"
              >
                <v-progress-circular indeterminate color="primary" />
              </div>
              
              <div 
                v-else-if="recentStudents.length === 0" 
                class="text-center py-6 text-grey"
              >
                <v-icon icon="mdi-account-school" size="48" class="mb-2" />
                <div>No students found</div>
              </div>
              
              <v-list v-else lines="two">
                <v-list-item
                  v-for="student in recentStudents"
                  :key="student.id"
                  :to="`/students/${student.id}`"
                  class="student-item"
                >
                  <template #prepend>
                    <BaseImage
                      :src="student.profile_image || '/default-avatar.png'"
                      alt=""
                      decorative
                      width="40"
                      height="40"
                      radius="circle"
                    />
                  </template>
                  
                  <v-list-item-title>{{ student.first_name }} {{ student.last_name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ student.email }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
        
        <!-- Quick Actions -->
        <v-col cols="12" lg="8" class="mt-6">
          <v-card class="dashboard-card">
            <v-card-title>Quick Actions</v-card-title>
            
            <v-card-text>
              <v-row>
                <v-col v-for="(item, i) in mainNavItems.slice(0, 8)" :key="i" cols="6" sm="3">
                  <v-hover v-slot="{ isHovering, props }">
                    <v-card
                      v-bind="props"
                      :to="item.to"
                      :elevation="isHovering ? 4 : 1"
                      class="quick-action-card text-center pa-4"
                      :class="{'animate-float': isHovering}"
                    >
                      <v-icon
                        :icon="item.icon"
                        :color="getNavItemColor(item.title)"
                        size="36"
                        class="mb-2"
                      ></v-icon>
                      <div class="text-subtitle-1">{{ item.title }}</div>
                    </v-card>
                  </v-hover>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </ErrorBoundary>
  </ContentLayout>
</template>

<style scoped>
.dashboard-card {
  border-radius: 12px;
  transition: box-shadow 0.3s ease;
}

.task-item {
  border-left: 3px solid transparent;
  transition: background-color 0.2s ease;
}

.task-high {
  border-left-color: #f44336;
}

.task-medium {
  border-left-color: #ff9800;
}

.task-low {
  border-left-color: #4caf50;
}

.task-overdue {
  background-color: rgba(244, 67, 54, 0.05);
}

.student-item {
  transition: background-color 0.2s ease;
}

.quick-action-card {
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
}

.chart-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 250px;
  padding: 0 16px;
}

.chart-bar {
  background-color: #1976d2;
  width: 30px;
  border-radius: 4px 4px 0 0;
  position: relative;
  animation: grow 1s ease-out forwards;
  transform-origin: bottom;
}

.chart-value {
  position: absolute;
  top: -24px;
  width: 100%;
  text-align: center;
  font-size: 12px;
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  padding: 16px;
}

.chart-label {
  width: 30px;
  text-align: center;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes grow {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@media (prefers-reduced-motion: reduce) {
  .chart-bar, .quick-action-card, .animate-float {
    animation: none;
    transition: none;
  }
}

:global(.reduced-motion) .chart-bar,
:global(.reduced-motion) .quick-action-card,
:global(.reduced-motion) .animate-float {
  animation: none;
  transition: none;
}
</style> 