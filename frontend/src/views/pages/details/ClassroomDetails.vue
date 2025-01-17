<template>
  <v-container fluid>
    <v-card elevation="2" class="schedule-card">
      <v-toolbar flat color="primary" dark dense>
        <v-toolbar-title class="text-subtitle-1">
          <v-icon size="small" class="me-2">mdi-calendar-clock</v-icon>
          Weekly Schedule
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          size="small"
          :color="isDragMode ? 'warning' : ''"
          class="me-2"
          @click="toggleDragMode"
          :title="isDragMode ? 'Disable Edit Mode' : 'Enable Edit Mode'"
        >
          <v-icon>{{ isDragMode ? 'mdi-drag' : 'mdi-drag-variant-off' }}</v-icon>
        </v-btn>
        <v-btn icon size="small" @click="refreshSchedule">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-toolbar>

      <div class="schedule-wrapper">
        <div class="schedule-grid">
          <!-- Time Column -->
          <div class="time-column">
            <div class="header-cell time-header"></div>
            <div v-for="time in timeSlots" :key="time" class="time-cell">
              {{ shouldShowFullTime(time) ? formatTime(time) : '' }}
            </div>
          </div>

          <!-- Day Columns -->
          <div 
            v-for="day in days" 
            :key="day" 
            class="day-column"
            :class="{ 'weekend': isWeekend(day) }"
            @dragover.prevent
            @drop="handleDrop($event, day)"
          >
            <div class="header-cell">{{ formatDay(day) }}</div>
            <template v-for="time in timeSlots" :key="`${day}-${time}`">
              <div 
                class="schedule-cell"
                :class="{ 
                  'weekend-cell': isWeekend(day),
                  'half-hour': isHalfHour(time),
                  'odd-hour': isOddHour(time),
                  'empty-cell': !getClassSession(day, time)
                }"
                @click="!isDragMode && handleCellClick(day, time)"
                @dragover.prevent
                @drop="handleDrop($event, day, time)"
              >
                <template v-if="getClassSession(day, time)">
                  <div 
                    class="class-event"
                    :draggable="isDragMode"
                    :class="{ 
                      'draggable': isDragMode,
                      'dragging': isDragging(getClassSession(day, time))
                    }"
                    @dragstart="handleDragStart($event, getClassSession(day, time))"
                    @dragend="handleDragEnd"
                    @click.stop="handleEventClick(getClassSession(day, time))"
                  >
                    <div class="event-content">
                      <span class="course-name">{{ getClassSession(day, time)?.courseName }}</span>
                      <span class="teacher-name">{{ getClassSession(day, time)?.teacher }}</span>
                    </div>
                  </div>
                </template>
                <template v-else-if="!isDragMode">
                  <div class="empty-slot">
                    <v-icon size="small" color="grey-lighten-1">mdi-plus</v-icon>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Add/Edit Class Dialog -->
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title class="text-subtitle-1 pa-4">
          {{ editingSession ? 'Edit Class Session' : 'Add New Class' }}
          <div class="text-caption">
            {{ selectedDay }} at {{ formatTimeForDisplay(selectedTime) }}
          </div>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="form" v-model="isFormValid">
            <v-select
              v-model="selectedCourse"
              :items="courses"
              label="Course"
              item-title="name"
              item-value="id"
              density="comfortable"
              variant="outlined"
              class="mb-2"
              required
            ></v-select>
            <v-select
              v-model="selectedTeacher"
              :items="teachers"
              label="Teacher"
              item-title="name"
              item-value="id"
              density="comfortable"
              variant="outlined"
              required
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveClassSession">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCollegeStore } from '@/utils/stores/collegeStore';
import { useTeacherStore } from '@/utils/stores/teacherStore';
import type { ClassSession } from '@/utils/interfaces/collegeInterface';

const route = useRoute();
const classroomId = Number(route.params.id);
const collegeStore = useCollegeStore();
const teacherStore = useTeacherStore();

// Initialize data
onMounted(async () => {
  await Promise.all([
    collegeStore.fetchCourses(),
    teacherStore.fetchTeachers(),
    fetchClassSessions()
  ]);
});

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Modified to generate 30-minute intervals
function generateTimeSlots() {
  const slots = [];
  for (let hour = 8; hour <= 17; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    slots.push(`${hourStr}:00`);
    slots.push(`${hourStr}:30`);
  }
  return slots;
}

const timeSlots = generateTimeSlots();

// Computed properties for courses and teachers
const courses = computed(() => collegeStore.courses);
const teachers = computed(() => teacherStore.teachers);

