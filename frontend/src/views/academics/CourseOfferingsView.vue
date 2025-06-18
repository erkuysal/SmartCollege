<template>
  <div class="course-offerings">
    <PageHeader 
      title="Course Offerings"
      infoText="To enroll students, you must have an <b>active course offering</b> and its <b>semester must also be active</b>.<br>You can activate semesters in <a href='/academic-management?tab=semesters'>Academic Settings</a>."
    >
      <template #actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Add Course Offering
        </v-btn>
      </template>
    </PageHeader>

    <!-- Course Offerings Table -->
    <List
      :headers="['Course', 'Semester', 'Instructor', 'Capacity', 'Status']"
      :rows="listRows"
      :actions="listActions"
      :showActions="true"
      :loading="isLoading"
      :itemsPerPage="10"
      :sortableColumns="['Course', 'Semester', 'Instructor', 'Capacity', 'Status']"
    />

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="800px">
      <v-card>
        <v-card-title class="text-h5">
          {{ isEditing ? 'Edit Course Offering' : 'Add Course Offering' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="isFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.course"
                  label="Course"
                  :items="courses"
                  item-title="name"
                  item-value="id"
                  :rules="[v => !!v || 'Course is required']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.semester"
                  label="Semester"
                  :items="semesters"
                  item-title="full_name"
                  item-value="id"
                  :rules="[v => !!v || 'Semester is required']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-alert
                  v-if="selectedSemester && !selectedSemester.is_active"
                  type="info"
                  class="mb-2"
                >
                  The selected semester <b>{{ selectedSemester.full_name }}</b> is not active. You must activate it in <router-link to="/academic-management?tab=semesters">Academic Settings</router-link> before students can enroll.
                </v-alert>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.instructor"
                  label="Instructor"
                  :items="lecturers"
                  :item-title="(item) => `${item.first_name} ${item.last_name}`"
                  item-value="id"
                  :rules="[v => !!v || 'Instructor is required']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.capacity"
                  label="Capacity"
                  type="number"
                  :rules="[
                    v => !!v || 'Capacity is required',
                    v => v > 0 || 'Capacity must be greater than 0'
                  ]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="form.is_active"
                  label="Active"
                  color="primary"
                ></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="closeDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveCourseOffering"
            :loading="isSaving"
            :disabled="!isFormValid"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Delete Course Offering</v-card-title>
        <v-card-text>
          Are you sure you want to delete this course offering?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            @click="deleteCourseOffering"
            :loading="isDeleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { useAcademicStore } from '@/client/stores/academic'
import { useCoursesStore } from '@/client/stores/courses'
import { useLecturersStore } from '@/client/stores/lecturers'
import type { CourseOffering, Course, Semester, Lecturer } from '@/client/api'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import List from '@/components/common/List.vue'

const academicStore = useAcademicStore()
const coursesStore = useCoursesStore()
const lecturersStore = useLecturersStore()
const route = useRoute()
const router = useRouter()

// State
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const isFormValid = ref(false)
const isEditing = ref(false)
const selectedOffering = ref<CourseOffering | null>(null)
const form = reactive({
  course: 0,
  semester: 0,
  instructor: 0,
  capacity: 30,
  is_active: true
})

const formRef = ref()

// Headers for the data table
const headers = [
  { title: 'Course', key: 'course', sortable: true },
  { title: 'Semester', key: 'semester', sortable: true },
  { title: 'Instructor', key: 'instructor', sortable: true },
  { title: 'Capacity', key: 'capacity', sortable: true },
  { title: 'Status', key: 'is_active', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Computed properties
const courseOfferings = computed(() => academicStore.courseOfferings)
const courses = computed(() => coursesStore.courses)
const semesters = computed(() => academicStore.semesters)
const lecturers = computed(() => lecturersStore.lecturers)
const selectedSemester = computed(() => {
  return semesters.value.find(s => s.id === form.semester)
})

const listRows = computed(() =>
  courseOfferings.value.map(offering => ({
    id: offering.id,
    course: getCourseName(offering.course),
    semester: getSemesterName(offering.semester),
    instructor: getLecturerName(offering.instructor),
    capacity: offering.capacity,
    status: offering.is_active ? 'Active' : 'Inactive',
    statusClass: offering.is_active ? 'success' : 'error',
    _raw: offering
  }))
)

const listActions = [
  {
    label: 'Edit',
    icon: 'mdi-pencil',
    color: 'primary',
    handler: (row: any) => openEditDialog(row._raw)
  },
  {
    label: 'Delete',
    icon: 'mdi-delete',
    color: 'error',
    handler: (row: any) => confirmDelete(row._raw)
  }
]

// Methods
const fetchData = async () => {
  isLoading.value = true
  try {
    await Promise.all([
      academicStore.fetchCourseOfferings(),
      coursesStore.fetchCourses(),
      academicStore.fetchSemesters(),
      lecturersStore.fetchLecturers()
    ])
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  form.course = courses.value[0]?.id || 0
  form.semester = semesters.value[0]?.id || 0
  form.instructor = lecturers.value[0]?.id || 0
  form.capacity = 30
  form.is_active = true
  nextTick(() => {
    formRef.value?.resetValidation()
  })
}

const closeDialog = () => {
  showDialog.value = false
  nextTick(() => {
    formRef.value?.reset()
    formRef.value?.resetValidation()
  })
}

const openCreateDialog = () => {
  isEditing.value = false
  resetForm()
  // Pre-fill from query params if available
  const courseId = Number(route.query.course)
  const semesterId = Number(route.query.semester)
  const instructorId = Number(route.query.instructor)
  if (courseId && courses.value.some(c => c.id === courseId)) {
    form.course = courseId
  }
  if (semesterId && semesters.value.some(s => s.id === semesterId)) {
    form.semester = semesterId
  }
  if (instructorId && lecturers.value.some(l => l.id === instructorId)) {
    form.instructor = instructorId
  }
  showDialog.value = true
}

const openEditDialog = (offering: CourseOffering) => {
  isEditing.value = true
  selectedOffering.value = offering
  form.course = offering.course
  form.semester = offering.semester
  form.instructor = offering.instructor
  form.capacity = offering.capacity
  form.is_active = offering.is_active
  nextTick(() => {
    formRef.value?.resetValidation()
  })
  showDialog.value = true
}

const extractId = (val: any) => (typeof val === 'object' && val !== null && 'id' in val) ? val.id : val;

const saveCourseOffering = async () => {
  if (!form.course || !form.semester || !form.instructor) {
    console.error('Required fields are missing')
    return
  }

  isSaving.value = true
  try {
    const payload = {
      course: extractId(form.course),
      semester: extractId(form.semester),
      instructor: extractId(form.instructor),
      capacity: Number(form.capacity),
      is_active: !!form.is_active
    };
    // Debug: check for cyclic structure
    try {
      JSON.stringify(payload)
    } catch (e) {
      console.error('Payload is not serializable:', e, payload)
      throw e
    }
    if (isEditing.value && selectedOffering.value) {
      await academicStore.editCourseOffering(selectedOffering.value.id, payload)
    } else {
      await academicStore.addCourseOffering(payload)
    }
    closeDialog()
    await fetchData()
  } catch (error) {
    console.error('Error saving course offering:', error)
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (offering: CourseOffering) => {
  selectedOffering.value = offering
  showDeleteDialog.value = true
}

const deleteCourseOffering = async () => {
  if (!selectedOffering.value) return
  
  isDeleting.value = true
  try {
    await academicStore.removeCourseOffering(selectedOffering.value.id)
    showDeleteDialog.value = false
    await fetchData()
  } catch (error) {
    console.error('Error deleting course offering:', error)
  } finally {
    isDeleting.value = false
  }
}

const getCourseName = (courseId: number) => {
  const course = courses.value.find(c => c.id === courseId)
  return course ? course.name : 'Unknown Course'
}

const getSemesterName = (semesterId: number) => {
  const semester = semesters.value.find(s => s.id === semesterId)
  return semester ? semester.full_name : 'Unknown Semester'
}

const getLecturerName = (lecturerId: number) => {
  const lecturer = lecturers.value.find((l: Lecturer) => l.id === lecturerId)
  return lecturer ? `${lecturer.first_name} ${lecturer.last_name}` : 'Unknown Lecturer'
}

// Automatically open the dialog if query params are present
watch(
  () => route.query,
  (query) => {
    if (query.fromCourseDetails === 'true') {
      openCreateDialog()
      // Remove the flag from the URL
      const { fromCourseDetails, ...rest } = query
      router.replace({ query: rest })
    }
  },
  { immediate: true }
)

// Lifecycle hooks
onMounted(fetchData)
</script>

<style scoped>
.course-offerings {
  padding: 20px;
}

.v-data-table {
  background: transparent !important;
}
</style> 