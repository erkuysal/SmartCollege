<template>
  <div class="base-structure-step">
    <v-row>
      <!-- Faculty Creation -->
      <v-col cols="12" md="6">
        <v-card class="h-100" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-domain</v-icon>
            Faculty Creation
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="createFaculty" v-model="facultyFormValid">
              <v-text-field
                v-model="facultyForm.name"
                label="Faculty Name"
                :rules="[v => !!v || 'Faculty name is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :disabled="facultyFormLocked"
              />
              <v-text-field
                v-model="facultyForm.code"
                label="Faculty Code"
                :rules="[v => !!v || 'Faculty code is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :disabled="facultyFormLocked"
              />
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="!facultyFormValid || facultyFormLocked"
                block
              >
                <v-icon left>mdi-plus</v-icon>
                Create Faculty
              </v-btn>
              <v-btn
                color="secondary"
                :loading="loading"
                :disabled="!facultyFormLocked"
                block
                @click="unlockFacultyForm"
              >
                <v-icon left>mdi-lock-reset</v-icon>
                Unlock Faculty Form
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Department Creation -->
      <v-col cols="12" md="6">
        <v-card class="h-100" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-office-building</v-icon>
            Department Creation
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="createDepartment" v-model="departmentFormValid">
              <v-select
                v-model="departmentForm.facultyId"
                :items="faculties"
                item-title="name"
                item-value="id"
                label="Select Faculty"
                :rules="[v => !!v || 'Faculty selection is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />
              <v-text-field
                v-model="departmentForm.name"
                label="Department Name"
                :rules="[v => !!v || 'Department name is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />
              <v-text-field
                v-model="departmentForm.code"
                label="Department Code"
                :rules="[v => !!v || 'Department code is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="!departmentFormValid || departmentFormLocked"
                block
              >
                <v-icon left>mdi-plus</v-icon>
                Create Department
              </v-btn>
              <v-btn
                color="secondary"
                :loading="loading"
                :disabled="!departmentFormLocked"
                block
                @click="unlockDepartmentForm"
              >
                <v-icon left>mdi-lock-reset</v-icon>
                Unlock Department Form
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Academic Term Setup -->
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-calendar-clock</v-icon>
            Academic Term Setup
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="createTerm" v-model="termFormValid">
              <v-row>
                <v-col cols="12">
                  <v-alert v-if="termDateError" type="error" class="mb-2">{{ termDateError }}</v-alert>
                  <v-alert v-if="backendError" type="error" class="mb-2">{{ backendError }}</v-alert>
                </v-col>
                <v-col cols="12" class="mb-2">
                  <v-btn color="info" @click="copyPreviousTerm" :disabled="terms.length === 0">
                    <v-icon left>mdi-content-copy</v-icon>
                    Copy Previous Term
                  </v-btn>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="termForm.name"
                    label="Term Name"
                    :rules="[ (v: string) => !!v || 'Term name is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="E.g., 'Spring 2025'"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="termForm.term"
                    :items="['Fall', 'Spring', 'Summer']"
                    label="Term"
                    :rules="[ (v: string) => !!v || 'Term is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="Select the academic term."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="termForm.startDate"
                    label="Start Date"
                    type="date"
                    :rules="[ (v: string) => !!v || 'Start date is required']"
                    variant="outlined"
                    density="comfortable"
                    :min="new Date().toISOString().slice(0, 10)"
                    hint="First day of the term."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="termForm.endDate"
                    label="End Date"
                    type="date"
                    :rules="[ (v: string) => !!v || 'End date is required']"
                    variant="outlined"
                    density="comfortable"
                    :min="termForm.startDate || new Date().toISOString().slice(0, 10)"
                    hint="Last day of the term."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="termForm.academic_year"
                    label="Academic Year"
                    :rules="[ (v: string) => !!v || 'Academic year is required']"
                    variant="outlined"
                    density="comfortable"
                    hint="E.g., '2024-2025'. Auto-filled from dates."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="termForm.registration_start"
                    label="Registration Start"
                    type="date"
                    :rules="[ (v: string) => !!v || 'Registration start is required']"
                    variant="outlined"
                    density="comfortable"
                    :min="new Date().toISOString().slice(0, 10)"
                    hint="When registration opens. Auto-suggested."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="termForm.registration_end"
                    label="Registration End"
                    type="date"
                    :rules="[ (v: string) => !!v || 'Registration end is required']"
                    variant="outlined"
                    density="comfortable"
                    :min="termForm.registration_start || new Date().toISOString().slice(0, 10)"
                    hint="Registration must end before or at the term start date. Auto-suggested."
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="2" class="d-flex align-center">
                  <v-switch
                    v-model="termForm.is_active"
                    label="Active Term"
                    color="primary"
                    hide-details
                    hint="Only one term can be active at a time."
                    persistent-hint
                  />
                </v-col>
              </v-row>
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="!termFormValid || termFormLocked || !!termDateError"
                block
                class="mt-4"
              >
                <v-icon left>mdi-plus</v-icon>
                Create Term
              </v-btn>
              <v-btn
                color="secondary"
                :loading="loading"
                :disabled="!termFormLocked"
                block
                @click="unlockTermForm"
              >
                <v-icon left>mdi-lock-reset</v-icon>
                Unlock Term Form
              </v-btn>
            </v-form>
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
                    <div class="text-h4 mb-2">{{ faculties.length }}</div>
                    <div class="text-subtitle-1">Faculties Created</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="tonal" color="primary" class="text-center">
                  <v-card-text>
                    <div class="text-h4 mb-2">{{ departments.length }}</div>
                    <div class="text-subtitle-1">Departments Created</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="tonal" color="primary" class="text-center">
                  <v-card-text>
                    <div class="text-h4 mb-2">{{ activeTerms.length }}</div>
                    <div class="text-subtitle-1">Active Terms</div>
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
              Complete Base Structure Setup
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useFacultyStore } from '@/utils/stores/college/facultyStore';
import { useDepartmentStore } from '@/utils/stores/college/departmentStore';
import { useTermStore } from '@/utils/stores/academics/termStore';