// Only show full time for hour marks
function shouldShowFullTime(time: string): boolean {
  return time.endsWith(':00');
}

function isHalfHour(time: string): boolean {
  return time.endsWith(':30');
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  return `${hours}${minutes === '00' ? ':00' : ''}`;
}

function formatTimeForDisplay(time: string): string {
  const [hours, minutes] = time.split(':');
  const period = Number(hours) >= 12 ? 'PM' : 'AM';
  const displayHours = Number(hours) > 12 ? Number(hours) - 12 : Number(hours);
  return `${displayHours}:${minutes} ${period}`;
}

// UI state
const isDragMode = ref(false);
const draggedEvent = ref<ClassSession | null>(null);
const dialog = ref(false);
const selectedDay = ref('');
const selectedTime = ref('');
const selectedCourse = ref<number | null>(null);
const selectedTeacher = ref<number | null>(null);
const editingSession = ref<ClassSession | null>(null);
const isFormValid = ref(false);
const classSessions = ref<ClassSession[]>([]);

function formatDay(day: string): string {
  return day.slice(0, 3);
}

function isWeekend(day: string): boolean {
  return day === 'Saturday' || day === 'Sunday';
}

function getClassSession(day: string, time: string) {
  return classSessions.value.find(
    session => session.day === day && session.time === time
  );
}

function handleCellClick(day: string, time: string) {
  if (getClassSession(day, time)) return;
  selectedDay.value = day;
  selectedTime.value = time;
  editingSession.value = null;
  selectedCourse.value = null;
  selectedTeacher.value = null;
  dialog.value = true;
}

function handleEventClick(session: ClassSession) {
  if (isDragMode.value) return;
  editingSession.value = session;
  selectedDay.value = session.day;
  selectedTime.value = session.time;
  selectedCourse.value = session.courseId;
  selectedTeacher.value = session.teacherId;
  dialog.value = true;
}

function toggleDragMode() {
  isDragMode.value = !isDragMode.value;
  draggedEvent.value = null;
}

function isDragging(session: ClassSession | null): boolean {
  return !!(draggedEvent.value && draggedEvent.value.id === session?.id);
}

async function saveClassSession() {
  if (!isFormValid.value || !selectedCourse.value || !selectedTeacher.value) return;

  const course = collegeStore.getCourseById(selectedCourse.value);
  const teacher = teacherStore.teacherById(selectedTeacher.value);

  if (!course || !teacher) return;

  const newSession: ClassSession = {
    id: crypto.randomUUID(),
    day: selectedDay.value,
    time: selectedTime.value,
    courseId: selectedCourse.value,
    courseName: course.title,
    teacherId: selectedTeacher.value,
    teacher: `${teacher.first_name} ${teacher.last_name}`,
  };

  if (editingSession.value) {
    // Update existing session
    const index = classSessions.value.findIndex(s => s.id === editingSession.value?.id);
    if (index !== -1) {
      classSessions.value[index] = newSession;
    }
  } else {
    // Add new session
    classSessions.value.push(newSession);
  }

  dialog.value = false;
}

async function refreshSchedule() {
  await Promise.all([
    collegeStore.fetchCourses(),
    teacherStore.fetchTeachers(),
    fetchClassSessions()
  ]);
}

function isOddHour(time: string): boolean {
  const hour = parseInt(time.split(':')[0]);
  return hour % 2 !== 0;
}

function handleDragStart(event: DragEvent, classSession: ClassSession) {
  if (!isDragMode.value) {
    event.preventDefault();
    return;
  }
  
  if (event.dataTransfer) {
    draggedEvent.value = classSession;
    event.dataTransfer.effectAllowed = 'move';
  }
}

function handleDrop(event: DragEvent, day: string, time?: string) {
  event.preventDefault();
  if (!isDragMode.value) return;
  
  if (draggedEvent.value && time) {
    const updatedSession = {
      ...draggedEvent.value,
      day,
      time
    };
    // Remove from old position
    const index = classSessions.value.findIndex(session => session.id === draggedEvent.value?.id);
    if (index !== -1) {
      classSessions.value.splice(index, 1);
    }
    // Add to new position
    classSessions.value.push(updatedSession);
    draggedEvent.value = null;
  }
}

function handleDragEnd() {
  draggedEvent.value = null;
}

