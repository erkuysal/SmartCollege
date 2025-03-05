<template>
  <ListViewLayout
    title="Students"
    icon="mdi-account-school"
    :loading="studentStore.loading"
    :isEmpty="filteredStudents.length === 0"
    :error="studentStore.error || ''"
    searchLabel="Search students"
    addButtonText="Add Student"
    emptyIcon="mdi-account-school-outline"
    emptyTitle="No Students Found"
    emptyText="Get started by adding your first student."
    emptySearchText="No students match your search criteria."
    v-model:viewType="viewType"
    @search="handleSearch"
    @add="navigateToAddStudent"
    @refresh="reloadStudents"
    @clear-error="studentStore.clearError()"
  >
    <!-- RFID Success Message -->
    <template #alerts>
      <v-alert
        v-if="rfidMessage"
        type="success"
        class="mb-4"
        variant="tonal"
        closable
        @click:close="rfidMessage = ''"
      >
        {{ rfidMessage }}
      </v-alert>
    </template>

    <!-- Table View -->
    <template #default="{ viewType }">
      <v-card
        v-if="viewType === 'table'"
        variant="outlined"
        class="mb-4"
      >
        <v-data-table
          :headers="headers"
          :items="filteredStudents"
          :loading="studentStore.loading"
          hover
        >
          <template #item.student_number="{ item }">   
            <div class="d-flex align-center">
              <v-icon size="small" color="primary" class="mr-2">mdi-card-account-details</v-icon>
              <span class="font-weight-medium">{{ item.student_number }}</span>
            </div>
          </template>
          
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" color="primary" class="mr-2">
                <v-icon color="white">mdi-account</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.first_name }} {{ item.last_name }}</div>
                <div class="text-caption text-grey">{{ item.email }}</div>
              </div>
            </div>
          </template>
          
          <template #item.faculty="{ item }">
            <div v-if="item.faculty">
              {{ typeof item.faculty === 'object' ? item.faculty.name : getFacultyName(item.faculty) }}
            </div>
            <span v-else class="text-grey">Not Assigned</span>
          </template>
          
          <template #item.rfid_tag="{ item }">
            <div v-if="item.rfid_tag" class="d-flex align-center">
              <v-icon size="small" color="success" class="mr-1">mdi-check-circle</v-icon>
              <span>{{ item.rfid_tag }}</span>
            </div>
            <v-btn
              v-else
              size="small"
              variant="outlined"
              color="primary"
              @click="handleWriteRFID(item)"
            >
              Assign RFID
            </v-btn>
          </template>
          
          <template #item.actions="{ item }">
            <div class="d-flex">
              <v-btn
                icon
                variant="text"
                size="small"
                color="primary"
                @click="navigateToEditStudent(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                color="error"
                @click="confirmDelete(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <!-- Card View -->
      <div v-else class="d-flex flex-wrap">
        <v-card
          v-for="student in filteredStudents"
          :key="student.id"
          class="ma-2"
          width="300"
          variant="outlined"
          hover
        >
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="primary" size="40">
                <v-icon color="white">mdi-account</v-icon>
              </v-avatar>
            </template>
            <v-card-title>{{ student.first_name }} {{ student.last_name }}</v-card-title>
            <v-card-subtitle>{{ student.student_number }}</v-card-subtitle>
          </v-card-item>
          
          <v-card-text>
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="grey" class="mr-2">mdi-email</v-icon>
              <span>{{ student.email }}</span>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="grey" class="mr-2">mdi-office-building</v-icon>
              <span>{{ typeof student.faculty === 'object' ? student.faculty.name : getFacultyName(student.faculty) }}</span>
            </div>
            <div class="d-flex align-center">
              <v-icon size="small" color="grey" class="mr-2">mdi-credit-card</v-icon>
              <span v-if="student.rfid_tag">{{ student.rfid_tag }}</span>
              <v-btn
                v-else
                size="x-small"
                variant="outlined"
                color="primary"
                @click="handleWriteRFID(student)"
              >
                Assign RFID
              </v-btn>
            </div>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              color="primary"
              size="small"
              @click="navigateToEditStudent(student)"
            >
              Edit
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              size="small"
              @click="confirmDelete(student)"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </template>
  </ListViewLayout>

  <!-- RFID Dialog -->
  <v-dialog v-model="rfidDialogVisible" max-width="400">
    <v-card>
      <v-card-title class="bg-primary text-white">
        <v-icon color="white" class="mr-2">mdi-credit-card-scan</v-icon>
        Assign RFID Card
      </v-card-title>
      <v-card-text class="pa-4">
        <p class="mb-4">Scan an RFID card to assign to {{ selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'student' }}.</p>
        <v-text-field
          v-model="rfidInput"
          label="RFID Card ID"
          autofocus
          @keydown.enter="assignRFID"
          prepend-inner-icon="mdi-identifier"
          hint="Enter or scan RFID card ID"
          persistent-hint
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="rfidDialogVisible = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="assignRFID"
          :loading="assigningRFID"
        >
          Assign
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="deleteDialogVisible" max-width="400">
    <v-card>
      <v-card-title class="bg-error text-white">
        <v-icon color="white" class="mr-2">mdi-alert</v-icon>
        Confirm Delete
      </v-card-title>
      <v-card-text class="pa-4">
        <p>Are you sure you want to delete this student?</p>
        <p v-if="selectedStudent" class="font-weight-medium">{{ selectedStudent.first_name }} {{ selectedStudent.last_name }}</p>
        <p class="text-caption text-grey mt-2">This action cannot be undone.</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="deleteDialogVisible = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          @click="deleteStudent"
          :loading="deleting"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStudentStore } from '../../../../utils/stores/users/studentStore';
