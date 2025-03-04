<template>
  <div class="faculties-container p-4">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <span class="text-h5">Faculties</span>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="router.push('/admin/faculties/add')"
        >
          Add Faculty
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Dean</th>
              <th>Office Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center">
                <v-progress-circular indeterminate />
              </td>
            </tr>
            <tr v-else-if="!faculties.length">
              <td colspan="6" class="text-center">
                No faculties found
              </td>
            </tr>
            <tr v-for="faculty in faculties" :key="faculty.id">
              <td>{{ faculty.name }}</td>
              <td>{{ faculty.code }}</td>
              <td>{{ faculty.dean || 'Not assigned' }}</td>
              <td>{{ faculty.office_location || 'Not specified' }}</td>
              <td>
                <v-chip
                  :color="faculty.is_active ? 'success' : 'error'"
                  size="small"
                >
                  {{ faculty.is_active ? 'Active' : 'Inactive' }}
                </v-chip>
              </td>
              <td>
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  size="small"
                  color="primary"
                  @click="editFaculty(faculty)"
                />
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  @click="confirmDelete(faculty)"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">Delete Faculty</v-card-title>
        <v-card-text>
          Are you sure you want to delete {{ selectedFaculty?.name }}? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            :loading="deleteLoading"
            @click="deleteFaculty"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="3000"
    >
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFacultyStore } from '@/utils/stores/college/facultyStore'
import type { Faculty } from '@/utils/interfaces/college/facultyInterface'

const router = useRouter()
const facultyStore = useFacultyStore()

const loading = ref(false)
const deleteLoading = ref(false)
const showDeleteDialog = ref(false)
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const selectedFaculty = ref<Faculty | null>(null)

const faculties = computed(() => facultyStore.items || [])

const loadFaculties = async () => {
  loading.value = true
  try {
    await facultyStore.fetchFaculties()
  } catch (error) {
    console.error('Error loading faculties:', error)
    snackbarText.value = 'Error loading faculties'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    loading.value = false
  }
}

const editFaculty = (faculty: Faculty) => {
  router.push(`/admin/faculties/edit/${faculty.id}`)
}

const confirmDelete = (faculty: Faculty) => {
  selectedFaculty.value = faculty
  showDeleteDialog.value = true
}

const deleteFaculty = async () => {
  if (!selectedFaculty.value) return

  deleteLoading.value = true
  try {
    await facultyStore.deleteFaculty(selectedFaculty.value.id)
    showDeleteDialog.value = false
    snackbarText.value = 'Faculty deleted successfully'
    snackbarColor.value = 'success'
    showSnackbar.value = true
    await loadFaculties()
  } catch (error) {
    console.error('Error deleting faculty:', error)
    snackbarText.value = 'Error deleting faculty'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  loadFaculties()
})
</script>

<style scoped>
.faculties-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style> 