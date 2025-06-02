<template>
  <div class="creation-sequencer">
    <h1 class="text-2xl font-bold mb-6">System Creation Flow</h1>
    
    <!-- Progress Overview -->
    <div class="mb-8">
      <div class="flex justify-between mb-2">
        <span class="text-sm font-medium">Overall Progress</span>
        <span class="text-sm font-medium">{{ overallProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: `${overallProgress}%` }"></div>
      </div>
    </div>

    <!-- Creation Steps -->
    <div class="space-y-6">
      <!-- Step 1: Basic Infrastructure -->
      <div class="step-section" :class="{ 'opacity-50': currentStep > 1 }">
        <h2 class="text-xl font-semibold mb-4">1. Basic Infrastructure</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CreationCard
            v-for="item in basicInfrastructure"
            :key="item.id"
            :title="item.title"
            :description="item.description"
            :status="item.status"
            :route="item.route"
            @click="navigateTo(item.route)"
          />
        </div>
      </div>

      <!-- Step 2: Academic Structure -->
      <div class="step-section" :class="{ 'opacity-50': currentStep > 2 }">
        <h2 class="text-xl font-semibold mb-4">2. Academic Structure</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CreationCard
            v-for="item in academicStructure"
            :key="item.id"
            :title="item.title"
            :description="item.description"
            :status="item.status"
            :route="item.route"
            :disabled="!canAccessStep(2)"
            @click="navigateTo(item.route)"
          />
        </div>
      </div>

      <!-- Step 3: Personnel -->
      <div class="step-section" :class="{ 'opacity-50': currentStep > 3 }">
        <h2 class="text-xl font-semibold mb-4">3. Personnel</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CreationCard
            v-for="item in personnel"
            :key="item.id"
            :title="item.title"
            :description="item.description"
            :status="item.status"
            :route="item.route"
            :disabled="!canAccessStep(3)"
            @click="navigateTo(item.route)"
          />
        </div>
      </div>

      <!-- Step 4: Academic Operations -->
      <div class="step-section" :class="{ 'opacity-50': currentStep > 4 }">
        <h2 class="text-xl font-semibold mb-4">4. Academic Operations</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CreationCard
            v-for="item in academicOperations"
            :key="item.id"
            :title="item.title"
            :description="item.description"
            :status="item.status"
            :route="item.route"
            :disabled="!canAccessStep(4)"
            @click="navigateTo(item.route)"
          />
        </div>
      </div>

      <!-- Step 5: Scheduling -->
      <div class="step-section" :class="{ 'opacity-50': currentStep > 5 }">
        <h2 class="text-xl font-semibold mb-4">5. Scheduling</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CreationCard
            v-for="item in scheduling"
            :key="item.id"
            :title="item.title"
            :description="item.description"
            :status="item.status"
            :route="item.route"
            :disabled="!canAccessStep(5)"
            @click="navigateTo(item.route)"
          />
        </div>
      </div>

      <!-- Step 6: Supporting Features -->
      <div class="step-section" :class="{ 'opacity-50': currentStep > 6 }">
        <h2 class="text-xl font-semibold mb-4">6. Supporting Features</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CreationCard
            v-for="item in supportingFeatures"
            :key="item.id"
            :title="item.title"
            :description="item.description"
            :status="item.status"
            :route="item.route"
            :disabled="!canAccessStep(6)"
            @click="navigateTo(item.route)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import CreationCard from '@/pages/components/creation/CreationCard.vue';

const router = useRouter();
const currentStep = ref(1);

// Status types
type CreationStatus = 'pending' | 'in-progress' | 'completed' | 'disabled';

interface CreationItem {
  id: string;
  title: string;
  description: string;
  status: CreationStatus;
  route: string;
}

// Step 1: Basic Infrastructure
const basicInfrastructure = ref<CreationItem[]>([
  {
    id: 'faculty',
    title: 'Faculty',
    description: 'Create and manage faculties',
    status: 'pending',
    route: '/faculties'
  },
  {
    id: 'classroom',
    title: 'Classroom',
    description: 'Set up classroom facilities',
    status: 'pending',
    route: '/classrooms'
  },
  {
    id: 'facility',
    title: 'Facility',
    description: 'Configure general facilities',
    status: 'pending',
    route: '/facilities'
  },
  {
    id: 'timeslot',
    title: 'Time Slots',
    description: 'Define available time slots',
    status: 'pending',
    route: '/timeslots'
  },
  {
    id: 'academic-term',
    title: 'Academic Terms',
    description: 'Set up academic terms',
    status: 'pending',
    route: '/academic-terms'
  }
]);

// Step 2: Academic Structure
const academicStructure = ref<CreationItem[]>([
  {
    id: 'department',
    title: 'Departments',
    description: 'Create departments within faculties',
    status: 'disabled',
    route: '/departments'
  },
  {
    id: 'course',
    title: 'Courses',
    description: 'Define courses and their details',
    status: 'disabled',
    route: '/courses'
  },
  {
    id: 'course-package',
    title: 'Course Packages',
    description: 'Create course packages and bundles',
    status: 'disabled',
    route: '/course-packages'
  }
]);

// Step 3: Personnel
const personnel = ref<CreationItem[]>([
  {
    id: 'lecturer',
    title: 'Lecturers',
    description: 'Add and manage lecturers',
    status: 'disabled',
    route: '/lecturers'
  },
  {
    id: 'student',
    title: 'Students',
    description: 'Register and manage students',
    status: 'disabled',
    route: '/students'
  },
  {
    id: 'staff',
    title: 'Staff',
    description: 'Manage administrative staff',
    status: 'disabled',
    route: '/staff'
  }
]);

// Step 4: Academic Operations
const academicOperations = ref<CreationItem[]>([
  {
    id: 'enrollment',
    title: 'Enrollments',
    description: 'Manage student enrollments',
    status: 'disabled',
    route: '/enrollments'
  },
  {
    id: 'attendance',
    title: 'Attendance',
    description: 'Track student attendance',
    status: 'disabled',
    route: '/attendance'
  },
  {
    id: 'grade',
    title: 'Grades',
    description: 'Record and manage grades',
    status: 'disabled',
    route: '/grades'
  }
]);

// Step 5: Scheduling
const scheduling = ref<CreationItem[]>([
  {
    id: 'section-assignment',
    title: 'Section Assignments',
    description: 'Assign sections to classrooms and times',
    status: 'disabled',
    route: '/section-assignments'
  },
  {
    id: 'schedule-constraint',
    title: 'Schedule Constraints',
    description: 'Set up scheduling constraints',
    status: 'disabled',
    route: '/schedule-constraints'
  }
]);

// Step 6: Supporting Features
const supportingFeatures = ref<CreationItem[]>([
  {
    id: 'rfid',
    title: 'RFID Cards',
    description: 'Manage RFID card assignments',
    status: 'disabled',
    route: '/rfid-cards'
  }
]);

// Computed properties
const overallProgress = computed(() => {
  const totalItems = [
    ...basicInfrastructure.value,
    ...academicStructure.value,
    ...personnel.value,
    ...academicOperations.value,
    ...scheduling.value,
    ...supportingFeatures.value
  ];
  
  const completedItems = totalItems.filter(item => item.status === 'completed').length;
  return Math.round((completedItems / totalItems.length) * 100);
});

// Methods
const canAccessStep = (step: number) => {
  return currentStep.value >= step;
};

const navigateTo = (route: string) => {
  router.push(route);
};

// Watch for changes in creation status
const updateCreationStatus = (itemId: string, status: CreationStatus) => {
  const allItems = [
    ...basicInfrastructure.value,
    ...academicStructure.value,
    ...personnel.value,
    ...academicOperations.value,
    ...scheduling.value,
    ...supportingFeatures.value
  ];

  const item = allItems.find(i => i.id === itemId);
  if (item) {
    item.status = status;
    
    // Update current step based on completion
    if (status === 'completed') {
      const itemStep = getItemStep(itemId);
      if (itemStep === currentStep.value) {
        currentStep.value++;
      }
    }
  }
};

const getItemStep = (itemId: string): number => {
  if (basicInfrastructure.value.some(item => item.id === itemId)) return 1;
  if (academicStructure.value.some(item => item.id === itemId)) return 2;
  if (personnel.value.some(item => item.id === itemId)) return 3;
  if (academicOperations.value.some(item => item.id === itemId)) return 4;
  if (scheduling.value.some(item => item.id === itemId)) return 5;
  if (supportingFeatures.value.some(item => item.id === itemId)) return 6;
  return 1;
};
</script>

<style scoped>
.creation-sequencer {
  @apply p-6 max-w-7xl mx-auto;
}

.step-section {
  @apply bg-white rounded-lg shadow-md p-6;
}

.step-section:not(:last-child) {
  @apply mb-6;
}
</style>
