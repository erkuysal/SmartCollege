<template>
  <v-container fluid>
    <v-card elevation="2" class="schedule-card">
      <v-toolbar flat color="primary" dark dense>
        <v-toolbar-title class="text-subtitle-1">
          <v-icon size="small" class="me-2">mdi-calendar-clock</v-icon>
          Weekly Schedule
        </v-toolbar-title>
        <v-spacer></v-spacer>

        <!-- Add edit mode toggle -->
        <v-btn
          icon
          size="small"
          :color="isEditMode ? 'warning' : ''"
          class="me-2"
          @click="toggleEditMode"
          :title="isEditMode ? 'Disable Edit Mode' : 'Enable Edit Mode'"
        >
          <v-icon>{{ isEditMode ? 'mdi-lock-open' : 'mdi-lock' }}</v-icon>
        </v-btn>

        <v-btn
          icon
          size="small"
          @click="() => scheduleStore.fetchSchedules({ classroom: classroomId })"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-toolbar>

      <v-progress-linear
        v-if="scheduleStore.loading"
        indeterminate
      ></v-progress-linear>

      <v-alert
        v-if="scheduleStore.error"
        type="error"
        class="ma-2"
      >
        {{ scheduleStore.error }}
      </v-alert>

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
            v-for="day in weekDays"
            :key="day"
            class="day-column"
            :class="{ 'weekend': day > 4 }"
          >
            <div class="header-cell">{{ getDayName(day) }}</div>
            <template v-for="time in timeSlots" :key="`${day}-${time}`">
              <div
                class="schedule-cell"
                :class="{
                  'weekend-cell': day > 4,
                  'has-class': getScheduleForTimeSlot(day, time),
                  'dragging': isDragging && draggedSchedule?.id === getScheduleForTimeSlot(day, time)?.id,
                  'edit-mode': isEditMode
                }"
                @click="!isEditMode && handleCellClick(day, time)"
                @dragover="handleDragOver(day, time, $event)"
                @drop="handleDrop(day, time, $event)"
              >
                <template v-if="getScheduleForTimeSlot(day, time)">
                  <div
                    class="class-event"
                    :draggable="isEditMode"
                    :class="{ 'edit-mode': isEditMode }"
                    @dragstart="handleDragStart(getScheduleForTimeSlot(day, time)!, day, time, $event)"
                    @dragend="handleDragEnd($event)"
                  >
                    <div class="event-content">
                      {{ getCourseDetails(getScheduleForTimeSlot(day, time)?.course) }}
                      <div v-if="isEditMode" class="resize-handle top"></div>
                      <div v-if="isEditMode" class="resize-handle bottom"></div>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="add-icon" v-if="!isEditMode">
                    <v-icon size="small">mdi-plus</v-icon>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Schedule Dialog -->
    <v-dialog v-model="dialogVisible" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editingSchedule ? 'Edit Schedule' : 'Add Schedule' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="isValid">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="formData.course"
                    :items="courseStore.items"
                    item-title="name"
                    item-value="id"
                    label="Course"
                    required
                    :rules="[v => !!v || 'Course is required']"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        {{ item.raw.name }} - {{ getCourseDetails(item.raw.id) }}
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.start_time"
                    label="Start Time"
                    type="time"
                    required
                    :rules="[v => !!v || 'Start time is required']"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.end_time"
                    label="End Time"
                    type="time"
                    required
                    :rules="[v => !!v || 'End time is required']"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.start_date"
                    label="Start Date"
                    type="date"
                    required
                    :rules="[v => !!v || 'Start date is required']"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.end_date"
                    label="End Date"
                    type="date"
                    required
                    :rules="[v => !!v || 'End date is required']"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            v-if="editingSchedule"
            color="error"
            variant="text"
            @click="deleteSchedule(editingSchedule)"
          >
            Delete
          </v-btn>
          <v-btn color="error" variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="onScheduleSaved"
            :loading="scheduleStore.loading"
            :disabled="!isValid"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useClassroomStore } from '@/utils/stores/college/classroomStore';
import { useScheduleStore } from '@/utils/stores/college/scheduleStore';
import { useCourseStore } from '@/utils/stores/college/courseStore';
import { useLecturerStore } from '@/utils/stores/users/lecturerStore';
import type { Schedule, PopulatedSchedule } from '@/utils/interfaces/college/scheduleInterface';
import EditSchedule from '@/views/pages/actions/EditSchedule.vue';
import { useStorage } from '@vueuse/core';
import { DAY_OF_WEEK } from '@/utils/interfaces/college/scheduleInterface';

const route = useRoute();
const classroomId = Number(route.params.id);

// Store instances
const classroomStore = useClassroomStore();
const scheduleStore = useScheduleStore();
const courseStore = useCourseStore();
const lecturerStore = useLecturerStore();

// Constants
const weekDays = [0, 1, 2, 3, 4, 5, 6]; // Monday to Sunday