// Interfaces
interface Faculty {
  id: number;
  name: string;
  code: string;
}

interface Department {
  id: number;
  facultyId: number;
  name: string;
  code: string;
}

interface Term {
  id: number;
  name: string;
  term: string | null;
  academic_year: string;
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  is_active: boolean;
}

// Form validation
const facultyFormValid = ref(false);
const departmentFormValid = ref(false);
const termFormValid = ref(false);

// Form data
const facultyForm = ref({
  name: '',
  code: ''
});

const departmentForm = ref({
  facultyId: '',
  name: '',
  code: ''
});

const termForm = ref({
  name: '',
  term: '',
  academic_year: '',
  startDate: '',
  endDate: '',
  registration_start: '',
  registration_end: '',
  is_active: false
});

// Data storage
const faculties = ref<Faculty[]>([]);
const departments = ref<Department[]>([]);
const terms = ref<Term[]>([]);
const loading = ref(false);
const facultyFormLocked = ref(false);
const departmentFormLocked = ref(false);
const lastCreatedFacultyId = ref<number | null>(null);
const lastCreatedDepartmentId = ref<number | null>(null);
const termFormLocked = ref(false);
const lastCreatedTermId = ref<number | null>(null);

// Computed properties
const activeTerms = computed(() => {
  return terms.value.filter(term => term.is_active);
});

const canCompleteStep = computed(() => {
  return faculties.value.length > 0 && 
         departments.value.length > 0 && 
         activeTerms.value.length > 0;
});

const backendError = ref('');

const termDateError = computed(() => {
  if (!termForm.value.registration_end || !termForm.value.startDate) return '';
  if (termForm.value.registration_end > termForm.value.startDate) {
    return 'Registration end must be before or at the term start date.';
  }
  if (termForm.value.startDate >= termForm.value.endDate) {
    return 'Term end date must be after start date.';
  }
  if (termForm.value.registration_start >= termForm.value.registration_end) {
    return 'Registration end must be after registration start.';
  }
  return '';
});

// Methods
const createFaculty = async () => {
  if (!facultyFormValid.value) return;
  loading.value = true;
  try {
    await facultyStore.createFaculty(facultyForm.value);
    faculties.value = facultyStore.items;
    // Find the newly created faculty (assume it's the one with the max id)
    const newFaculty = facultyStore.items.reduce((a, b) => (a.id > b.id ? a : b));
    lastCreatedFacultyId.value = newFaculty.id;
    departmentForm.value.facultyId = String(newFaculty.id);
    facultyFormLocked.value = true;
    // Do NOT clear the faculty form
  } catch (error) {
    console.error('Error creating faculty:', error);
  } finally {
    loading.value = false;
  }
};

const unlockFacultyForm = () => {
  facultyFormLocked.value = false;
  facultyForm.value = { name: '', code: '' };
  lastCreatedFacultyId.value = null;
  departmentForm.value.facultyId = '';
};

const createDepartment = async () => {
  if (!departmentFormValid.value) return;
  loading.value = true;
  try {
    await departmentStore.createDepartment({
      name: departmentForm.value.name,
      code: departmentForm.value.code,
      faculty: Number(departmentForm.value.facultyId)
    });
    await departmentStore.fetchDepartments();
    departments.value = departmentStore.items
      .filter(dep => typeof dep.faculty === 'number')
      .map(dep => ({
        id: dep.id,
        facultyId: dep.faculty as number,
        name: dep.name,
        code: dep.code
      }));
    // Find the newly created department (assume it's the one with the max id)
    const newDepartment = departmentStore.items.reduce((a, b) => (a.id > b.id ? a : b));
    lastCreatedDepartmentId.value = newDepartment.id;
    // Optionally, pre-select department in term form if you have such a field
    departmentFormLocked.value = true;
    // Do NOT clear the department form
  } catch (error) {
    console.error('Error creating department:', error);
  } finally {
    loading.value = false;
  }
};

