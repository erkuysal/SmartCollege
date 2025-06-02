<template>
  <v-container fluid>
    <v-card elevation="2" class="schedule-card">
      <v-toolbar flat :color="color" dark dense>
        <v-toolbar-title class="text-subtitle-1">
          <v-icon size="small" class="me-2">mdi-calendar-clock</v-icon>
          Weekly Schedule
        </v-toolbar-title>
        <v-spacer></v-spacer>

        <!-- Edit mode toggle -->
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
          @click="refreshSchedule"
          :loading="scheduleStore.loading"
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
                      {{ getCourseDetails(getScheduleForTimeSlot(day, time)) }}
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
    <schedule-form-dialog
      v-model="dialogVisible"
      :editing-schedule="editingSchedule"
      :classroom-id="classroomId"
      @saved="onScheduleSaved"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useScheduleStore } from '@/utils/stores/college/scheduleStore';
import { useCourseStore } from '@/utils/stores/college/courseStore';
import { DAY_OF_WEEK } from '@/utils/interfaces/college/scheduleInterface';
import type { Schedule } from '@/utils/interfaces/college/scheduleInterface';
import { useStorage } from '@vueuse/core';
import { ScheduleFormDialog } from '@/components/schedule';

const props = defineProps({
  classroomId: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    default: 'primary'
  }
});

// Store instances
const scheduleStore = useScheduleStore();
const courseStore = useCourseStore();

// Constants
const weekDays = [0, 1, 2, 3, 4, 5, 6]; // Monday to Sunday

// State
const dialogVisible = ref(false);
const editingSchedule = ref<Schedule | null>(null);
const isValid = ref(false);
const form = ref<any>(null);
const isEditMode = useStorage('classroom-schedule-edit-mode', false);
const isDragging = ref(false);
const dragStartTime = ref('');
const dragStartDay = ref(0);
const draggedSchedule = ref<Schedule | null>(null);

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

function getScheduleForTimeSlot(day: number, time: string): Schedule | null {
  // Find a schedule that matches the criteria using time_slot_display
  const schedule = scheduleStore.schedules.find(s => {
    // Parse time_slot_display to extract day and time information
    // Format should be like "Monday 08:00-10:00"
    if (!s.time_slot_display) return false;
    
    const timeSlotInfo = s.time_slot_display.split(' ');
    if (timeSlotInfo.length < 2) return false;
    
    const dayName = timeSlotInfo[0];
    const timeParts = timeSlotInfo[1].split('-');
    if (timeParts.length < 2) return false;
    
    const startTime = timeParts[0];
    const endTime = timeParts[1];

    // Get day number from day name
    const dayNumber = Object.entries(DAY_OF_WEEK).findIndex(
      ([_, value]) => value === getDayNumberFromName(dayName)
    );

    // Check if the schedule belongs to this classroom
    const isThisClassroom = s.classroom === props.classroomId;
    
    // Check if the current time slot is within the schedule's time range
    const isWithinTimeRange = 
      startTime && endTime && 
      time >= startTime && 
      time < endTime;
      
    return isThisClassroom && dayNumber === day && isWithinTimeRange;
  });

  return schedule || null;
}

function getDayNumberFromName(dayName: string): number {
  const dayMap: Record<string, number> = {
    'Monday': DAY_OF_WEEK.MONDAY,
    'Tuesday': DAY_OF_WEEK.TUESDAY,
    'Wednesday': DAY_OF_WEEK.WEDNESDAY,
    'Thursday': DAY_OF_WEEK.THURSDAY,
    'Friday': DAY_OF_WEEK.FRIDAY,
    'Saturday': DAY_OF_WEEK.SATURDAY,
    'Sunday': DAY_OF_WEEK.SUNDAY
  };
  return dayMap[dayName] || 0;
}

function getCourseDetails(schedule: Schedule | null): string {
  if (!schedule) return 'No Course';
  return schedule.course_name || 'Unknown Course';
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
    await scheduleStore.fetchSchedules({ classroom: props.classroomId });
  } catch (error) {
    console.error('Error refreshing schedules:', error);
  }
}

function onScheduleSaved() {
  refreshSchedule();
}

// Drag and drop handlers
function handleDragStart(schedule: Schedule, day: number, time: string, e: DragEvent) {
  if (!isEditMode.value || !(e.target instanceof HTMLElement)) return;

  isDragging.value = true;
  dragStartTime.value = time;
  dragStartDay.value = day;
  draggedSchedule.value = schedule;
  e.dataTransfer?.setData('text/plain', JSON.stringify({
    scheduleId: schedule.id,
    day: day,
    time: time
  }));
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
    // Get the updated schedule data with new position
    const updatedSchedule: Partial<Schedule> = {
      id: draggedSchedule.value.id,
      // We can update time_slot or other properties as needed
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

function handleDragEnd(e: DragEvent) {
  isDragging.value = false;
  draggedSchedule.value = null;
}

// Lifecycle hooks
onMounted(async () => {
  try {
    await Promise.all([
      courseStore.fetchCourses(),
      scheduleStore.fetchSchedules({ classroom: props.classroomId })
    ]);
  } catch (error) {
    console.error('Error loading initial data:', error);
  }
});

onUnmounted(() => {
  // Clean up if needed
});

// Expose methods
defineExpose({
  refreshSchedule
});
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

/* Alternating hours */
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

/* Add icon */
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

/* Class event styling */
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

.weekend-cell {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Weekend styles */
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

/* Resize handles */
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

/* Dragging states */
.dragging {
  opacity: 0.5;
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.class-event.dragging {
  opacity: 0.8;
  transform: scale(1.02);
}

/* Edit mode styles */
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