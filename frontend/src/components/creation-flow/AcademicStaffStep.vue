<template>
  <div class="academic-staff-step">
    <v-row>
      <!-- Staff Creation -->
      <v-col cols="12" md="6">
        <v-card class="h-100" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-account-plus</v-icon>
            Staff Creation
          </v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedUserType"
              :items="[
                { title: 'Lecturer', value: 'lecturer' },
                { title: 'Staff', value: 'staff' },
                { title: 'Student', value: 'student' }
              ]"
              label="User Type"
              class="mb-4"
              variant="outlined"
            />
            <v-form @submit.prevent="createUser" v-model="staffFormValid">
              <v-row v-if="selectedUserType === 'lecturer'">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="lecturerForm.first_name"
                    label="First Name *"
                    :rules="[v => !!v || 'First name is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Enter the lecturer's first name."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="lecturerForm.last_name"
                    label="Last Name *"
                    :rules="[v => !!v || 'Last name is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Enter the lecturer's last name."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="lecturerForm.department"
                    :items="departments"
                    item-title="name"
                    item-value="id"
                    label="Department *"
                    :rules="[v => !!v || 'Department is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Select the department for this lecturer."
                    persistent-hint
                  />
                </v-col>
              </v-row>
              <v-row v-else-if="selectedUserType === 'staff'">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="staffForm.first_name"
                    label="First Name *"
                    :rules="[v => !!v || 'First name is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Enter the lecturer's first name."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="staffForm.last_name"
                    label="Last Name *"
                    :rules="[v => !!v || 'Last name is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Enter the lecturer's last name."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="staffForm.department"
                    :items="departments"
                    item-title="name"
                    item-value="id"
                    label="Department *"
                    :rules="[v => !!v || 'Department is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Select the department for this lecturer."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="staffForm.position"
                    label="Position *"
                    :rules="[v => !!v || 'Position is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Enter the lecturer's position."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="staffForm.hire_date"
                    label="Hire Date *"
                    :rules="[v => !!v || 'Hire date is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Enter the lecturer's hire date."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="staffForm.role"
                    label="Role *"
                    :rules="[v => !!v || 'Role is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Select the lecturer's role."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="staffForm.is_admin"
                    label="Is Admin *"
                    :rules="[v => !!v || 'Is admin is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Select whether the lecturer is an admin."
                    persistent-hint
                  />
                </v-col>
              </v-row>
              <v-row v-else-if="selectedUserType === 'student'">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="studentForm.first_name"
                    label="First Name *"
                    :rules="[v => !!v || 'First name is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Enter the student's first name."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="studentForm.last_name"
                    label="Last Name *"
                    :rules="[v => !!v || 'Last name is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Enter the student's last name."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="studentForm.faculty"
                    :items="faculties"
                    item-title="name"
                    item-value="id"
                    label="Faculty *"
                    :rules="[v => !!v || 'Faculty is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Select the student's faculty."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="studentForm.student_status"
                    :items="['ACTIVE', 'INACTIVE', 'GRADUATED']"
                    label="Student Status *"
                    :rules="[v => !!v || 'Student status is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Select the student's status."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="studentForm.semester"
                    :items="[1,2,3,4,5,6,7,8,9,10,11,12]"
                    label="Semester *"
                    :rules="[v => !!v || 'Semester is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Select the student's semester."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="studentForm.balance_points"
                    label="Balance Points *"
                    :rules="[v => !!v || 'Balance points are required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Enter the student's balance points."
                    persistent-hint
                  />
                </v-col>
              </v-row>
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="!staffFormValid"
                block
              >
                <v-icon left>mdi-plus</v-icon>
                Create {{ selectedUserType.charAt(0).toUpperCase() + selectedUserType.slice(1) }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Staff List -->
      <v-col cols="12" md="6">
        <v-card class="h-100" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-account-group</v-icon>
            Staff List
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="currentHeaders"
              :items="currentItems"
              :loading="loading"
              class="elevation-1"
            >
              <template v-slot:item.name="{ item }">
                {{ item.first_name }} {{ item.last_name }}
              </template>
              <template v-slot:item.department="{ item }">
                {{ getDepartmentDisplay(item) }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  variant="text"
                  color="primary"
                  size="small"
                  @click="editStaff(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  color="error"
                  size="small"
                  @click="deleteStaff(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Progress Summary -->
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-chart-box</v-icon>
            Setup Progress
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-card variant="tonal" color="primary" class="text-center">
                  <v-card-text>
                    <div class="text-h4 mb-2">{{ currentItems.length }}</div>
                    <div class="text-subtitle-1">Total Staff Members</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            <v-btn
              color="success"
              size="large"
              block
              class="mt-6"
              :disabled="!canCompleteStep"
              @click="completeStep"
            >
              <v-icon left>mdi-check-circle</v-icon>
              Complete Staff Setup
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStaffStore } from '@/utils/stores/users/staffStore';
import { useDepartmentStore } from '@/utils/stores/college/departmentStore';
import { useLecturerStore } from '@/utils/stores/users/lecturerStore';
import { useStudentStore } from '@/utils/stores/users/studentStore';
import { useFacultyStore } from '@/utils/stores/college/facultyStore';

// Interfaces
interface StaffMember {
  id: number;
  user: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  department: number | string;
  department_name: string;
  faculty: number;
  faculty_name: string;
  office_number: string;
  courses_taught: string;
}

interface Department {
  id: number;
  name: string;
}

// Constants
const staffRoles = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Lecturer',
  'Teaching Assistant'
];

