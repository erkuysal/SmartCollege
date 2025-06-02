<template>
  <div class="settings-view">
    <PageHeader
      title="System Settings"
      subtitle="Configure and manage system settings"
    />

    <v-card>
      <v-tabs v-model="activeTab" bg-color="primary" centered>
        <v-tab value="general">General</v-tab>
        <v-tab value="academic">Academic</v-tab>
        <v-tab value="users">Users</v-tab>
        <v-tab value="integrations">Integrations</v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- General Settings -->
        <v-window-item value="general">
          <v-card-text>
            <h2 class="text-h5 mb-4">General Settings</h2>
            <v-form>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.institutionName"
                    label="Institution Name"
                    variant="outlined"
                    hint="The name of your institution"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.contactEmail"
                    label="Contact Email"
                    variant="outlined"
                    hint="Main contact email for notifications"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="settings.timezone"
                    :items="timezones"
                    label="Default Timezone"
                    variant="outlined"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="settings.language"
                    :items="languages"
                    label="Default Language"
                    variant="outlined"
                  ></v-select>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-window-item>

        <!-- Academic Settings -->
        <v-window-item value="academic">
          <v-card-text>
            <h2 class="text-h5 mb-4">Academic Settings</h2>
            
            <h3 class="text-subtitle-1 mt-4 mb-2">Academic Terms</h3>
            <v-data-table
              :headers="termHeaders"
              :items="academicTerms"
              class="mb-4"
            >
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  @click="editTerm(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  @click="deleteTerm(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
            
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="addTerm"
              class="mb-6"
            >
              Add Academic Term
            </v-btn>
            
            <h3 class="text-subtitle-1 mt-6 mb-2">Grading System</h3>
            <v-data-table
              :headers="gradeHeaders"
              :items="gradingSystem"
            >
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  @click="editGrade(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  @click="deleteGrade(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
            
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="addGrade"
              class="mt-2"
            >
              Add Grade
            </v-btn>
          </v-card-text>
        </v-window-item>

        <!-- User Settings -->
        <v-window-item value="users">
          <v-card-text>
            <h2 class="text-h5 mb-4">User Settings</h2>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4">
                  <h3 class="text-subtitle-1 mb-2">User Roles</h3>
                  <v-list>
                    <v-list-item v-for="role in userRoles" :key="role.id">
                      <template v-slot:prepend>
                        <v-checkbox v-model="role.active" hide-details></v-checkbox>
                      </template>
                      <v-list-item-title>{{ role.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ role.description }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4">
                  <h3 class="text-subtitle-1 mb-2">Authentication</h3>
                  <v-switch
                    v-model="settings.twoFactorAuth"
                    label="Require Two-Factor Authentication"
                    color="primary"
                    hide-details
                    class="mb-4"
                  ></v-switch>
                  
                  <v-switch
                    v-model="settings.passwordPolicy"
                    label="Enforce Strong Password Policy"
                    color="primary"
                    hide-details
                    class="mb-4"
                  ></v-switch>
                  
                  <v-text-field
                    v-model="settings.sessionTimeout"
                    label="Session Timeout (minutes)"
                    type="number"
                    variant="outlined"
                  ></v-text-field>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-window-item>

        <!-- Integrations Settings -->
        <v-window-item value="integrations">
          <v-card-text>
            <h2 class="text-h5 mb-4">Integrations</h2>
            
            <v-expansion-panels variant="accordion">
              <v-expansion-panel
                v-for="integration in integrations"
                :key="integration.id"
              >
                <v-expansion-panel-title>
                  <div class="d-flex align-center">
                    <v-icon :color="integration.active ? 'success' : 'grey'" class="mr-2">
                      {{ integration.active ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                    </v-icon>
                    {{ integration.name }}
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-card-text>
                    <p class="mb-4">{{ integration.description }}</p>
                    <v-form>
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="integration.apiKey"
                            label="API Key"
                            variant="outlined"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="integration.apiSecret"
                            label="API Secret"
                            variant="outlined"
                            type="password"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-switch
                            v-model="integration.active"
                            color="success"
                            label="Enable Integration"
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-window-item>
      </v-window>

      <v-divider></v-divider>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="outlined"
          @click="resetSettings"
        >
          Reset to Defaults
        </v-btn>
        <v-btn
          color="primary"
          @click="saveSettings"
          :loading="saving"
        >
          Save Settings
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Term Dialog -->
    <v-dialog v-model="termDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5 bg-primary text-white py-3 px-4">
          {{ editingTerm ? 'Edit Academic Term' : 'Add Academic Term' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="termForm">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="termItem.name"
                  label="Term Name"
                  variant="outlined"
                  :rules="[v => !!v || 'Name is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="termItem.year"
                  label="Academic Year"
                  variant="outlined"
                  :rules="[v => !!v || 'Year is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="termItem.start_date"
                  label="Start Date"
                  type="date"
                  variant="outlined"
                  :rules="[v => !!v || 'Start date is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="termItem.end_date"
                  label="End Date"
                  type="date"
                  variant="outlined"
                  :rules="[v => !!v || 'End date is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="termItem.is_current"
                  label="Current Term"
                  color="primary"
                ></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="termDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveTerm"
            :loading="termSaving"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Grade Dialog -->
    <v-dialog v-model="gradeDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 bg-primary text-white py-3 px-4">
          {{ editingGrade ? 'Edit Grade' : 'Add Grade' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="gradeForm">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="gradeItem.letter"
                  label="Letter Grade"
                  variant="outlined"
                  :rules="[v => !!v || 'Letter grade is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="gradeItem.min_percentage"
                  label="Minimum Percentage"
                  type="number"
                  variant="outlined"
                  :rules="[v => !!v || 'Minimum percentage is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="gradeItem.max_percentage"
                  label="Maximum Percentage"
                  type="number"
                  variant="outlined"
                  :rules="[v => !!v || 'Maximum percentage is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="gradeItem.gpa_points"
                  label="GPA Points"
                  type="number"
                  step="0.1"
                  variant="outlined"
                  :rules="[v => !!v || 'GPA points is required']"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="gradeDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveGrade"
            :loading="gradeSaving"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PageHeader from '@/views/components/PageHeader.vue';
import apiClient from '@/utils/apiClient';
import { API_ROUTES } from '@/utils/config/apiRoutes';

// Tab state
const activeTab = ref('general');

// Loading state
const saving = ref(false);

// Settings data
const settings = ref({
  institutionName: 'Smart College',
  contactEmail: 'admin@smartcollege.edu',
  timezone: 'UTC',
  language: 'en',
  twoFactorAuth: false,
  passwordPolicy: true,
  sessionTimeout: 30
});

// Timezone and language options
const timezones = [
  { title: 'UTC', value: 'UTC' },
  { title: 'America/New_York', value: 'America/New_York' },
  { title: 'Europe/London', value: 'Europe/London' },
  { title: 'Asia/Tokyo', value: 'Asia/Tokyo' }
];

const languages = [
  { title: 'English', value: 'en' },
  { title: 'Spanish', value: 'es' },
  { title: 'French', value: 'fr' },
  { title: 'German', value: 'de' }
];

// Academic Terms
const academicTerms = ref([
  {
    id: 1,
    name: 'Fall',
    year: '2024-2025',
    start_date: '2024-09-01',
    end_date: '2024-12-15',
    is_current: true
  },
  {
    id: 2,
    name: 'Spring',
    year: '2024-2025',
    start_date: '2025-01-15',
    end_date: '2025-05-15',
    is_current: false
  }
]);

const termHeaders = [
  { title: 'Term', key: 'name' },
  { title: 'Year', key: 'year' },
  { title: 'Start Date', key: 'start_date' },
  { title: 'End Date', key: 'end_date' },
  { title: 'Current', key: 'is_current', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false }
];

// Grading System
const gradingSystem = ref([
  { id: 1, letter: 'A', min_percentage: 90, max_percentage: 100, gpa_points: 4.0 },
  { id: 2, letter: 'B', min_percentage: 80, max_percentage: 89, gpa_points: 3.0 },
  { id: 3, letter: 'C', min_percentage: 70, max_percentage: 79, gpa_points: 2.0 },
  { id: 4, letter: 'D', min_percentage: 60, max_percentage: 69, gpa_points: 1.0 },
  { id: 5, letter: 'F', min_percentage: 0, max_percentage: 59, gpa_points: 0.0 }
]);

const gradeHeaders = [
  { title: 'Letter', key: 'letter' },
  { title: 'Min %', key: 'min_percentage' },
  { title: 'Max %', key: 'max_percentage' },
  { title: 'GPA', key: 'gpa_points' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false }
];

// User Roles
const userRoles = ref([
  { id: 1, name: 'Administrator', description: 'Full system access', active: true },
  { id: 2, name: 'Faculty', description: 'Department and course management', active: true },
  { id: 3, name: 'Staff', description: 'Limited administrative access', active: true },
  { id: 4, name: 'Student', description: 'Access to student resources', active: true },
  { id: 5, name: 'Guest', description: 'Limited view-only access', active: false }
]);

// Integrations
const integrations = ref([
  { 
    id: 1, 
    name: 'LMS Integration', 
    description: 'Connect with popular learning management systems',
    active: true,
    apiKey: 'lms-api-key-123',
    apiSecret: '********'
  },
  { 
    id: 2, 
    name: 'Payment Gateway', 
    description: 'Process student payments and fees',
    active: false,
    apiKey: '',
    apiSecret: ''
  },
  { 
    id: 3, 
    name: 'Calendar Sync', 
    description: 'Synchronize academic schedules with calendars',
    active: false,
    apiKey: '',
    apiSecret: ''
  }
]);

// Term dialog
const termDialog = ref(false);
const termSaving = ref(false);
const editingTerm = ref(false);
const termItem = ref({
  id: null,
  name: '',
  year: '',
  start_date: '',
  end_date: '',
  is_current: false
});

// Grade dialog
const gradeDialog = ref(false);
const gradeSaving = ref(false);
const editingGrade = ref(false);
const gradeItem = ref({
  id: null,
  letter: '',
  min_percentage: 0,
  max_percentage: 0,
  gpa_points: 0
});

// Lifecycle hooks
onMounted(async () => {
  await fetchSettings();
});

// Methods
async function fetchSettings() {
  try {
    // In a real implementation, these would be API calls to get actual settings
    // const response = await apiClient.get(API_ROUTES.SETTINGS_ROUTE);
    // settings.value = response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
  }
}

async function saveSettings() {
  saving.value = true;
  
  try {
    // In a real implementation, this would save to the API
    // await apiClient.put(API_ROUTES.SETTINGS_ROUTE, settings.value);
    
    console.log('Settings saved:', settings.value);
    setTimeout(() => {
      saving.value = false;
    }, 1000);
  } catch (error) {
    console.error('Error saving settings:', error);
    saving.value = false;
  }
}

function resetSettings() {
  // Reset to default values
  settings.value = {
    institutionName: 'Smart College',
    contactEmail: 'admin@smartcollege.edu',
    timezone: 'UTC',
    language: 'en',
    twoFactorAuth: false,
    passwordPolicy: true,
    sessionTimeout: 30
  };
}

// Term methods
function addTerm() {
  editingTerm.value = false;
  termItem.value = {
    id: null,
    name: '',
    year: '',
    start_date: '',
    end_date: '',
    is_current: false
  };
  termDialog.value = true;
}

function editTerm(item) {
  editingTerm.value = true;
  termItem.value = { ...item };
  termDialog.value = true;
}

async function saveTerm() {
  termSaving.value = true;
  
  try {
    if (editingTerm.value) {
      // Update existing term
      const index = academicTerms.value.findIndex(term => term.id === termItem.value.id);
      if (index !== -1) {
        academicTerms.value[index] = { ...termItem.value };
      }
    } else {
      // Add new term
      const newTerm = {
        ...termItem.value,
        id: Math.max(0, ...academicTerms.value.map(t => t.id)) + 1
      };
      academicTerms.value.push(newTerm);
    }
    
    termDialog.value = false;
  } catch (error) {
    console.error('Error saving term:', error);
  } finally {
    termSaving.value = false;
  }
}

function deleteTerm(item) {
  const index = academicTerms.value.findIndex(term => term.id === item.id);
  if (index !== -1) {
    academicTerms.value.splice(index, 1);
  }
}

// Grade methods
function addGrade() {
  editingGrade.value = false;
  gradeItem.value = {
    id: null,
    letter: '',
    min_percentage: 0,
    max_percentage: 0,
    gpa_points: 0
  };
  gradeDialog.value = true;
}

function editGrade(item) {
  editingGrade.value = true;
  gradeItem.value = { ...item };
  gradeDialog.value = true;
}

async function saveGrade() {
  gradeSaving.value = true;
  
  try {
    if (editingGrade.value) {
      // Update existing grade
      const index = gradingSystem.value.findIndex(grade => grade.id === gradeItem.value.id);
      if (index !== -1) {
        gradingSystem.value[index] = { ...gradeItem.value };
      }
    } else {
      // Add new grade
      const newGrade = {
        ...gradeItem.value,
        id: Math.max(0, ...gradingSystem.value.map(g => g.id)) + 1
      };
      gradingSystem.value.push(newGrade);
    }
    
    gradeDialog.value = false;
  } catch (error) {
    console.error('Error saving grade:', error);
  } finally {
    gradeSaving.value = false;
  }
}

function deleteGrade(item) {
  const index = gradingSystem.value.findIndex(grade => grade.id === item.id);
  if (index !== -1) {
    gradingSystem.value.splice(index, 1);
  }
}
</script>

<style scoped>
.settings-view {
  min-height: calc(100vh - 120px);
}
</style> 