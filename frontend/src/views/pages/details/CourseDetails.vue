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
            @click="removeStudent(item.raw)"
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
import { useTeacherStore } from '@/utils/stores/users/teacherStore';
import { useStudentStore } from '@/utils/stores/users/studentStore';
import type { Course, PopulatedCourse } from '@/utils/interfaces/college/courseInterface';
import type { Student } from '@/utils/interfaces/users/studentInterface';

const route = useRoute();
const router = useRouter();
const courseStore = useCourseStore();
const teacherStore = useTeacherStore();
const studentStore = useStudentStore();

const course = ref<Course | PopulatedCourse | null>(null);
const loading = ref(false);
const dialogVisible = ref(false);
const selectedStudent = ref<number | null>(null);

// Computed properties for better reactivity
const enrolledStudents = computed(() => {
  if (!course.value) return [];
  const enrollments = courseStore.getEnrollmentsByCourse(course.value.id);
  return enrollments
    .map(enrollment => studentStore.studentById(enrollment.student))
    .filter((student): student is Student => student !== undefined)
    .map(student => ({
      ...student,
      full_name: `${student.first_name} ${student.last_name}`
    }));
});

const availableStudents = computed(() => {
  if (!course.value) return [];
  const enrolledIds = new Set(
    courseStore.getEnrollmentsByCourse(course.value.id)
      .map(enrollment => enrollment.student)
  );
  return studentStore.students
    .filter(student => !enrolledIds.has(student.id))
    .map(student => ({
      ...student,
      full_name: `${student.first_name} ${student.last_name}`
    }));
});

const headers = [
  { title: 'Name', key: 'full_name', align: 'start' },
  { title: 'Student ID', key: 'student_number', align: 'start' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

function getTeacherName(teacherId: number | undefined): string {
  if (!teacherId) return 'Not Assigned';
  const teacher = teacherStore.teacherById(teacherId);
  return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown Teacher';
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
    await courseStore.createEnrollment({
      student: selectedStudent.value,
      course: course.value.id
    });
    await courseStore.fetchEnrollments({ course: course.value.id });
    dialogVisible.value = false;
  } catch (error) {
    console.error('Error enrolling student:', error);
  } finally {
    loading.value = false;
  }
}

async function removeStudent(student: Student) {
  if (!course.value || !confirm('Are you sure you want to remove this student from the course?')) return;

  loading.value = true;
  try {
    const enrollment = courseStore.getEnrollmentsByCourse(course.value.id)
      .find(e => e.student === student.id);

    if (enrollment) {
      await courseStore.deleteEnrollment(enrollment.id);
      await courseStore.fetchEnrollments({ course: course.value.id });
    }
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
      teacherStore.fetchTeachers()
    ]);

    await courseStore.fetchCourses({ id: courseId });
    course.value = courseStore.currentCourse;
    if (course.value) {
      await courseStore.fetchEnrollments({ course: course.value.id });
    }
  } catch (error) {
    console.error('Error loading course details:', error);
  } finally {
    loading.value = false;
  }
});
</script>