// Add dynamic table headers for each user type
const lecturerTableHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Department', key: 'department' },
  { title: 'Email', key: 'email' },
  { title: 'Username', key: 'username' },
  { title: 'Actions', key: 'actions', sortable: false }
];
const staffTableHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Department', key: 'department' },
  { title: 'Email', key: 'email' },
  { title: 'Username', key: 'username' },
  { title: 'Actions', key: 'actions', sortable: false }
];
const studentTableHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Department', key: 'department' },
  { title: 'Email', key: 'email' },
  { title: 'Username', key: 'username' },
  { title: 'Actions', key: 'actions', sortable: false }
];

const currentHeaders = computed(() => {
  if (selectedUserType.value === 'lecturer') return lecturerTableHeaders;
  if (selectedUserType.value === 'staff') return staffTableHeaders;
  if (selectedUserType.value === 'student') return studentTableHeaders;
  return [];
});

// Form validation
const staffFormValid = ref(false);

// Form data
const selectedUserType = ref<'lecturer' | 'staff' | 'student'>('lecturer');
const lecturerForm = ref({
  first_name: '',
  last_name: '',
  department: ''
});
const staffForm = ref({
  username: '',
  first_name: '',
  last_name: '',
  department: '',
  position: '',
  hire_date: '',
  role: undefined,
  is_admin: false
});
const studentForm = ref({
  first_name: '',
  last_name: '',
  faculty: 0,
  student_status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'GRADUATED',
  semester: 1,
  balance_points: 0
});

// Data storage
const currentItems = computed(() => {
  if (selectedUserType.value === 'lecturer') return lecturerStore.items;
  if (selectedUserType.value === 'staff') return staffStore.items;
  if (selectedUserType.value === 'student') return studentStore.items;
  return [];
});
const loading = ref(false);

// Computed properties
const canCompleteStep = computed(() => {
  return currentItems.value.length > 0;
});

const departmentStore = useDepartmentStore();
const departments = computed(() => departmentStore.items);

// Add a computed property for faculties
const facultyStore = useFacultyStore();
const faculties = computed(() => facultyStore.items);

// Methods
const createUser = async () => {
  if (selectedUserType.value === 'lecturer') {
    const payload = { ...lecturerForm.value };
    await lecturerStore.createLecturer(payload);
    lecturerForm.value = { first_name: '', last_name: '', department: '' };
  } else if (selectedUserType.value === 'staff') {
    const payload = { ...staffForm.value };
    await staffStore.createStaff(payload);
    staffForm.value = { username: '', first_name: '', last_name: '', department: '', position: '', hire_date: '', role: undefined, is_admin: false };
  } else if (selectedUserType.value === 'student') {
    const payload = { ...studentForm.value };
    await studentStore.createStudent(payload);
    studentForm.value = { first_name: '', last_name: '', faculty: 0, student_status: 'ACTIVE', semester: 1, balance_points: 0 };
  }
};

// Add a helper function for department display
function getDepartmentDisplay(item: any) {
  return item.department_name || item.department || item.faculty_name || item.faculty || 'Unknown';
}

// Update editStaff and deleteStaff handlers to accept any type
const editStaff = (staff: any) => {
  // Implement edit functionality
  console.log('Edit staff:', staff);
};

const deleteStaff = async (staff: any) => {
  if (!confirm('Are you sure you want to delete this staff member?')) return;
  
  loading.value = true;
  try {
    if (selectedUserType.value === 'lecturer') {
      await lecturerStore.deleteLecturer(staff.id);
    } else if (selectedUserType.value === 'staff') {
      await staffStore.deleteStaff(staff.id);
    } else if (selectedUserType.value === 'student') {
      await studentStore.deleteStudent(staff.id);
    }
  } catch (error) {
    console.error('Error deleting staff member:', error);
  } finally {
    loading.value = false;
  }
};

const emit = defineEmits<{
  (e: 'step-completed', stepId: string): void;
  (e: 'step-error', error: Error): void;
}>();

const completeStep = () => {
  if (canCompleteStep.value) {
    emit('step-completed', 'academic-staff');
  }
};

// Load initial data
const loadInitialData = async () => {
  loading.value = true;
  try {
    await lecturerStore.fetchLecturers();
    await staffStore.fetchStaff();
    await studentStore.fetchStudents();
  } catch (error) {
    console.error('Error loading initial data:', error);
  } finally {
    loading.value = false;
  }
};

// Load data on component mount
onMounted(() => {
  departmentStore.fetchDepartments();
  facultyStore.fetchFaculties();
  loadInitialData();
});

const lecturerStore = useLecturerStore();
const staffStore = useStaffStore();
const studentStore = useStudentStore();
</script>

<style scoped>
.academic-staff-step {
  transition: all 0.3s ease;
}

.v-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style> 