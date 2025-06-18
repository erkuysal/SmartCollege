<template>
  <div class="timetable-card">
    <v-card-text class="pa-0">
      <div class="timetable-container">
        <!-- Time Slots Column -->
        <div class="time-slots">
          <div class="time-slot-header">Time</div>
          <div
            v-for="timeSlot in timeSlots"
            :key="timeSlot.id"
            class="time-slot"
          >
            {{ timeSlot.display }}
          </div>
        </div>

        <!-- Days Grid -->
        <div class="days-grid">
          <!-- Day Headers -->
          <div
            v-for="day in days"
            :key="day"
            class="day-header"
          >
            {{ day }}
          </div>

          <!-- Schedule Cells -->
          <template v-for="timeSlot in timeSlots" :key="timeSlot.id">
            <div
              v-for="day in days"
              :key="`${timeSlot.id}-${day}`"
              class="schedule-cell"
              :class="{
                'has-schedule': getScheduleForCell(timeSlot.id, day),
                'is-active': isScheduleActive(timeSlot.id, day)
              }"
              @click="(event) => handleCellClick(event, timeSlot.id, day)"
            >
              <template v-if="getScheduleForCell(timeSlot.id, day)">
                <div class="schedule-content">
                  <div class="course-name">
                    {{ getCourseNameForCell(timeSlot.id, day) }}
                  </div>
                  <div class="section-name">
                    {{ getScheduleDetails(getScheduleForCell(timeSlot.id, day)!).course_name }}
                  </div>
                  <div class="classroom">
                    {{ getScheduleDetails(getScheduleForCell(timeSlot.id, day)!).classroom_name }}
                  </div>
                  <div v-if="getSessionForCell(timeSlot.id, day)" class="session-status">
                    <v-chip
                      :color="getSessionForCell(timeSlot.id, day)?.is_active ? 'success' : 'grey'"
                      size="x-small"
                      class="mt-1"
                    >
                      {{ getSessionForCell(timeSlot.id, day)?.is_active ? 'Active Session' : 'Ended Session' }}
                    </v-chip>
                  </div>
                </div>
              </template>
            </div>
          </template>
        </div>
      </div>
    </v-card-text>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Schedule, AttendanceSession } from '@/client/api.ts'

const props = defineProps<{
  schedules: Schedule[]
  sessions: AttendanceSession[]
  courses: any[]
  classrooms: any[]
}>()

const emit = defineEmits<{
  (e: 'cellClick', event: MouseEvent, timeSlotId: number, day: string): void
}>()

// Time slots and days
const timeSlots = [
  { id: 1, display: '08:00 - 08:30' },
  { id: 2, display: '08:30 - 09:00' },
  { id: 3, display: '09:00 - 09:30' },
  { id: 4, display: '09:30 - 10:00' },
  { id: 5, display: '10:00 - 10:30' },
  { id: 6, display: '10:30 - 11:00' },
  { id: 7, display: '11:00 - 11:30' },
  { id: 8, display: '11:30 - 12:00' },
  { id: 9, display: '12:00 - 12:30' },
  { id: 10, display: '12:30 - 13:00' },
  { id: 11, display: '13:00 - 13:30' },
  { id: 12, display: '13:30 - 14:00' },
  { id: 13, display: '14:00 - 14:30' },
  { id: 14, display: '14:30 - 15:00' },
  { id: 15, display: '15:00 - 15:30' },
  { id: 16, display: '15:30 - 16:00' },
  { id: 17, display: '16:00 - 16:30' },
  { id: 18, display: '16:30 - 17:00' },
  { id: 19, display: '17:00 - 17:30' },
  { id: 20, display: '17:30 - 18:00' }
]

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// Add computed properties for schedule details
const getScheduleDetails = computed(() => (schedule: Schedule) => {
  const course = props.courses.find(c => c.id === schedule.course)
  const classroom = props.classrooms.find(c => c.id === schedule.classroom)
  const timeSlot = timeSlots.find(t => t.id === schedule.time_slot)

  return {
    course_name: course?.name || 'Unknown Course',
    classroom_name: classroom?.name || 'Unknown Classroom',
    time_slot_display: timeSlot?.display || 'Unknown Time'
  }
})