const unlockDepartmentForm = () => {
  departmentFormLocked.value = false;
  departmentForm.value = { facultyId: '', name: '', code: '' };
  lastCreatedDepartmentId.value = null;
};

const createTerm = async () => {
  if (!termFormValid.value || termDateError.value) return;
  loading.value = true;
  backendError.value = '';
  try {
    const payload = {
      name: termForm.value.name,
      term: termForm.value.term,
      academic_year: termForm.value.academic_year,
      start_date: termForm.value.startDate,
      end_date: termForm.value.endDate,
      registration_start: termForm.value.registration_start,
      registration_end: termForm.value.registration_end,
      is_active: termForm.value.is_active
    };
    const newTerm = await termStore.createTerm(payload);
    terms.value.push(newTerm);
    lastCreatedTermId.value = newTerm.id;
    termFormLocked.value = true;
  } catch (error: any) {
    backendError.value = error?.response?.data?.__all__?.[0] || error?.message || 'Unknown error';
  } finally {
    loading.value = false;
  }
};

const unlockTermForm = () => {
  termFormLocked.value = false;
  termForm.value = { name: '', term: '', academic_year: '', startDate: '', endDate: '', registration_start: '', registration_end: '', is_active: false };
  lastCreatedTermId.value = null;
};

const emit = defineEmits<{
  (e: 'step-completed', stepId: string): void;
  (e: 'step-error', error: Error): void;
}>();

const completeStep = () => {
  if (canCompleteStep.value) {
    emit('step-completed', 'base-structure');
  }
};

// Load initial data
const loadInitialData = async () => {
  try {
    loading.value = true;
    await facultyStore.fetchFaculties();
    faculties.value = facultyStore.items;
    facultyFormLocked.value = faculties.value.length > 0; // lock if any exist

    await departmentStore.fetchDepartments();
    departments.value = departmentStore.items
      .filter(dep => typeof dep.faculty === 'number')
      .map(dep => ({
        id: dep.id,
        facultyId: dep.faculty as number,
        name: dep.name,
        code: dep.code
      }));
    departmentFormLocked.value = departments.value.length > 0; // lock if any exist

    await termStore.fetchTerms();
    terms.value = termStore.terms;
    termFormLocked.value = terms.value.length > 0; // lock if any exist
  } catch (error) {
    console.error('Error loading initial data:', error);
  } finally {
    loading.value = false;
  }
};

// Load data on component mount
loadInitialData();

// --- UX Improvements ---
// 1. Auto-fill academic_year based on start and end dates
watch(
  () => [termForm.value.startDate, termForm.value.endDate],
  ([start, end]) => {
    if (start && end) {
      const startYear = new Date(start).getFullYear();
      const endYear = new Date(end).getFullYear();
      termForm.value.academic_year = `${startYear}-${endYear}`;
    }
  }
);

// 2. Auto-suggest registration dates when startDate is picked
watch(
  () => termForm.value.startDate,
  (start) => {
    if (start) {
      const startDate = new Date(start);
      const regStart = new Date(startDate);
      regStart.setDate(startDate.getDate() - 21); // 3 weeks before
      const regEnd = new Date(startDate);
      regEnd.setDate(startDate.getDate() - 7); // 1 week before
      // Only auto-fill if not already set or if user hasn't changed them
      if (!termForm.value.registration_start) {
        termForm.value.registration_start = regStart.toISOString().slice(0, 10);
      }
      if (!termForm.value.registration_end) {
        termForm.value.registration_end = regEnd.toISOString().slice(0, 10);
      }
    }
  }
);

// 3. Pre-select most common term
onMounted(() => {
  if (!termForm.value.term) {
    termForm.value.term = 'Spring';
  }
});

// 4. Copy Previous Term button
function copyPreviousTerm() {
  if (terms.value.length === 0) return;
  const prev = terms.value[terms.value.length - 1];
  // Advance all dates by 1 year
  function addOneYear(dateStr) {
    const d = new Date(dateStr);
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  }
  termForm.value.name = prev.name;
  termForm.value.term = prev.term;
  termForm.value.academic_year = prev.academic_year ? prev.academic_year.replace(/\d{4}/g, y => String(Number(y) + 1)) : '';
  termForm.value.startDate = addOneYear(prev.start_date);
  termForm.value.endDate = addOneYear(prev.end_date);
  termForm.value.registration_start = addOneYear(prev.registration_start);
  termForm.value.registration_end = addOneYear(prev.registration_end);
  termForm.value.is_active = false;
}

const facultyStore = useFacultyStore();
const departmentStore = useDepartmentStore();
const termStore = useTermStore();
</script>

<style scoped>
.base-structure-step {
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