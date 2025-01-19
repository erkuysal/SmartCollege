<template>
  <v-container fluid class="py-4 px-4">
    <v-toolbar flat>
      <v-btn icon class="mr-2" @click="router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>
        <span class="text-h6">{{ course?.title || 'Course Details' }}</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn color="primary" @click="openAddStudentDialog">
        <v-icon>mdi-account-plus</v-icon>
        Add Student
      </v-btn>
    </v-toolbar>

    <!-- Course Information -->
    <v-card class="mt-4">
      <v-card-text>
        <p><strong>Description:</strong> {{ course?.description }}</p>
        <p><strong>Teacher:</strong> {{ getTeacherName(course?.teacher) }}</p>
      </v-card-text>
    </v-card>

    <!-- Students Table -->
    <v-card class="mt-4">
      <v-card-title>Enrolled Students</v-card-title>
      <v-data-table
        :headers="headers"
        :items="enrolledStudents"
        :loading="loading"
      >
        <template #item.actions="{ item }">
          <v-btn
            color="error"
            size="small"
            variant="text"
            @click="removeStudent(item)"
          >
            <v-icon>mdi-account-remove</v-icon>
            Remove
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add Student Dialog -->
    <v-dialog v-model="dialogVisible" max-width="500px">
      <v-card>
        <v-card-title>Add Student to Course</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedStudent"
            :items="availableStudents"
            item-title="full_name"
            item-value="id"
            label="Select Student"
            required
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="dialogVisible = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="addStudent"
            :loading="loading"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCollegeStore } from '@/utils/stores/collegeStore';
import { useTeacherStore } from '@/utils/stores/teacherStore';
import type { Course } from '@/utils/interfaces/collegeInterface';

const route = useRoute();
const router = useRouter();
const collegeStore = useCollegeStore();
const teacherStore = useTeacherStore();

const course = ref<Course | null>(null);
const loading = ref(false);
const dialogVisible = ref(false);
const selectedStudent = ref<number | null>(null);
const enrolledStudents = ref([]);
const availableStudents = ref([]);

const headers = [
  { title: 'Name', key: 'full_name' },
  { title: 'Student ID', key: 'student_id' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

function getTeacherName(teacherId: number | null): string {
  if (!teacherId) return 'Not Assigned';
  const teacher = teacherStore.teacherById(teacherId);
  return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown Teacher';
}

function openAddStudentDialog() {
  selectedStudent.value = null;
  dialogVisible.value = true;
}

async function addStudent() {
  if (!selectedStudent.value || !course.value) return;
  
  loading.value = true;
  try {
    // Add API call to enroll student
    await collegeStore.enrollStudent(course.value.id, selectedStudent.value);
    await fetchEnrolledStudents();
    dialogVisible.value = false;
  } catch (error) {
    console.error('Error enrolling student:', error);
  } finally {
    loading.value = false;
  }
}

async function removeStudent(student: any) {
  if (!course.value || !confirm('Are you sure you want to remove this student from the course?')) return;

  loading.value = true;
  try {
    // Add API call to remove student
    await collegeStore.removeStudentFromCourse(course.value.id, student.id);
    await fetchEnrolledStudents();
  } catch (error) {
    console.error('Error removing student:', error);
  } finally {
    loading.value = false;
  }
}

async function fetchEnrolledStudents() {
  if (!course.value) return;
  
  loading.value = true;
  try {
    // Add API call to get enrolled students
    enrolledStudents.value = await collegeStore.getCourseStudents(course.value.id);
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
  } finally {
    loading.value = false;
  }
}

async function fetchAvailableStudents() {
  try {
    // Add API call to get available students
    availableStudents.value = await collegeStore.getAvailableStudents(course.value?.id);
  } catch (error) {
    console.error('Error fetching available students:', error);
  }
}


onMounted(async () => {
  const courseId = parseInt(route.params.id as string);
  try {
    course.value = await collegeStore.getCourseById(courseId);
    await Promise.all([
      fetchEnrolledStudents(),
      fetchAvailableStudents(),
      teacherStore.fetchTeachers()
    ]);
  } catch (error) {
    console.error('Error loading course details:', error);
  }
});
</script>
