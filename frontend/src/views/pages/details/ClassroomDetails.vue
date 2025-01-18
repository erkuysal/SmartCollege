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
          @click="() => collegeStore.fetchClassroomSchedule(classroomId)"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-toolbar>

      <v-progress-linear
        v-if="collegeStore.loading"
        indeterminate
      ></v-progress-linear>

      <v-alert
        v-if="collegeStore.error"
        type="error"
        class="ma-2"
      >
        {{ collegeStore.error }}
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
            v-for="day in [0,1,2,3,4,5,6]" 
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
                @click="!isEditMode && openScheduleDialog(day, time, getScheduleForTimeSlot(day, time))"
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
                    :items="collegeStore.courses"
                    item-title="title"
                    item-value="id"
                    label="Course"
                    required
                    :rules="[v => !!v || 'Course is required']"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        {{ item.raw.title }} - {{ getCourseDetails(item.raw.id) }}
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
            @click="saveSchedule"
            :loading="collegeStore.loading"
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useCollegeStore } from '@/utils/stores/collegeStore';
import { useTeacherStore } from '@/utils/stores/teacherStore';
import type { Schedule, Course } from '@/utils/interfaces/collegeInterface';
import { useStorage } from '@vueuse/core';

const route = useRoute();
const classroomId = Number(route.params.id);
const collegeStore = useCollegeStore();
const teacherStore = useTeacherStore();

// State
const dialogVisible = ref(false);
const selectedTimeSlot = ref<{ day: number; time: string } | null>(null);
const editingSchedule = ref<Schedule | null>(null);
const isValid = ref(false);
const form = ref<any>(null);

// Form data
const formData = ref({
  course: null as number | null,
  start_time: '',
  end_time: '',
  start_date: '',
  end_date: '',
  day_of_week: 0
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

// Add edit mode state
const isEditMode = ref(false);
const isDragging = ref(false);
const dragStartTime = ref('');
const dragStartDay = ref(0);
const draggedSchedule = ref<Schedule | null>(null);

// Persistent storage for schedule state
const savedScheduleState = useStorage('classroom-schedule', {
  schedules: [] as Schedule[]
});

// Initialize data
onMounted(async () => {
  try {
    await Promise.all([
      collegeStore.fetchCourses(),
      teacherStore.fetchTeachers(),
      collegeStore.fetchClassroomSchedule(classroomId)
    ]);
    
    // Restore saved state if exists
    if (savedScheduleState.value.schedules.length > 0) {
      collegeStore.schedules = savedScheduleState.value.schedules;
    }
  } catch (err) {
    console.error('Error loading data:', err);
  }
});

// Watch for schedule changes and save state
watch(() => collegeStore.schedules, (newSchedules) => {
  savedScheduleState.value.schedules = newSchedules;
}, { deep: true });

// Helper functions
function getDayName(day: number): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[day];
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
  return collegeStore.schedules.find(s => 
    s.day_of_week === day && 
    s.start_time === time
  ) || null;
}

function getCourseDetails(courseId: number | null): string {
  if (!courseId) return 'No Course';
  const course = collegeStore.getCourseById(courseId);
  if (!course) return 'Unknown Course';
  const teacher = teacherStore.teacherById(course.teacher);
  return `${course.title} - ${teacher ? `${teacher.first_name} ${teacher.last_name}` : 'No Teacher'}`;
}

// Dialog functions
function openScheduleDialog(day: number, time: string, schedule?: Schedule) {
  selectedTimeSlot.value = { day, time };
  editingSchedule.value = schedule || null;
  
  if (schedule) {
    formData.value = {
      course: schedule.course,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      start_date: schedule.start_date,
      end_date: schedule.end_date,
      day_of_week: schedule.day_of_week
    };
  } else {
    formData.value = {
      course: null,
      start_time: time,
      end_time: time.replace(':00:', ':50:'), // Default 50-minute lesson
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString().split('T')[0],
      day_of_week: day
    };
  }
  
  dialogVisible.value = true;
}

async function saveSchedule() {
  if (!isValid.value || !selectedTimeSlot.value) return;

  try {
    const scheduleData = {
      ...formData.value,
      classroom: classroomId,
      course: formData.value.course!
    };

    if (editingSchedule.value) {
      await collegeStore.updateSchedule(editingSchedule.value.id, scheduleData);
    } else {
      await collegeStore.addSchedule(scheduleData);
    }
    closeDialog();
  } catch (error) {
    console.error('Error saving schedule:', error);
  }
}

async function deleteSchedule(schedule: Schedule) {
  if (confirm('Are you sure you want to delete this schedule?')) {
    try {
      await collegeStore.deleteSchedule(schedule.id);
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  }
}

function closeDialog() {
  dialogVisible.value = false;
  selectedTimeSlot.value = null;
  editingSchedule.value = null;
  formData.value = {
    course: null,
    start_time: '',
    end_time: '',
    start_date: '',
    end_date: '',
    day_of_week: 0
  };
}

// Drag handlers
function handleDragStart(schedule: Schedule, day: number, time: string, e: DragEvent) {
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

function handleDrop(day: number, time: string, e: DragEvent) {
  e.preventDefault();
  if (!isEditMode.value || !isDragging.value || !draggedSchedule.value) return;

  const updatedSchedule = {
    ...draggedSchedule.value,
    day_of_week: day,
    start_time: time,
    end_time: calculateNewTime(time, calculateTimeDifference(draggedSchedule.value.start_time, draggedSchedule.value.end_time))
  };

  collegeStore.updateSchedule(draggedSchedule.value.id, updatedSchedule);
  isDragging.value = false;
  draggedSchedule.value = null;
}

function toggleEditMode() {
  isEditMode.value = !isEditMode.value;
}

async function handleDragEnd(e: DragEvent) {
  if (isDragging.value && draggedSchedule.value) {
    const timeSlotDiff = calculateTimeDifference(dragStartTime.value, draggedSchedule.value.end_time);
    
    try {
      await collegeStore.updateSchedule(draggedSchedule.value.id, {
        ...draggedSchedule.value,
        start_time: dragStartTime.value,
        end_time: calculateNewTime(draggedSchedule.value.end_time, timeSlotDiff)
      });
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  }
  
  isDragging.value = false;
  draggedSchedule.value = null;
}

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