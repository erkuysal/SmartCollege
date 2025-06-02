<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NotificationComponent from './components/Notification.vue';
import StatsCard from './components/StatsCard.vue';
import SkeletonLoader from './components/SkeletonLoader.vue';
import { useStudentStore } from '../utils/stores/users/studentStore';
import { useFacultyStore } from '../utils/stores/college/facultyStore';
import { mainNavItems, getNavItemColor } from '../utils/navigation';
import type { Student } from '../utils/interfaces/users/studentInterface';
import '@/assets/styles/sharedStyles.css';

// Router setup
const router = useRouter();

// Stores
const studentStore = useStudentStore();
const facultyStore = useFacultyStore();

// State
const loading = ref(true);
const pageSubtitle = ref('Welcome to your college management system');
const showActivityChart = ref(true);
const chartPeriod = ref('weekly');
const animateItems = ref(false);

// Activity data for chart
const activityData = ref([
  { day: 'Mon', count: 15 },
  { day: 'Tue', count: 22 },
  { day: 'Wed', count: 18 },
  { day: 'Thu', count: 25 },
  { day: 'Fri', count: 30 },
  { day: 'Sat', count: 10 },
  { day: 'Sun', count: 5 },
]);

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
    status: 'pending'
  },
  {
    id: 2,
    title: 'Schedule faculty meeting',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    status: 'pending'
  },
  {
    id: 3,
    title: 'Update course materials',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    priority: 'low',
    status: 'overdue'
  }
]);

