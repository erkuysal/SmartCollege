<template>
  <div class="course-details-view">
    <PageHeader :title="course?.name || 'Course Details'">
      <template #subtitle>
        <div class="course-subtitle">
          <v-chip size="small" color="primary" variant="tonal" class="course-code">
            {{ course?.code }}
          </v-chip>
          <v-chip size="small" color="info" variant="tonal">
            {{ course?.semester }}
          </v-chip>
          <v-chip size="small" color="secondary" variant="tonal">
            {{ course?.instructor_name }}
          </v-chip>
        </div>
      </template>
      <div class="header-actions">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          @click="router.back()"
          class="back-button"
        />
        <v-btn
          color="success"
          prepend-icon="mdi-play-circle"
          @click="startAttendance"
        >
          Start Attendance
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-pencil"
          @click="showEditModal = true"
        >
          Edit Course
        </v-btn>
      </div>
    </PageHeader>

    <!-- Main Content -->
    <div class="view-content">
      <!-- Loading State -->
      <v-progress-circular
        v-if="isLoading"
        indeterminate
        color="primary"
        class="loading-spinner"
      />

      <!-- Error State -->
      <v-alert
        v-else-if="error"
        type="error"
        variant="tonal"
        class="error-alert"
      >
        {{ error }}
      </v-alert>

      <template v-else>
        <v-card class="mt-4 attendance-card">
          <v-tabs v-model="activeTab" color="primary">
            <v-tab value="attendance">
              <v-icon start>mdi-calendar-check</v-icon> Attendance Logs
            </v-tab>
            <v-tab value="enrolled">
              <v-icon start>mdi-account-group</v-icon> Enrolled Students
            </v-tab>
          </v-tabs>
          <v-window v-model="activeTab">
            <v-window-item value="attendance">
              <v-card-text>
                <v-list v-if="!isLoadingSessions && courseSessions.length">
                  <v-list-item
                    v-for="session in courseSessions"
                    :key="session.id"
                    :title="session.name"
                    :subtitle="formatDate(session.start_time) + ' — ' + (session.end_time ? formatDate(session.end_time) : 'Active')"
                  >
                    <template v-slot:prepend>
                      <v-avatar color="info">
                        <v-icon>mdi-calendar-check</v-icon>
                      </v-avatar>
                    </template>
                    <template v-slot:append>
                      <v-chip :color="session.is_active ? 'success' : 'grey'" size="small" class="mr-2">
                        {{ session.is_active ? 'Active' : 'Ended' }}
                      </v-chip>
                      <v-btn icon="mdi-eye" size="small" color="primary" variant="text" @click="viewSessionDetails(session)" />
                    </template>
                  </v-list-item>
                </v-list>
                <v-alert v-else-if="!isLoadingSessions" type="info" variant="tonal">No attendance logs found.</v-alert>
                <v-progress-circular v-else indeterminate color="primary" class="my-4" />
              </v-card-text>
            </v-window-item>
            <v-window-item value="enrolled">
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="text-h6">Enrolled Students</h3>
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-account-plus"
                    @click="showEnrollModal = true"
                  >
                    Enroll Student
                  </v-btn>
                </div>
                <v-list v-if="!isLoadingEnrolled && enrolledStudents.length">
                  <v-list-item
                    v-for="student in enrolledStudents"
                    :key="student.id"
                    :title="student.first_name + ' ' + student.last_name"
                    :subtitle="student.student_number"
                  >
                    <template v-slot:prepend>
                      <v-avatar color="primary">
                        <span class="text-h6 text-white">
                          {{ (student.first_name?.[0] || '') + (student.last_name?.[0] || '') }}
                        </span>
                      </v-avatar>
                    </template>
                    <template v-slot:append>
                      <v-chip :color="student.is_active ? 'success' : 'grey'" size="small">
                        {{ student.is_active ? 'Active' : 'Inactive' }}
                      </v-chip>
                      <v-btn
                        icon="mdi-delete"
                        size="small"
                        color="error"
                        variant="text"
                        @click="handleUnenrollStudent(student)"
                        class="ml-2"
                      />
                    </template>
                  </v-list-item>
                </v-list>
                <v-alert v-else-if="!isLoadingEnrolled" type="info" variant="tonal">No students enrolled in this course.</v-alert>
                <v-progress-circular v-else indeterminate color="primary" class="my-4" />
              </v-card-text>
            </v-window-item>
          </v-window>
        </v-card>
      </template>
    </div>

    <!-- Edit Course Dialog (optional, for future) -->
    <v-dialog
      v-model="showEditModal"
      max-width="500px"
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start color="primary">mdi-book-edit</v-icon>
          Edit Course
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="editingCourseName"
              label="Course Name"
              required
              variant="outlined"
              prepend-inner-icon="mdi-book"
            />
            <v-text-field
              v-model="editingCourseCode"
              label="Course Code"
              required
              variant="outlined"
              prepend-inner-icon="mdi-identifier"
            />
            <v-text-field
              v-model="editingSemester"
              label="Semester"
              required
              variant="outlined"
              prepend-inner-icon="mdi-calendar"
            />
            <v-text-field
              v-model="editingInstructor"
              label="Lecturer"
              required
              variant="outlined"
              prepend-inner-icon="mdi-account"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showEditModal = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="showEditModal = false"
            prepend-icon="mdi-content-save"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showScanModal" max-width="500px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="d-flex flex-column">
            <span>Attendance Session</span>
            <span class="text-caption text-grey">{{ course?.name }} - {{ course?.code }}</span>
          </div>
          <v-btn icon @click="stopContinuousScan" color="error">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-subtitle-1">Session Status: {{ isContinuousScanning ? 'Active' : 'Inactive' }}</div>
            <v-chip :color="isContinuousScanning ? 'success' : 'error'" size="small">
              {{ isContinuousScanning ? 'Scanning' : 'Stopped' }}
            </v-chip>
          </div>

          <div v-if="scannedStudents.length === 0" class="text-center text-grey">No cards scanned yet...</div>
          <v-list v-else>
            <v-list-item
              v-for="(student, index) in scannedStudents"
              :key="index"
              :title="student.student_number"
              :subtitle="formatDate(student.timestamp)"
            >
              <template v-slot:prepend>
                <v-icon color="success" icon="mdi-check-circle" />
              </template>
              <template v-slot:append>
                <div class="text-caption">
                  <div>UID: {{ student.uid }}</div>
                  <div v-if="student.message" class="text-success">{{ student.message }}</div>
                </div>
              </template>
            </v-list-item>
          </v-list>
          <v-alert v-if="scanError" type="error" variant="tonal" class="mt-4">{{ scanError }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" @click="stopContinuousScan">End Session</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Prerequisite warning above enroll modal -->
    <v-alert v-if="!hasActiveOffering && !isLoadingPrereqs" type="warning" class="mb-4">
      <strong>Prerequisite:</strong>
      To enroll students, you must have an <b>active course offering</b> and its <b>semester must also be active</b>.<br>
      <span v-if="activeSemester && !activeSemester.is_active">
        The semester <b>{{ activeSemester.full_name }}</b> is not active.
        <router-link to="/academic-management?tab=semesters">Go to Semesters</router-link>
      </span>
    </v-alert>

    <v-dialog v-model="showEnrollModal" max-width="500px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start color="primary">mdi-account-plus</v-icon>
          Enroll Student
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleEnrollStudent">
            <v-autocomplete
              v-model="enrollingUserNumber"
              :items="filteredStudents"
              :loading="isSearchingStudents"
              :search-input.sync="searchQuery"
              item-title="first_name"
              item-value="id"
              label="Search Student"
              placeholder="Start typing to search..."
              prepend-inner-icon="mdi-account-search"
              :error-messages="enrollError"
              return-object
              @update:search="searchStudents"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-avatar color="primary">
                      <span class="text-h6 text-white">
                        {{ (item.raw.first_name?.[0] || '') + (item.raw.last_name?.[0] || '') }}
                      </span>
                    </v-avatar>
                  </template>
                  <v-list-item-title>
                    {{ item.raw.first_name }} {{ item.raw.last_name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.raw.user_number }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-autocomplete>
            <v-alert v-if="enrollError === 'No active course offering found for this course'" type="info" color="warning" class="mt-2">
              {{ missingOfferingMessage }}
              <v-btn color="primary" variant="text" @click="redirectToCreateOffering">Create Offering</v-btn>
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showEnrollModal = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="handleEnrollStudent"
            :loading="isEnrolling"
            :disabled="!enrollingUserNumber || !hasActiveOffering"
            prepend-icon="mdi-account-plus"
          >
            Enroll
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCoursesStore } from '@/client/stores/courses.ts'
import { useSessionsStore } from '@/client/stores/sessions.ts'
import { useRfidStore } from '@/client/stores/rfid.ts'
import { useStudentsStore } from '@/client/stores/students.ts'
import { markAttendance, getEnrolledStudents, enrollStudent, unenrollStudent, getCourseOfferings, getSemesters } from '@/client/api.ts'
import type { AttendanceSession, Student, CourseOffering, Semester } from '@/client/api.ts'
import PageHeader from '@/components/common/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const coursesStore = useCoursesStore()
const sessionsStore = useSessionsStore()
const rfidStore = useRfidStore()
const studentsStore = useStudentsStore()

const isLoading = ref(true)
const error = ref<string | null>(null)
const showEditModal = ref(false)

const editingCourseName = ref('')
const editingCourseCode = ref('')
const editingSemester = ref('')
const editingInstructor = ref('')

const courseId = computed(() => Number(route.params.id))
const course = computed(() => coursesStore.getCourseById(courseId.value))

const showScanModal = ref(false)
const createdSessionId = ref<number | null>(null)

const isContinuousScanning = ref(false)
const scannedStudents = ref<Array<{
  student_number: string;
  uid: string;
  timestamp: string;
  message?: string;
}>>([])
const scanError = ref('')

const isLoadingSessions = ref(false)
const courseSessions = computed(() =>
  sessionsStore.sessions.filter(session => session.course === courseId.value)
)

const activeTab = ref('attendance')
const enrolledStudents = ref<Student[]>([])
const isLoadingEnrolled = ref(false)
const enrolledError = ref<string | null>(null)

const showEnrollModal = ref(false)
const enrollingUserNumber = ref<Student | null>(null)
const isEnrolling = ref(false)
const enrollError = ref('')

const availableStudents = computed(() => studentsStore.students)
const isSearchingStudents = ref(false)
const searchQuery = ref('')

const offerings = ref<CourseOffering[]>([])
const semesters = ref<Semester[]>([])
const isLoadingPrereqs = ref(true)

const filteredStudents = computed(() => {
  const enrolledUserNumbers = new Set(enrolledStudents.value.map(s => s.user_number))
  return availableStudents.value.filter(student => !enrolledUserNumbers.has(student.user_number))
})

const searchStudents = async (query: string) => {
  if (!query) {
    await studentsStore.fetchStudents()
    return
  }
  
  if (query.length < 2) return
  
  isSearchingStudents.value = true
  try {
    await studentsStore.fetchStudents({ search: query })
  } catch (err) {
    console.error('Error searching students:', err)
  } finally {
    isSearchingStudents.value = false
  }
}

const sessionHeaders = [
  { title: 'Session Name', key: 'name' },
  { title: 'Start Time', key: 'start_time' },
  { title: 'End Time', key: 'end_time' },
  { title: 'Status', key: 'is_active' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const enrolledHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Student Number', key: 'student_number' },
  { title: 'Email', key: 'email' },
  { title: 'Status', key: 'is_active' }
]

watch(() => rfidStore.isContinuousScanning, (val) => {
  console.log('[DEBUG] isContinuousScanning changed:', val)
  isContinuousScanning.value = val
})
watch(() => rfidStore.scannedStudents, (newStudents) => {
  console.log('[DEBUG] RFID Store scanned students changed:', newStudents)

  // Process each new student
  newStudents.forEach(student => {
    // Check if this student has already been processed
    const isAlreadyProcessed = scannedStudents.value.some(
      existing => existing.uid === student.uid
    )

    if (!isAlreadyProcessed) {
      console.log('[DEBUG] Processing new student scan:', student)
      handleStudentAttendance(student)
    } else {
      console.log('[DEBUG] Student already processed:', student)
    }
  })
}, { deep: true })
watch(() => rfidStore.error, (val) => {
  console.log('[DEBUG] rfidStore error changed:', val)
  scanError.value = val
})

const fetchCourseDetails = async () => {
  try {
    isLoading.value = true
    error.value = null
    if (!course.value) {
      await coursesStore.fetchCourses()
    }
    if (course.value) {
      editingCourseName.value = course.value.name
      editingCourseCode.value = course.value.code
      editingSemester.value = course.value.semester
      editingInstructor.value = course.value.instructor_name
    } else {
      error.value = 'Course not found'
    }
  } catch (err) {
    error.value = 'Failed to fetch course details'
  } finally {
    isLoading.value = false
  }
}

const handleStudentAttendance = async (student: any) => {
  if (!createdSessionId.value) {
    console.error('[DEBUG] No active session ID')
    return
  }

  if (!student.student_number || !student.uid) {
    console.error('[DEBUG] Invalid student data:', student)
    scanError.value = 'Invalid student data from RFID scan'
    return
  }

  try {
    console.log('[DEBUG] Recording attendance for student:', student)
    const response = await markAttendance({
      session: createdSessionId.value,
      user_number: student.student_number,
      uid: student.uid
    })
    console.log('[DEBUG] Attendance API response:', response.data)

    if (response.data.status === 'ok' || response.data.status === 'success') {
      // Add the new attendance record to the list
      const newAttendance = {
        student_number: student.student_number,
        uid: student.uid,
        timestamp: new Date().toISOString(),
        message: response.data.message || 'Attendance recorded successfully'
      }

      // Update the scannedStudents array reactively
      scannedStudents.value = [...scannedStudents.value, newAttendance]
      console.log('[DEBUG] Updated scannedStudents:', scannedStudents.value)
    } else {
      throw new Error(response.data.message || 'Failed to record attendance')
    }
  } catch (e: any) {
    console.error('[DEBUG] Failed to record attendance:', e)
    scanError.value = e.response?.data?.detail || e.message || 'Failed to record attendance. Please try again.'
  }
}

const startAttendance = async () => {
  console.group('🔍 Start Attendance Process')
  console.log('Course Info:', {
    id: courseId.value,
    name: course.value?.name,
    code: course.value?.code
  })
  
  if (!course.value) {
    console.error('❌ Course not found:', {
      courseId: courseId.value,
      storeState: coursesStore
    })
    console.groupEnd()
    return
  }

  try {
    error.value = null
    scannedStudents.value = []

    // Generate session name
    const today = new Date()
    const formattedDate = today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/')
    const sessionName = `${course.value.code} - ${formattedDate}`

    // Create session
    console.group('📝 Creating Session')
    console.log('Session params:', {
      course: course.value.id,
      name: sessionName
    })
    
    const session = await sessionsStore.startNewSession({
      course: course.value.id,
      name: sessionName
    })
    
    if (!session) {
      console.error('❌ Session creation failed - no session returned')
      console.groupEnd()
      return
    }

    if (!session.id) {
      console.error('❌ Session creation failed - no session ID', session)
      console.groupEnd()
      return
    }
    console.log('✅ Session created:', session)
    console.groupEnd()

    // Store session info
    const sessionInfo = {
      id: session.id,
      name: session.name,
      startTime: new Date().toISOString()
    }
    localStorage.setItem('currentSession', JSON.stringify(sessionInfo))
    createdSessionId.value = session.id
    showScanModal.value = true

    // Start scanning
    console.group('🔎 Starting RFID Scan')
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      console.log('RFID Store state:', rfidStore)
      await rfidStore.startContinuousScan(session.id)
      console.log('✅ Scan started successfully')
    } catch (scanError: any) {
      console.error('❌ Scan error:', {
        message: scanError.message,
        details: scanError
      })
      error.value = 'Failed to start scanning. Please try again.'
      await sessionsStore.endSession(session.id)
      showScanModal.value = false
      createdSessionId.value = null
    }
    console.groupEnd()

  } catch (error: any) {
    console.error('❌ Fatal error:', {
      message: error.message,
      stack: error.stack
    })
    error.value = 'Failed to start attendance session.'
    
    if (createdSessionId.value) {
      try {
        await sessionsStore.endSession(createdSessionId.value)
      } catch (cleanupError: any) {
        console.error('❌ Cleanup failed:', {
          message: cleanupError.message,
          stack: cleanupError.stack
        })
      }
      createdSessionId.value = null
    }
    showScanModal.value = false
  }
  console.groupEnd()
}

const stopContinuousScan = async () => {
  console.log('[DEBUG] Starting stopContinuousScan process')
  try {
    if (createdSessionId.value) {
      console.log('[DEBUG] Stopping scan for session:', createdSessionId.value)
      // First stop the continuous scan
      console.log('[DEBUG] Stopping RFID continuous scan...')
      await rfidStore.stopContinuousScan()
      console.log('[DEBUG] RFID scan stopped successfully')

      // Do NOT save attendance records again here, as they are already marked per scan
      // Just end the session
      console.log('[DEBUG] Ending session:', createdSessionId.value)
      await sessionsStore.endSession(createdSessionId.value)
      console.log('[DEBUG] Session ended successfully')

      // Store session end in localStorage
      const currentSession = JSON.parse(localStorage.getItem('currentSession') || '{}')
      currentSession.endTime = new Date().toISOString()
      currentSession.scannedStudents = scannedStudents.value
      localStorage.setItem('currentSession', JSON.stringify(currentSession))
    } else {
      console.log('[DEBUG] No active session to stop')
    }

    showScanModal.value = false
    console.log('[DEBUG] Resetting RFID store state...')
    rfidStore.resetState()
    console.log('[DEBUG] Scan stopped and state reset complete')
    createdSessionId.value = null
  } catch (e) {
    console.error('[DEBUG] Error in stopContinuousScan:', e)
    error.value = 'Failed to save attendance records.'
    // Still try to clean up
    console.log('[DEBUG] Attempting emergency cleanup...')
    try {
      await rfidStore.stopContinuousScan()
      if (createdSessionId.value) {
        await sessionsStore.endSession(createdSessionId.value)
      }
      console.log('[DEBUG] Emergency cleanup successful')
    } catch (cleanupError) {
      console.error('[DEBUG] Error during emergency cleanup:', cleanupError)
    }
    showScanModal.value = false
    rfidStore.resetState()
    createdSessionId.value = null
  }
}

const formatDate = (dt: string) => {
  if (!dt) return ''
  return new Date(dt).toLocaleString()
}

const fetchCourseSessions = async () => {
  if (!courseId.value) return

  try {
    isLoadingSessions.value = true
    await sessionsStore.fetchSessionsByCourse(courseId.value)
  } catch (err) {
    error.value = 'Failed to fetch course sessions'
  } finally {
    isLoadingSessions.value = false
  }
}

const viewSessionDetails = (session: any) => {
  router.push(`/sessions/${session.id}`)
}

const fetchEnrolledStudents = async () => {
  if (!courseId.value) return
  isLoadingEnrolled.value = true
  enrolledError.value = null
  try {
    const res = await getEnrolledStudents(courseId.value)
    enrolledStudents.value = res.data
  } catch (err: any) {
    enrolledError.value = err?.message || 'Failed to fetch enrolled students'
  } finally {
    isLoadingEnrolled.value = false
  }
}

const handleEnrollStudent = async () => {
  if (!enrollingUserNumber.value) {
    enrollError.value = 'Please select a student'
    return
  }

  try {
    isEnrolling.value = true
    enrollError.value = ''
    
    await enrollStudent(courseId.value, enrollingUserNumber.value.user_number)
    showEnrollModal.value = false
    enrollingUserNumber.value = null
    // Refresh the enrolled students list
    await fetchEnrolledStudents()
  } catch (err: any) {
    enrollError.value = err.response?.data?.error || 'Failed to enroll student'
  } finally {
    isEnrolling.value = false
  }
}

const handleUnenrollStudent = async (student: Student) => {
  if (!confirm(`Are you sure you want to unenroll ${student.first_name} ${student.last_name}?`)) {
    return
  }

  try {
    await unenrollStudent(courseId.value, student.user_number)
    // Refresh the enrolled students list
    await fetchEnrolledStudents()
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to unenroll student'
  }
}

watch(activeTab, (tab) => {
  if (tab === 'enrolled') fetchEnrolledStudents()
})

watch(showEnrollModal, async (isOpen) => {
  if (isOpen) {
    try {
      await studentsStore.fetchStudents()
    } catch (err) {
      console.error('Error loading students:', err)
    }
  }
})

const missingOfferingMessage = computed(() => {
  if (!course.value) return ''
  const semester = course.value.semester || 'the selected semester'
  return `You need to create a course offering for ${course.value.name} in ${semester} before enrolling students.`
})

const redirectToCreateOffering = () => {
  router.push({
    path: '/course-offerings',
    query: {
      course: course.value?.id,
      semester: course.value?.semester,
      instructor: course.value?.instructor,
      fromCourseDetails: 'true'
    }
  })
}

const fetchPrereqs = async () => {
  isLoadingPrereqs.value = true
  try {
    const offeringsRes = await getCourseOfferings({ course: courseId.value })
    offerings.value = offeringsRes.data.results
    const semestersRes = await getSemesters()
    semesters.value = semestersRes.data.results
  } finally {
    isLoadingPrereqs.value = false
  }
}

onMounted(() => {
  fetchCourseDetails()
  fetchCourseSessions()
  fetchPrereqs()
})

const activeOffering = computed<CourseOffering | undefined>(() => {
  return offerings.value.find(offering => {
    const semester = semesters.value.find(s => s.id === offering.semester)
    return offering.is_active && semester && semester.is_active
  })
})
const hasActiveOffering = computed(() => !!activeOffering.value)
const activeSemester = computed<Semester | null>(() => {
  if (!activeOffering.value) return null
  return semesters.value.find(s => s.id === (activeOffering.value as CourseOffering).semester) || null
})

onUnmounted(() => {
  if (isContinuousScanning.value) {
    rfidStore.stopContinuousScan()
  }
  rfidStore.resetState()
})
</script>
<style lang="scss">
@use '../../styles/theme/index' as theme;

.course-details-view {
  padding: theme.$spacing-xl;
  background-color: theme.$theme-surface-0;
  min-height: 100vh;
}

.view-header {
  margin-bottom: theme.$spacing-xl;
  background-color: theme.$theme-surface-2;
  border-radius: theme.$border-radius-lg;
  padding: theme.$spacing-lg;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: theme.$spacing-md;
}

.course-header-info {
  display: flex;
  flex-direction: column;
  gap: theme.$spacing-xs;
}

.header-title {
  color: theme.$theme-text-primary;
  font-size: theme.$font-size-2xl;
  font-weight: theme.$font-weight-bold;
  margin: 0;
}

.course-subtitle {
  display: flex;
  gap: theme.$spacing-xs;
}

.course-code {
  font-weight: theme.$font-weight-medium;
}

.back-button {
  margin-right: theme.$spacing-xs;
}

.attendance-card {
  border-radius: theme.$border-radius-lg;
  background: theme.$theme-surface-1;
  box-shadow: 0 2px 8px theme.$theme-shadow-color;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.error-alert {
  margin: theme.$spacing-md 0;
}

.empty-attendance {
  color: theme.$theme-text-secondary;
  text-align: center;
  padding: theme.$spacing-lg 0;
}

.v-card {
  background: theme.$theme-surface-1 !important;
  color: theme.$theme-text-primary !important;
  border-radius: theme.$border-radius-lg;
  box-shadow: 0 2px 8px theme.$theme-shadow-color;
}

.v-card-title {
  color: theme.$theme-text-primary !important;
  font-size: theme.$font-size-lg !important;
  font-weight: theme.$font-weight-semibold !important;
}

.v-card-text {
  color: theme.$theme-text-secondary !important;
}

.v-list {
  background: theme.$theme-surface-1 !important;
}

.v-list-item {
  color: theme.$theme-text-primary !important;
}

.v-list-item-subtitle {
  color: theme.$theme-text-secondary !important;
}

.v-field {
  background: theme.$theme-surface-1 !important;
  border-color: theme.$theme-border-medium !important;
}

.v-field__input {
  color: theme.$theme-text-primary !important;
}

.v-field__outline {
  border-color: theme.$theme-border-medium !important;
}

.v-field:hover .v-field__outline {
  border-color: theme.$theme-border-light !important;
}

.v-field--focused .v-field__outline {
  border-color: theme.$theme-primary !important;
}

.v-field__append-inner {
  color: theme.$theme-text-secondary !important;
}

.v-select__selection {
  color: theme.$theme-text-primary !important;
}

.v-dialog .v-card {
  background: theme.$theme-surface-1 !important;
}

.v-dialog .v-card-title {
  border-bottom: 1px solid theme.$theme-border-medium;
  padding-bottom: theme.$spacing-md;
}

.v-dialog .v-list-item {
  border-bottom: 1px solid theme.$theme-border-medium;
}

.v-dialog .v-list-item:last-child {
  border-bottom: none;
}

.v-dialog .v-card-actions {
  border-top: 1px solid theme.$theme-border-medium;
  padding-top: theme.$spacing-md;
}

.session-status {
  background-color: rgba(theme.$theme-primary, 0.1);
  border-radius: theme.$border-radius-md;
  padding: theme.$spacing-sm theme.$spacing-md;
}

.v-data-table {
  background: theme.$theme-surface-1 !important;
  color: theme.$theme-text-primary !important;
}

.v-data-table-header {
  background: theme.$theme-surface-2 !important;
}

.v-data-table-header th {
  color: theme.$theme-text-secondary !important;
  font-weight: theme.$font-weight-medium !important;
}

.v-data-table__tr {
  border-bottom: 1px solid theme.$theme-border-medium !important;
}

.v-data-table__td {
  color: theme.$theme-text-primary !important;
}

.v-data-table__empty-wrapper {
  color: theme.$theme-text-secondary !important;
}

.v-autocomplete {
  .v-field__input {
    padding-top: 0 !important;
  }
}
</style>