const fetchClassSessions = async () => {
  try {
    // Assuming you have a method in collegeStore to fetch sessions for a specific classroom
    const sessions = await collegeStore.getSchedulesByClassroom(classroomId);
    classSessions.value = sessions.map(schedule => ({
      id: schedule.id.toString(),
      day: days[schedule.day_of_week],
      time: schedule.start_time,
      courseId: schedule.course,
      courseName: collegeStore.getCourseName(schedule.course),
      teacherId: collegeStore.getCourseById(schedule.course)?.teacher || 0,
      teacher: teacherStore.teacherById(collegeStore.getCourseById(schedule.course)?.teacher || 0)
        ? `${teacherStore.teacherById(collegeStore.getCourseById(schedule.course)?.teacher || 0)?.first_name} ${teacherStore.teacherById(collegeStore.getCourseById(schedule.course)?.teacher || 0)?.last_name}`
        : 'Unknown Teacher',
    }));
  } catch (error) {
    console.error('Error fetching class sessions:', error);
  }
};
</script>

<style scoped lang="scss">
.schedule-card {
  border-radius: 8px;
  overflow: hidden;
}

.schedule-wrapper {
  overflow-x: auto;
  padding: 8px;
}

.schedule-grid {
  display: flex;
  width: 100%;
}

.time-column, .day-column {
  flex: 1;
  min-width: 120px;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.time-column {
  flex: 0 0 60px;
  min-width: 60px;
}

.day-column:last-child {
  border-right: none;
}

.header-cell {
  padding: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  text-align: center;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-header {
  background-color: transparent;
}

.time-cell, .schedule-cell {
  height: 25px; /* Reduced height for 30-minute intervals */
  padding: 2px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-cell {
  color: rgba(0, 0, 0, 0.6);
}

.schedule-cell {
  cursor: pointer;
  transition: all 0.2s ease;
}

.schedule-cell:hover {
  background-color: rgba(0, 0, 0, 0.06) !important;
  z-index: 2;
}

.has-class {
  background-color: var(--v-primary-lighten5, #E3F2FD) !important;
  position: relative;
  z-index: 1;
}

.weekend-cell {
  background-color: rgba(0, 0, 0, 0.02);
}

.weekend .header-cell {
  background-color: rgba(0, 0, 0, 0.05);
}

.class-info {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2px;
  background-color: inherit;
}

.course-name {
  font-weight: 500;
  font-size: 0.75rem;
  color: var(--v-primary-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.teacher-name {
  font-size: 0.7rem;
  color: rgba(0, 0, 0, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.text-caption {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 4px;
}

.half-hour {
  border-bottom: 1px dashed rgba(0, 0, 0, 0.12); /* Dashed border for 30-minute marks */
}

.odd-hour {
  background-color: rgba(0, 0, 0, 0.02); /* Light gray for odd hours */
}

.weekend-cell.odd-hour {
  background-color: rgba(0, 0, 0, 0.04); /* Slightly darker for weekend odd hours */
}

.class-event {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  min-height: 46px;
  background-color: var(--v-primary-lighten5, #E3F2FD);
  border-left: 4px solid var(--v-primary-base);
  border-radius: 4px;
  z-index: 1;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.class-event.draggable {
  cursor: grab;
}

.class-event.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.class-event:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  z-index: 2;
}

.class-event.draggable::after {
  content: '';
  position: absolute;
  top: 4px;
  right: 4px;
  width: 12px;
  height: 12px;
  background-image: radial-gradient(circle, rgba(0,0,0,0.3) 1px, transparent 2px);
  background-size: 4px 4px;
  background-repeat: repeat;
  opacity: 0.5;
  border-radius: 2px;
}

.event-content {
  padding: 4px 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.course-name {
  font-weight: 500;
  font-size: 0.75rem;
  color: var(--v-primary-darken1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.teacher-name {
  font-size: 0.7rem;
  color: rgba(0, 0, 0, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.schedule-cell {
  position: relative;
  height: 25px;
  padding: 2px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.odd-hour {
  background-color: rgba(0, 0, 0, 0.02);
}

.weekend-cell.odd-hour {
  background-color: rgba(0, 0, 0, 0.04);
}

.half-hour {
  border-bottom: 1px dashed rgba(0, 0, 0, 0.12);
}

.schedule-cell:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.day-column {
  position: relative;
  flex: 1;
  min-width: 120px;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.time-column {
  position: sticky;
  left: 0;
  background: white;
  z-index: 3;
}

.header-cell {
  position: sticky;
  top: 0;
  z-index: 2;
  background: inherit;
}

.empty-cell {
  cursor: pointer;
}

.empty-slot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.empty-cell:hover .empty-slot {
  opacity: 1;
}

.empty-cell:hover {
  background-color: var(--v-primary-lighten-5);
}
</style>