// Define notification interface
interface NotificationItem {
  id: number;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: string;
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

// Recent students (limited to 5)
const recentStudents = computed(() => {
  return studentStore.items.slice(0, 5);
});

// Computed properties for UI
const totalTasks = computed(() => tasks.value.length);
const pendingTasks = computed(() => tasks.value.filter(t => t.status === 'pending').length);
const overdueTasks = computed(() => tasks.value.filter(t => t.status === 'overdue').length);

// Load dashboard data
const loadDashboardData = async () => {
  loading.value = true;
  // Reset animation state
  animateItems.value = false;
  
  try {
    await Promise.all([
      studentStore.fetchStudents(),
      facultyStore.fetchFaculties()
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    loading.value = false;
    // Trigger animations after data loads
    setTimeout(() => {
      animateItems.value = true;
    }, 100);
  }
};

// Handle card click
const handleCardClick = (route: { name: string, params?: any }) => {
  router.push(route);
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

// Lifecycle hooks
onMounted(() => {
  loadDashboardData();
});
</script>

<template>
  <div class="content-container">
    <!-- Page Header -->
    <div class="d-flex flex-column flex-sm-row justify-space-between align-sm-center mb-6 page-header">
      <div>
        <h1 class="text-h4 mb-1 dashboard-title">Dashboard</h1>
        <p class="text-subtitle-1 text-medium-emphasis subtitle-text">{{ pageSubtitle }}</p>
      </div>
      <div class="d-flex mt-3 mt-sm-0">
        <v-btn 
          color="primary"
          prepend-icon="mdi-refresh" 
          variant="outlined"
          class="mr-2"
          :loading="loading"
          :disabled="loading"
          @click="loadDashboardData"
        >
          Refresh
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-calendar-today"
          variant="tonal"
        >
          Today
        </v-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <v-row>
      <template v-if="loading">
        <v-col 
          v-for="i in 4" 
          :key="i"
          cols="12" sm="6" md="3"
        >
          <SkeletonLoader type="stats-card" />
        </v-col>
      </template>
      <template v-else>
        <v-col 
          v-for="(stat, index) in dashboardStats" 
          :key="index"
          cols="12" sm="6" md="3"
        >
          <StatsCard
            :title="stat.title"
            :value="stat.value"
            :icon="stat.icon"
            :color="stat.color"
            :change="stat.change"
            :subtitle="stat.subtitle"
            :footer-text="stat.footerText"
            :dark="index === 0"
            class="animate-item"
            :class="{'animate-item--visible': animateItems}"
            :style="{ transitionDelay: `${index * 100}ms` }"
            @click="handleCardClick(stat.route)"
          />
        </v-col>
      </template>
    </v-row>

    <!-- Activity Section -->
    <v-row class="mt-6" v-if="showActivityChart">
      <v-col cols="12">
        <v-card class="border-radius-lg shadow-sm animate-item" :class="{'animate-item--visible': animateItems && !loading}" :style="{ transitionDelay: '400ms' }">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>System Activity</span>
            <div>
              <v-btn-toggle
                v-model="chartPeriod"
                color="primary"
                density="comfortable"
                rounded="pill"
              >
                <v-btn value="daily" size="small">Daily</v-btn>
                <v-btn value="weekly" size="small">Weekly</v-btn>
                <v-btn value="monthly" size="small">Monthly</v-btn>
              </v-btn-toggle>
            </div>
          </v-card-title>
          <v-card-text>
            <div v-if="loading">
              <SkeletonLoader type="custom">
                <div style="height: 250px;"></div>
              </SkeletonLoader>
            </div>
            <div v-else style="height: 250px;" class="pa-4">
              <!-- This would be replaced by an actual chart library like Chart.js or Echarts -->
              <div class="chart-placeholder">
                <div 
                  v-for="(item, index) in activityData" 
                  :key="index" 
                  class="chart-bar-container"
                >
                  <div 
                    class="chart-bar" 
                    :style="{ height: `${(item.count / 30) * 100}%` }"
                  ></div>
                  <div class="chart-label">{{ item.day }}</div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tasks & Notifications Row -->
    <v-row class="mt-6">
      <!-- Tasks -->
      <v-col cols="12" md="6">
        <v-card class="border-radius-lg shadow-sm task-card animate-item" :class="{'animate-item--visible': animateItems && !loading}" :style="{ transitionDelay: '500ms' }">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Tasks</span>
            <v-chip 
              color="primary" 
              size="small"
              variant="tonal"
            >{{ pendingTasks }} Pending</v-chip>
          </v-card-title>
          
          <v-card-text>
            <div v-if="loading">
              <SkeletonLoader type="list" :itemsCount="3" :linesCount="1" />
            </div>
            <div v-else-if="tasks.length === 0" class="text-center py-6">
              <v-icon icon="mdi-check-circle" color="success" size="64"></v-icon>
              <div class="text-h6 mt-2">All caught up!</div>
              <div class="text-body-2 text-medium-emphasis">You have no pending tasks.</div>
            </div>
            <div v-else>
              <v-list>
                <v-list-item
                  v-for="task in tasks"
                  :key="task.id"
                  :ripple="false"
                  class="task-item"
                  :class="{'task-item--overdue': task.status === 'overdue'}"
                >
                  <template v-slot:prepend>
                    <v-checkbox
                      v-model="task.status"
                      :value="'completed'"
                      hide-details
                      @update:model-value="completeTask(task.id)"
                      color="primary"
                    ></v-checkbox>
                  </template>
                  
                  <v-list-item-title class="text-body-2 font-weight-medium task-item__title">
                    {{ task.title }}
                  </v-list-item-title>
                  
                  <v-list-item-subtitle class="text-caption">
                    <v-chip
                      size="x-small"
                      :color="task.status === 'overdue' ? 'error' : (task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'info')"
                      variant="flat"
                      class="mr-2"
                    >
                      {{ task.status === 'overdue' ? 'Overdue' : task.priority.charAt(0).toUpperCase() + task.priority.slice(1) }}
                    </v-chip>
                    <span>Due {{ formatDueDate(task.dueDate) }}</span>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions class="pa-4">
            <v-btn 
              variant="tonal" 
              color="primary"
              block
              class="text-none"
            >
              View All Tasks
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      
      <!-- Notifications -->
      <v-col cols="12" md="6">
        <v-card class="border-radius-lg shadow-sm animate-item" :class="{'animate-item--visible': animateItems && !loading}" :style="{ transitionDelay: '600ms' }">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Notifications</span>
            <v-chip
              v-if="notifications.filter(n => !n.read).length > 0"
              color="primary"
              size="small"
              variant="tonal"
            >
              {{ notifications.filter(n => !n.read).length }} New
            </v-chip>
          </v-card-title>
          
          <v-card-text>
            <div v-if="loading">
              <SkeletonLoader type="list" :itemsCount="2" :linesCount="1" />
            </div>
            <div v-else-if="notifications.length === 0" class="text-center py-6">
              <v-icon icon="mdi-bell-off" color="grey" size="64"></v-icon>
              <div class="text-h6 mt-2">No Notifications</div>
              <div class="text-body-2 text-medium-emphasis">You're all caught up!</div>
            </div>
            <div v-else>
              <v-list lines="two">
                <v-list-item
                  v-for="notification in notifications"
                  :key="notification.id"
                  :ripple="true"
                  class="notification-item"
                  :class="{ 'notification-item--unread': !notification.read }"
                  @click="handleNotificationClick(notification)"
                >
                  <template v-slot:prepend>
                    <v-avatar :color="notification.type === 'warning' ? 'warning' : notification.type === 'error' ? 'error' : 'info'" size="36">
                      <v-icon
                        :icon="notification.type === 'warning' ? 'mdi-alert' : notification.type === 'error' ? 'mdi-alert-circle' : 'mdi-information'"
                        color="white"
                      ></v-icon>
                    </v-avatar>
                  </template>
                  
                  <v-list-item-title class="text-body-2 font-weight-medium">
                    {{ notification.title }}
                  </v-list-item-title>
                  
                  <v-list-item-subtitle class="text-caption">
                    {{ notification.message }}
                  </v-list-item-subtitle>
                  
                  <template v-slot:append>
                    <div class="text-caption text-grey">
                      {{ notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions class="pa-4">
            <v-btn 
              variant="tonal" 
              color="primary"
              block
              class="text-none"
            >
              View All Notifications
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Recent Students -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card class="border-radius-lg shadow-sm animate-item" :class="{'animate-item--visible': animateItems && !loading}" :style="{ transitionDelay: '700ms' }">
          <v-card-title>Recent Students</v-card-title>
          
          <v-card-text>
            <div v-if="loading">
              <SkeletonLoader type="table" :rowsCount="5" :columnsCount="4" />
            </div>
            <div v-else>
              <v-table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="student in recentStudents" :key="student.id" class="student-row">
                    <td>{{ student.id }}</td>
                    <td>{{ student.first_name }} {{ student.last_name }}</td>
                    <td>{{ student.email }}</td>
                    <td>
                      <v-chip
                        size="small"
                        :color="student.student_status === 'ACTIVE' ? 'success' : student.student_status === 'INACTIVE' ? 'warning' : 'error'"
                        variant="flat"
                      >
                        {{ (student.student_status || 'UNKNOWN').charAt(0) + (student.student_status || 'UNKNOWN').slice(1).toLowerCase() }}
                      </v-chip>
                    </td>
                    <td class="text-right">
                      <v-btn 
                        icon="mdi-eye" 
                        variant="text" 
                        density="comfortable" 
                        size="small"
                        @click="router.push({ name: 'studentDetails', params: { id: student.id }})"
                      ></v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions class="pa-4">
            <v-btn 
              variant="tonal" 
              color="primary"
              block
              class="text-none"
              @click="router.push({ name: 'students' })"
            >
              View All Students
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.dashboard-title {
  position: relative;
  display: inline-block;
}

.dashboard-title::after {
  content: "";
  position: absolute;
  width: 40px;
  height: 4px;
  background: linear-gradient(to right, var(--v-theme-primary), transparent);
  left: 0;
  bottom: -8px;
  border-radius: 2px;
}

.subtitle-text {
  opacity: 0.8;
}

.page-header {
  margin-bottom: 24px;
}

/* Animation for items */
.animate-item {
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), 
              opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-item--visible {
  transform: translateY(0);
  opacity: 1;
}

/* Task styles */
.task-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: background-color 0.2s;
}

.task-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.task-item--overdue {
  background-color: rgba(var(--v-theme-error), 0.05);
}

.task-item__title {
  transition: text-decoration 0.3s;
}

/* Notification styles */
.notification-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.notification-item--unread {
  background-color: rgba(var(--v-theme-info), 0.05);
}

.notification-item--unread .v-list-item-title {
  font-weight: 600;
}

/* Student row hover effect */
.student-row {
  transition: background-color 0.2s;
}

.student-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

/* Chart placeholder styles */
.chart-placeholder {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 100%;
}

.chart-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-bar {
  width: 60%;
  background: linear-gradient(to top, var(--v-theme-primary), #64b5f6);
  border-radius: 4px 4px 0 0;
  transition: height 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chart-label {
  margin-top: 8px;
  font-size: 12px;
  color: var(--v-theme-on-surface-variant);
}
</style>