// State
const dialogVisible = ref(false);
const editingSchedule = ref<PopulatedSchedule | null>(null);
const isValid = ref(false);
const form = ref<any>(null);
const isEditMode = useStorage('classroom-schedule-edit-mode', false);
const isDragging = ref(false);
const dragStartTime = ref('');
const dragStartDay = ref(0);
const draggedSchedule = ref<PopulatedSchedule | null>(null);

// Form data
const formData = ref({
  course: 0,
  classroom: classroomId,
  day_of_week: 0,
  start_time: '',
  end_time: '',
  start_date: '',
  end_date: ''
});

// Time slots generation (8:00 AM to 6:00 PM in 30-minute intervals)
const timeSlots = computed(() => {
  const slots = [];
  for (let hour = 8; hour <= 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30:00`);
  }
  return slots;
});

// Helper functions
function getDayName(day: number): string {
  const days = {
    0: 'Monday',
    1: 'Tuesday',
    2: 'Wednesday',
    3: 'Thursday',
    4: 'Friday',
    5: 'Saturday',
    6: 'Sunday'
  };
  return days[day as keyof typeof days] || 'Unknown';
}

function formatTime(time: string): string {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function shouldShowFullTime(time: string): boolean {
  return time.endsWith(':00:00');
}

function getScheduleForTimeSlot(day: number, time: string): PopulatedSchedule | null {
  // Find a schedule that matches the criteria
  const schedule = scheduleStore.schedules.find(s => 
    s.day_of_week === day &&
    s.start_time <= time &&
    s.end_time > time &&
    s.classroom.id === classroomId
  );
  
  return schedule || null;
}

function getCourseDetails(courseId: number | { id: number } | null | undefined): string {
  if (!courseId) return 'No Course';
  
  // Extract the ID whether courseId is a number or an object
  const id = typeof courseId === 'number' ? courseId : courseId.id;
  
  // Find the course in the courses array
  const course = courseStore.items.find(c => c.id === id);
  if (!course) return 'Unknown Course';
  
  // Find the lecturer in the lecturers array
  const lecturer = lecturerStore.items.find(l => l.id === course.lecturer);
  
  return `${course.name} - ${lecturer ? `${lecturer.first_name} ${lecturer.last_name}` : 'No Teacher'}`;
}

// Event handlers
function handleCellClick(day: number, time: string) {
  const existingSchedule = getScheduleForTimeSlot(day, time);
  editingSchedule.value = existingSchedule;
  dialogVisible.value = true;
}

function toggleEditMode() {
  isEditMode.value = !isEditMode.value;
}

async function refreshSchedule() {
  try {
    await scheduleStore.fetchSchedules({ classroom: classroomId });
  } catch (error) {
    console.error('Error refreshing schedules:', error);
  }
}

function onScheduleSaved() {
  refreshSchedule();
}

// Drag and drop handlers
function handleDragStart(schedule: PopulatedSchedule, day: number, time: string, e: DragEvent) {
  if (!isEditMode.value || !(e.target instanceof HTMLElement)) return;

  isDragging.value = true;
  dragStartTime.value = time;
  dragStartDay.value = day;
  draggedSchedule.value = schedule;
  e.dataTransfer?.setData('text/plain', '');
}

function handleDragOver(day: number, time: string, e: DragEvent) {
  if (!isEditMode.value || !isDragging.value || !draggedSchedule.value) return;

  e.preventDefault();
  e.dataTransfer!.dropEffect = 'move';
}

async function handleDrop(day: number, time: string, e: DragEvent) {
  e.preventDefault();
  if (!isEditMode.value || !isDragging.value || !draggedSchedule.value) return;

  try {
    const timeDiff = calculateTimeDifference(
      draggedSchedule.value.start_time,
      draggedSchedule.value.end_time
    );

    const updatedSchedule: Partial<Schedule> = {
      id: draggedSchedule.value.id,
      day_of_week: day,
      start_time: time,
      end_time: calculateNewTime(time, timeDiff),
      course: typeof draggedSchedule.value.course === 'number' ? 
        draggedSchedule.value.course : 
        draggedSchedule.value.course.id,
      classroom: typeof draggedSchedule.value.classroom === 'number' ? 
        draggedSchedule.value.classroom : 
        draggedSchedule.value.classroom.id,
      lecturer: typeof draggedSchedule.value.lecturer === 'number' ? 
        draggedSchedule.value.lecturer : 
        draggedSchedule.value.lecturer.id
    };

    await scheduleStore.updateSchedule(draggedSchedule.value.id, updatedSchedule);
    await refreshSchedule();
  } catch (error) {
    console.error('Error updating schedule:', error);
  } finally {
    isDragging.value = false;
    draggedSchedule.value = null;
  }
}

async function handleDragEnd(e: DragEvent) {
  if (!isDragging.value || !draggedSchedule.value) return;

  try {
    const timeDiff = calculateTimeDifference(
      dragStartTime.value,
      draggedSchedule.value.end_time
    );

    const updatedSchedule: Partial<Schedule> = {
      id: draggedSchedule.value.id,
      start_time: dragStartTime.value,
      end_time: calculateNewTime(draggedSchedule.value.end_time, timeDiff),
      course: typeof draggedSchedule.value.course === 'number' ? 
        draggedSchedule.value.course : 
        draggedSchedule.value.course.id,
      classroom: typeof draggedSchedule.value.classroom === 'number' ? 
        draggedSchedule.value.classroom : 
        draggedSchedule.value.classroom.id,
      lecturer: typeof draggedSchedule.value.lecturer === 'number' ? 
        draggedSchedule.value.lecturer : 
        draggedSchedule.value.lecturer.id
    };

    await scheduleStore.updateSchedule(draggedSchedule.value.id, updatedSchedule);
    await refreshSchedule();
  } catch (error) {
    console.error('Error updating schedule:', error);
  } finally {
    isDragging.value = false;
    draggedSchedule.value = null;
  }
}

// Utility functions
function calculateNewTime(time: string, diffInSlots: number): string {
  const date = new Date(`2000-01-01T${time}`);
  date.setMinutes(date.getMinutes() + (diffInSlots * 30));
  return date.toTimeString().slice(0, 8);
}

function calculateTimeDifference(startTime: string, endTime: string): number {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return Math.round((end.getTime() - start.getTime()) / (30 * 60 * 1000));
}

// Lifecycle hooks
onMounted(async () => {
  try {
    await Promise.all([
      courseStore.fetchCourses(),
      lecturerStore.fetchLecturers(),
      scheduleStore.fetchSchedules({ classroom: classroomId })
    ]);
  } catch (error) {
    console.error('Error loading initial data:', error);
    scheduleStore.resetState();
    courseStore.resetState();
    lecturerStore.resetState();
  }
});

onUnmounted(() => {
  scheduleStore.resetState();
  courseStore.resetState();
  lecturerStore.resetState();
});

async function deleteSchedule(schedule: PopulatedSchedule | null) {
  if (!schedule || !confirm('Are you sure you want to delete this schedule?')) return;

  try {
    await scheduleStore.deleteSchedule(schedule.id);
    closeDialog();
  } catch (error) {
    console.error('Error deleting schedule:', error);
  }
}

function closeDialog() {
  dialogVisible.value = false;
  editingSchedule.value = null;
  formData.value = {
    course: 0,
    classroom: classroomId,
    day_of_week: 0,
    start_time: '',
    end_time: '',
    start_date: '',
    end_date: ''
  };
}
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
  position: sticky;
  left: 0;
  background: white;
  z-index: 3;
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
  position: sticky;
  top: 0;
  z-index: 2;
}

.time-header {
  background-color: transparent;
}

.time-cell, .schedule-cell {
  height: 25px;
  padding: 2px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* New styles for alternating hours */
.time-cell:nth-child(4n+2),
.time-cell:nth-child(4n+3),
.schedule-cell:nth-child(4n+2),
.schedule-cell:nth-child(4n+3) {
  background-color: rgba(0, 0, 0, 0.02);
}

.schedule-cell {
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
  overflow: hidden;
}

.schedule-cell:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* New styles for the add icon */
.add-icon {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  background-color: rgba(var(--v-theme-primary), 0.05);
  color: rgb(var(--v-theme-primary));
}

.schedule-cell:hover .add-icon {
  opacity: 1;
}

/* Update class-event to work with add icon */
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
  cursor: move;
}

.class-event:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  z-index: 2;
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

.weekend-cell {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Updated weekend styles to work with alternating hours */
.weekend .header-cell {
  background-color: rgba(0, 0, 0, 0.05);
}

.weekend .schedule-cell {
  background-color: rgba(0, 0, 0, 0.03);
}

.weekend .schedule-cell:nth-child(4n+2),
.weekend .schedule-cell:nth-child(4n+3) {
  background-color: rgba(0, 0, 0, 0.05);
}

.resize-handle {
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  cursor: row-resize;
  background: transparent;
  transition: background-color 0.2s;
}

.resize-handle:hover {
  background: rgba(var(--v-theme-primary), 0.2);
}

.resize-handle.top {
  top: 0;
}

.resize-handle.bottom {
  bottom: 0;
}

.dragging {
  opacity: 0.5;
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.class-event.dragging {
  opacity: 0.8;
  transform: scale(1.02);
}

.edit-mode {
  cursor: move;
}

.edit-mode .class-event {
  border: 2px dashed var(--v-primary-base);
}

.edit-mode .class-event:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.edit-mode .resize-handle {
  display: block;
}

.schedule-cell.edit-mode {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.schedule-cell.edit-mode:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

/* Hide add icon in edit mode */
.edit-mode .add-icon {
  display: none;
}
</style>
