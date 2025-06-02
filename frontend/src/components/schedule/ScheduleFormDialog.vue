<template>
  <v-dialog v-model="dialogModel" max-width="800px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ editingSchedule ? 'Edit Schedule' : 'Add Schedule' }}</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="isValid">
          <v-container>
            <v-row>
              <!-- Course Selection -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.course"
                  :items="courseStore.items"
                  label="Course"
                  item-title="name"
                  item-value="id"
                  :rules="[v => !!v || 'Course is required']"
                  required
                ></v-select>
              </v-col>

              <!-- Day of Week -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.day_of_week"
                  :items="daysOfWeek"
                  label="Day of Week"
                  item-title="name"
                  item-value="value"
                  :rules="[v => v !== undefined || 'Day is required']"
                  required
                ></v-select>
              </v-col>

              <!-- Time Range -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.start_time"
                  label="Start Time"
                  type="time"
                  :rules="[v => !!v || 'Start time is required']"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.end_time"
                  label="End Time"
                  type="time"
                  :rules="[
                    v => !!v || 'End time is required',
                    v => !formData.start_time || v > formData.start_time || 'End time must be after start time'
                  ]"
                  required
                ></v-text-field>
              </v-col>

              <!-- Semester field -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.semester"
                  label="Semester"
                  placeholder="e.g. Fall 2023"
                  :rules="[v => !!v || 'Semester is required']"
                  required
                ></v-text-field>
              </v-col>

              <!-- Active Status -->
              <v-col cols="12" md="6">
                <v-switch
                  v-model="formData.is_active"
                  label="Active"
                  color="primary"
                  hide-details
                ></v-switch>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          variant="text"
          @click="closeDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="text"
          @click="saveSchedule"
          :loading="scheduleStore.loading"
          :disabled="!isValid"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { PropType } from 'vue';
import { useCourseStore } from '@/utils/stores/college/courseStore';
import { useScheduleStore } from '@/utils/stores/college/scheduleStore';
import type { Schedule, TimeSlot } from '@/utils/interfaces/college/scheduleInterface';
import { DAY_OF_WEEK } from '@/utils/interfaces/college/scheduleInterface';

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  editingSchedule: {
    type: Object as PropType<Schedule | null>,
    default: null
  },
  classroomId: {
    type: Number,
    required: true
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'saved']);

// Store instances
const courseStore = useCourseStore();
const scheduleStore = useScheduleStore();

// Form state
const form = ref<null | { resetValidation: () => void }>(null);
const isValid = ref(false);
const formData = ref<Partial<TimeSlot> & { course?: number; classroom?: number; semester?: string; is_active?: boolean }>({
  course: undefined,
  classroom: props.classroomId,
  day_of_week: undefined,
  start_time: '',
  end_time: '',
  semester: getCurrentSemester(),
  is_active: true
});

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const daysOfWeek = [
  { name: 'Monday', value: DAY_OF_WEEK.MONDAY },
  { name: 'Tuesday', value: DAY_OF_WEEK.TUESDAY },
  { name: 'Wednesday', value: DAY_OF_WEEK.WEDNESDAY },
  { name: 'Thursday', value: DAY_OF_WEEK.THURSDAY },
  { name: 'Friday', value: DAY_OF_WEEK.FRIDAY },
  { name: 'Saturday', value: DAY_OF_WEEK.SATURDAY },
  { name: 'Sunday', value: DAY_OF_WEEK.SUNDAY }
];

// Helper functions
function getCurrentSemester() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Simple logic: Jan-May = Spring, Jun-Jul = Summer, Aug-Dec = Fall
  let term;
  if (month < 5) term = 'Spring';
  else if (month < 8) term = 'Summer';
  else term = 'Fall';
  
  return `${term} ${year}`;
}

