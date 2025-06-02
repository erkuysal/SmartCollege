<template>
  <ContentLayout 
    title="System Setup" 
    subtitle="Configure your academic system structure"
    :loading="loading"
    :hasHeaderActions="true"
  >
    <!-- Header Actions -->
    <template #actions>
      <v-btn
        variant="outlined"
        color="primary"
        class="mr-2"
        :disabled="loading"
        @click="resetProgress"
      >
        <v-icon left>mdi-refresh</v-icon>
        Reset Progress
      </v-btn>
    </template>

    <!-- Progress Steps -->
    <v-card class="mb-6" elevation="2">
      <v-card-text>
        <v-tabs v-model="currentStepIndex" grow>
          <v-tab
            v-for="(step, i) in steps"
            :key="step.id"
            :value="i"
            class="setup-tab"
          >
            {{ step.name }}
          </v-tab>
        </v-tabs>
      </v-card-text>
    </v-card>

    <!-- Step Content -->
    <v-card class="step-content" elevation="2">
      <v-card-text>
        <v-fade-transition mode="out-in">
          <component 
            :is="currentStepComponent"
            @step-completed="handleStepComplete"
            @step-error="handleStepError"
          />
        </v-fade-transition>
      </v-card-text>
    </v-card>
  </ContentLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ContentLayout from '@/views/layouts/ContentLayout.vue';
import BaseStructureStep from '@/components/creation-flow/BaseStructureStep.vue';
import CourseStructureStep from '@/components/creation-flow/CourseStructureStep.vue';
import AcademicStaffStep from '@/components/creation-flow/AcademicStaffStep.vue';
import StudentEnrollmentStep from '@/components/creation-flow/StudentEnrollmentStep.vue';

// Step definitions
const steps = ref([
  { id: 'base-structure', name: 'Base Structure', status: 'current' },
  { id: 'course-structure', name: 'Course Structure', status: 'upcoming' },
  { id: 'academic-staff', name: 'Academic Staff', status: 'upcoming' },
  { id: 'student-enrollment', name: 'Student Enrollment', status: 'upcoming' }
]);

// Current step index (0-based for v-tabs)
const currentStepIndex = ref(0);
const loading = ref(false);

// Computed properties
const currentStepComponent = computed(() => {
  switch (steps.value[currentStepIndex.value].id) {
    case 'base-structure':
      return BaseStructureStep;
    case 'course-structure':
      return CourseStructureStep;
    case 'academic-staff':
      return AcademicStaffStep;
    case 'student-enrollment':
      return StudentEnrollmentStep;
    default:
      return BaseStructureStep;
  }
});

// Methods
const handleStepComplete = (stepId: string) => {
  // Update current step status
  steps.value[currentStepIndex.value].status = 'complete';
  // Move to next step if available
  if (currentStepIndex.value < steps.value.length - 1) {
    currentStepIndex.value++;
    steps.value[currentStepIndex.value].status = 'current';
  }
};

const handleStepError = (error: Error) => {
  console.error('Step error:', error);
  // Here you can implement error handling logic
  // For example, show an error notification
};

const resetProgress = () => {
  loading.value = true;
  // Reset all steps to initial state
  steps.value.forEach((step, index) => {
    step.status = index === 0 ? 'current' : 'upcoming';
  });
  currentStepIndex.value = 0;
  loading.value = false;
};
</script>

<style scoped>
.step-content {
  min-height: 400px;
  transition: all 0.3s ease;
}

.setup-tab {
  cursor: pointer;
  font-weight: 500;
  font-size: 0.98rem;
  border-radius: 5px 5px 0 0;
  transition: background 0.2s, color 0.2s;
  min-width: 110px;
  padding: 0.25rem 0.7rem;
}
.setup-tab.v-tab--active {
  background: #1976d2 !important;
  color: #fff !important;
  font-weight: bold;
}
.setup-tab:hover {
  background: #e3f2fd !important;
  color: #1976d2 !important;
}

.v-stepper {
  background: transparent !important;
}

.v-stepper-item {
  transition: all 0.3s ease;
}

.v-stepper-item:hover {
  transform: translateY(-2px);
}
</style> 