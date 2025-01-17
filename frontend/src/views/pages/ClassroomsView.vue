<template>
  <v-container fluid class="py-4 px-4">
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon left class="mr-2">mdi-door-closed</v-icon>
        <span class="text-h6">Classrooms</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn color="primary" variant="tonal" @click="toggleViewMode">
        <v-icon left>
          {{ viewMode === 'table' ? 'mdi-view-grid' : 'mdi-table' }}
        </v-icon>
        Switch to {{ viewMode === 'table' ? 'Card' : 'Table' }} View
      </v-btn>

      <v-btn color="primary" @click="openAddClassroomDialog">
        <v-icon>mdi-plus</v-icon>
        Add Classroom
      </v-btn>
    </v-toolbar>

    <!-- Table View -->
    <v-data-table
      v-if="viewMode === 'table'"
      :headers="headers"
      :items="collegeStore.classrooms"
      :loading="collegeStore.loading"
    >
      <template #item.actions="{ item }">
        <v-btn
          color="info"
          size="small"
          variant="text"
          class="me-2"
          @click="viewClassroomDetails(item)"
        >
          <v-icon>mdi-calendar</v-icon>
          Schedule
        </v-btn>
        <v-btn
          color="primary"
          size="small"
          variant="text"
          class="me-2"
          @click="editClassroom(item)"
        >
          <v-icon>mdi-pencil</v-icon>
          Edit
        </v-btn>
        <v-btn
          color="error"
          size="small"
          variant="text"
          @click="deleteClassroom(item)"
        >
          <v-icon>mdi-delete</v-icon>
          Delete
        </v-btn>
      </template>
    </v-data-table>

    <!-- Card View -->
    <v-row v-else>
      <v-col
        v-for="classroom in collegeStore.classrooms"
        :key="classroom.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card>
          <v-card-title>{{ classroom.name }}</v-card-title>
          <v-card-text>
            <div>Capacity: {{ classroom.capacity }}</div>
            <div v-if="classroom.building">Building: {{ classroom.building }}</div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="info"
              variant="text"
              @click="viewClassroomDetails(classroom)"
            >
              Schedule
            </v-btn>
            <v-btn
              color="primary"
              variant="text"
              @click="editClassroom(classroom)"
            >
              Edit
            </v-btn>
            <v-btn
              color="error"
              variant="text"
              @click="deleteClassroom(classroom)"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Classroom Details Dialog -->
    <ClassroomDetails
      v-model="dialogVisible"
      :editing-classroom="selectedClassroom"
      @saved="reloadData"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCollegeStore } from '@/utils/stores/collegeStore';
import { useTeacherStore } from '@/utils/stores/teacherStore';
import type { Classroom } from '@/utils/interfaces/collegeInterface';
import ClassroomDetails from './details/ClassroomDetails.vue';

const collegeStore = useCollegeStore();
const teacherStore = useTeacherStore();

// State
const viewMode = ref<'table' | 'card'>('table');
const dialogVisible = ref(false);
const selectedClassroom = ref<Classroom | null>(null);

// Headers for data table
const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Capacity', key: 'capacity' },
  { title: 'Building', key: 'building' },
  { title: 'Actions', key: 'actions', sortable: false }
];

// Methods
function toggleViewMode() {
  viewMode.value = viewMode.value === 'table' ? 'card' : 'table';
}

function viewClassroomDetails(classroom: Classroom) {
  selectedClassroom.value = classroom;
  dialogVisible.value = true;
}

function editClassroom(classroom: Classroom) {
  selectedClassroom.value = classroom;
  dialogVisible.value = true;
}

async function deleteClassroom(classroom: Classroom) {
  if (confirm('Are you sure you want to delete this classroom?')) {
    try {
      await collegeStore.deleteClassroom(classroom.id);
    } catch (error) {
      console.error('Error deleting classroom:', error);
    }
  }
}

function openAddClassroomDialog() {
  selectedClassroom.value = null;
  dialogVisible.value = true;
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    collegeStore.fetchClassrooms(),
    collegeStore.fetchCourses(),
    teacherStore.fetchTeachers()
  ]);
});
</script>