import { useFacultyStore } from '../../../../utils/stores/college/facultyStore';
import ListViewLayout from '../../../../components/layouts/ListViewLayout.vue';
import type { Student } from '../../../../utils/interfaces/users/studentInterface';

// Router
const router = useRouter();

// Stores
const studentStore = useStudentStore();
const facultyStore = useFacultyStore();

// View state
const viewType = ref('table');
const searchQuery = ref('');
const isChildRoute = computed(() => router.currentRoute.value.name !== 'students');

// RFID dialog
const rfidDialogVisible = ref(false);
const rfidInput = ref('');
const selectedStudent = ref<Student | null>(null);
const assigningRFID = ref(false);
const rfidMessage = ref('');

// Delete dialog
const deleteDialogVisible = ref(false);
const deleting = ref(false);

// Table headers
const headers = [
  { title: 'Student ID', key: 'student_number', sortable: true },
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Faculty', key: 'faculty', sortable: false },
  { title: 'RFID Card', key: 'rfid_tag', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as 'end' }
];

// Filtered students based on search
const filteredStudents = computed(() => {
  if (!searchQuery.value) return studentStore.items;
  
  const query = searchQuery.value.toLowerCase();
  return studentStore.items.filter(student => {
    const facultyName = typeof student.faculty === 'object' && student.faculty?.name 
      ? student.faculty.name.toLowerCase() 
      : getFacultyName(student.faculty).toLowerCase();
    
    return student.first_name.toLowerCase().includes(query) || 
      student.last_name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      (student.student_number && student.student_number.toLowerCase().includes(query)) ||
      facultyName.includes(query);
  });
});

// Methods
function handleSearch(query: string) {
  searchQuery.value = query;
}

function reloadStudents() {
  studentStore.fetchStudents({});
}

function navigateToAddStudent() {
  router.push('/admin/students/add');
}

function navigateToEditStudent(student: Student) {
  router.push(`/admin/students/${student.id}/edit`);
}

function handleWriteRFID(student: Student) {
  selectedStudent.value = student;
  rfidInput.value = '';
  rfidDialogVisible.value = true;
}

async function assignRFID() {
  if (!rfidInput.value || !selectedStudent.value) return;
  
  assigningRFID.value = true;
  
  try {
    await studentStore.updateStudent(
      selectedStudent.value.id,
      {
        ...selectedStudent.value,
        rfid_tag: rfidInput.value
      }
    );
    
    rfidMessage.value = `RFID card successfully assigned to ${selectedStudent.value.first_name} ${selectedStudent.value.last_name}`;
    rfidDialogVisible.value = false;
  } catch (error) {
    console.error('Error assigning RFID:', error);
  } finally {
    assigningRFID.value = false;
  }
}

function confirmDelete(student: Student) {
  selectedStudent.value = student;
  deleteDialogVisible.value = true;
}

async function deleteStudent() {
  if (!selectedStudent.value) return;
  
  deleting.value = true;
  
  try {
    await studentStore.deleteStudent(selectedStudent.value.id);
    deleteDialogVisible.value = false;
  } catch (error) {
    console.error('Error deleting student:', error);
  } finally {
    deleting.value = false;
  }
}

function getFacultyName(facultyId: any): string {
  if (!facultyId) return 'Not Assigned';
  
  const faculty = facultyStore.items.find(f => f.id === facultyId);
  return faculty ? faculty.name : 'Unknown Faculty';
}

// Lifecycle hooks
onMounted(async () => {
  if (studentStore.items.length === 0) {
    await studentStore.fetchStudents({});
  }
  
  if (facultyStore.items.length === 0) {
    await facultyStore.fetchFaculties();
  }
});
</script>

<style scoped>
.v-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>