// Watch for editing schedule changes
watch(() => props.editingSchedule, (newSchedule) => {
  if (newSchedule) {
    // Convert Schedule interface to CourseSchedule interface
    // This mapping depends on the actual structure of your data
    formData.value = {
      course: newSchedule.time_slot,  // Assuming time_slot maps to course id
      classroom: props.classroomId,
      day_of_week: extractDayOfWeek(newSchedule),
      start_time: extractStartTime(newSchedule),
      end_time: extractEndTime(newSchedule),
      semester: getCurrentSemester(),
      is_active: newSchedule.is_active
    };
  } else {
    resetForm();
  }
}, { immediate: true });

// Helper methods to extract data from Schedule object
function extractDayOfWeek(schedule: Schedule): number {
  // Check if there's a direct day_of_week property
  if ('day_of_week' in schedule) {
    return (schedule as any).day_of_week;
  }
  
  // Otherwise try to parse from time_slot_display
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  if (schedule.time_slot_display) {
    for (let i = 0; i < dayNames.length; i++) {
      if (schedule.time_slot_display.includes(dayNames[i])) {
        return i === 0 ? 7 : i; // Map Sunday to 7 to match DAY_OF_WEEK enum
      }
    }
  }
  
  // Default to Monday if we can't determine
  return DAY_OF_WEEK.MONDAY;
}

function extractStartTime(schedule: Schedule): string {
  // Check if there's a direct start_time property
  if ('start_time' in schedule) {
    return (schedule as any).start_time;
  }
  
  // Otherwise try to parse from time_slot_display
  if (schedule.time_slot_display) {
    const timeMatch = schedule.time_slot_display.match(/(\d{1,2}:\d{2})\s*-/);
    if (timeMatch && timeMatch[1]) {
      return timeMatch[1];
    }
  }
  
  return '';
}

function extractEndTime(schedule: Schedule): string {
  // Check if there's a direct end_time property
  if ('end_time' in schedule) {
    return (schedule as any).end_time;
  }
  
  // Otherwise try to parse from time_slot_display
  if (schedule.time_slot_display) {
    const timeMatch = schedule.time_slot_display.match(/-\s*(\d{1,2}:\d{2})/);
    if (timeMatch && timeMatch[1]) {
      return timeMatch[1];
    }
  }
  
  return '';
}

// Methods
function resetForm() {
  formData.value = {
    course: undefined,
    classroom: props.classroomId,
    day_of_week: undefined,
    start_time: '',
    end_time: '',
    semester: getCurrentSemester(),
    is_active: true
  };
  if (form.value) {
    form.value.resetValidation();
  }
}

async function saveSchedule() {
  if (!isValid.value) return;

  try {
    // Ensure all required fields are present
    if (!formData.value.course || formData.value.day_of_week === undefined) {
      console.error('Missing required fields');
      return;
    }

    // Create schedule data object that matches what Schedule service expects
    const scheduleData: Partial<Schedule> = {
      time_slot: formData.value.course,
      classroom: props.classroomId,
      is_active: formData.value.is_active ?? true
    };

    // Add additional data for TimeSlot
    const timeSlotData = {
      day_of_week: formData.value.day_of_week,
      start_time: formData.value.start_time,
      end_time: formData.value.end_time,
    };

    // Combine the data in a way that works with the API
    const combinedData = {
      ...scheduleData,
      ...timeSlotData
    };

    if (props.editingSchedule) {
      await scheduleStore.updateSchedule(props.editingSchedule.id, combinedData);
    } else {
      await scheduleStore.createSchedule(combinedData);
    }
    emit('saved');
    closeDialog();
  } catch (error) {
    console.error('Error saving schedule:', error);
  }
}

function closeDialog() {
  dialogModel.value = false;
  resetForm();
}

// Load courses on mount
onMounted(async () => {
  try {
    if (!courseStore.items.length) {
      await courseStore.fetchCourses();
    }
  } catch (error) {
    console.error('Error loading courses:', error);
  }
});
</script> 