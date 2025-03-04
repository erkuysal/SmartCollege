<template>
  <v-container fluid class="py-4 px-4">
    <v-toolbar flat>
      <v-btn icon class="mr-2" @click="router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>
        <span class="text-h6">{{ course?.name || 'Course Details' }}</span>
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
        <p><strong>Course Code:</strong> {{ course?.code }}</p>
        <p><strong>Description:</strong> {{ course?.description }}</p>
        <p><strong>Lecturer:</strong> {{ getLecturerName(course?.lecturer) }}</p>
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
            :disabled="!selectedStudent"
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
import { useCourseStore } from '@/utils/stores/college/courseStore';
import { useLecturerStore } from '@/utils/stores/users/lecturerStore';
import { useStudentStore } from '@/utils/stores/users/studentStore';
import type { Course, PopulatedCourse, CourseEnrollment } from '@/utils/interfaces/college/courseInterface';
import type { Student } from '@/utils/interfaces/users/studentInterface';

const route = useRoute();
const router = useRouter();
const courseStore = useCourseStore();
const lecturerStore = useLecturerStore();
const studentStore = useStudentStore();

const course = ref<Course | PopulatedCourse | null>(null);
const loading = ref(false);
const dialogVisible = ref(false);
const selectedStudent = ref<number | null>(null);

// Computed properties for better reactivity
const enrolledStudents = computed(() => {
  if (!course.value) return [];
  return courseStore.enrollments
    .filter(enrollment => enrollment.course === course.value?.id)
    .map(enrollment => {
      const student = studentStore.items.find(s => s.id === enrollment.student);
      return student ? {
        ...student,
        full_name: `${student.first_name} ${student.last_name}`,
        enrollment_id: enrollment.id
      } : null;
    })
    .filter(student => student !== null);
});

const availableStudents = computed(() => {
  if (!course.value) return [];
  const enrolledIds = new Set(
    courseStore.enrollments
      .filter(enrollment => enrollment.course === course.value?.id)
      .map(enrollment => enrollment.student)
  );
  return studentStore.items
    .filter(student => !enrolledIds.has(student.id))
    .map(student => ({
      ...student,
      full_name: `${student.first_name} ${student.last_name}`
    }));
});

const headers = [
  { title: 'Name', key: 'full_name', align: 'start' as const },
  { title: 'Student ID', key: 'student_id', align: 'start' as const },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const }
];

function getLecturerName(lecturerId: number | { id: number; first_name: string; last_name: string; } | undefined): string {
  if (!lecturerId) return 'Not Assigned';
  if (typeof lecturerId === 'number') {
    const lecturer = lecturerStore.lecturerById(lecturerId);
    return lecturer ? `${lecturer.first_name} ${lecturer.last_name}` : 'Unknown Lecturer';
  }
  return `${lecturerId.first_name} ${lecturerId.last_name}`;
}

async function openAddStudentDialog() {
  selectedStudent.value = null;
  // Ensure we have the latest student data
  await studentStore.fetchStudents();
  dialogVisible.value = true;
}

async function addStudent() {
  if (!selectedStudent.value || !course.value) return;

  loading.value = true;
  try {
    await courseStore.enrollStudent(course.value.id, selectedStudent.value);
    await courseStore.fetchCourseEnrollments(course.value.id);
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
    await courseStore.unenrollStudent(course.value.id, student.enrollment_id);
    await courseStore.fetchCourseEnrollments(course.value.id);
  } catch (error) {
    console.error('Error removing student:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const courseId = parseInt(route.params.id as string);
  loading.value = true;
  try {
    await Promise.all([
      studentStore.fetchStudents(),
      lecturerStore.fetchLecturers()
    ]);

    await courseStore.fetchCourseById(courseId);
    course.value = courseStore.selectedItem;
    if (course.value) {
      await courseStore.fetchCourseEnrollments(course.value.id);
    }
  } catch (error) {
    console.error('Error loading course details:', error);
  } finally {
    loading.value = false;
  }
});
</script>
