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
                  :items="collegeStore.courses"
                  label="Course"
                  item-title="title"
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

              <!-- Date Range -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.start_date"
                  label="Start Date"
                  type="date"
                  :rules="[v => !!v || 'Start date is required']"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.end_date"
                  label="End Date"
                  type="date"
                  :rules="[
                    v => !!v || 'End date is required',
                    v => !formData.start_date || v >= formData.start_date || 'End date must be after or equal to start date'
                  ]"
                  required
                ></v-text-field>
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
          :loading="collegeStore.isLoading"
          :disabled="!isValid"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { PropType } from 'vue';
import { useCollegeStore } from '@/utils/stores/collegeStore';
import type { Schedule } from '@/utils/interfaces/collegeInterface';
import { DAY_OF_WEEK } from '@/utils/interfaces/collegeInterface';

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

// Store instance
const collegeStore = useCollegeStore();

// Form state
const form = ref<any>(null);
const isValid = ref(false);
const formData = ref<Omit<Schedule, 'id'>>({
  course: 0,
  classroom: props.classroomId,
  day_of_week: 0,
  start_time: '',
  end_time: '',
  start_date: '',
  end_date: ''
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

// Watch for editing schedule changes
watch(() => props.editingSchedule, (newSchedule) => {
  if (newSchedule) {
    formData.value = {
      course: newSchedule.course,
      classroom: props.classroomId,
      day_of_week: newSchedule.day_of_week,
      start_time: newSchedule.start_time,
      end_time: newSchedule.end_time,
      start_date: newSchedule.start_date,
      end_date: newSchedule.end_date
    };
  } else {
    resetForm();
  }
}, { immediate: true });

// Methods
function resetForm() {
  formData.value = {
    course: 0,
    classroom: props.classroomId,
    day_of_week: 0,
    start_time: '',
    end_time: '',
    start_date: '',
    end_date: ''
  };
  if (form.value) {
    form.value.resetValidation();
  }
}

async function saveSchedule() {
  if (!isValid.value) return;

  try {
    if (props.editingSchedule) {
      await collegeStore.updateSchedule(props.editingSchedule.id, formData.value);
    } else {
      await collegeStore.createSchedule(formData.value);
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
</script> 