function getScheduleForCell(timeSlotId: number, day: string): Schedule | undefined {
  return props.schedules.find(schedule =>
    schedule.time_slot === timeSlotId && schedule.day === day
  )
}

function isScheduleActive(timeSlotId: number, day: string): boolean {
  const schedule = getScheduleForCell(timeSlotId, day)
  return schedule?.is_active ?? false
}

function getSessionForCell(timeSlotId: number, day: string): AttendanceSession | undefined {
  const schedule = getScheduleForCell(timeSlotId, day)
  if (!schedule) return undefined

  return props.sessions.find(session =>
    session.course === schedule.course &&
    schedule.day === day &&
    new Date(session.start_time).getHours() === parseInt(timeSlots.find(t => t.id === timeSlotId)?.display.split(':')[0] || '0')
  )
}

const getCourseNameForCell = (timeSlotId: number, day: string) => {
  const schedule = getScheduleForCell(timeSlotId, day);
  if (schedule) {
    return getScheduleDetails.value(schedule).course_name;
  }
  return 'Unknown Course';
};

const handleCellClick = (event: MouseEvent, timeSlotId: number, day: string) => {
  emit('cellClick', event, timeSlotId, day)
}
</script>

<style lang="scss">
@use '../../styles/theme/index' as theme;

.timetable-card {
  overflow: hidden;
  background: theme.$theme-surface-1;
  border-radius: theme.$border-radius-lg;
  box-shadow: 0 2px 8px theme.$theme-shadow-color;
}

.timetable-container {
  display: flex;
  min-height: 400px;
}

.time-slots {
  width: 80px;
  border-right: 1px solid theme.$theme-border-light;
  background: theme.$theme-surface-2;
}

.time-slot-header,
.day-header {
  padding: theme.$spacing-sm;
  font-weight: theme.$font-weight-semibold;
  text-align: center;
  background-color: theme.$theme-surface-3;
  border-bottom: 1px solid theme.$theme-border-light;
  font-size: theme.$font-size-xs;
  color: theme.$theme-text-primary;
}

.time-slot {
  padding: theme.$spacing-xs;
  text-align: center;
  border-bottom: 1px solid theme.$theme-border-light;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: theme.$font-size-xs;
  color: theme.$theme-text-secondary;
}

.days-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: auto;
}

.day-header {
  border-right: 1px solid theme.$theme-border-light;
}

.schedule-cell {
  height: 40px;
  border-right: 1px solid theme.$theme-border-light;
  border-bottom: 1px solid theme.$theme-border-light;
  padding: theme.$spacing-xxs;
  cursor: pointer;
  transition: all theme.$theme-transition-fast;
  background: theme.$theme-surface-1;
  color: theme.$theme-text-primary;
  &:hover {
    background-color: theme.$theme-surface-2;
  }
  &.has-schedule {
    background-color: theme.$theme-primary-light;
    color: theme.$theme-primary-contrast;
  }
  &.is-active {
    background-color: theme.$theme-primary;
    color: theme.$theme-primary-contrast;
  }
}

.schedule-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  font-size: theme.$font-size-xs;
  cursor: pointer;
  transition: background-color theme.$theme-transition-fast;
}

.schedule-content:hover {
  background-color: theme.$theme-primary-light;
}

.course-name {
  font-weight: theme.$font-weight-semibold;
  margin-bottom: 0.0625rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: theme.$font-size-xs;
  color: theme.$theme-text-primary;
}

.section-name {
  font-size: 0.6rem;
  color: theme.$theme-text-secondary;
  margin-bottom: 0.0625rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.classroom {
  font-size: 0.55rem;
  color: theme.$theme-text-disabled;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-status {
  margin-top: theme.$spacing-xs;
  display: flex;
  justify-content: center;
}
</style> 