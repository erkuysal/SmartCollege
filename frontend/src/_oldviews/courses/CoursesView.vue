<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ListLayout from '../components/ListLayout.vue';
import { getNavItemColor } from '../../utils/navigation';
import { useCourseStore } from '../../utils/stores/college/courseStore';
import type { Course, PopulatedCourse } from '../../utils/interfaces/college/courseInterface';

const router = useRouter();
const courseStore = useCourseStore();
const courseColor = getNavItemColor('Courses');

// State
const searchQuery = ref('');
const selectedDepartment = ref<string | null>(null);
const selectedCredits = ref<number | null>(null);
const page = ref(1);
const itemsPerPage = ref(10);
const totalItems = computed(() => courseStore.pagination.count);

// Extract unique departments from courses for filters
const departments = computed(() => {
  const uniqueDepartments = new Set<string>();
  courseStore.items.forEach(course => {
    if (typeof course.department === 'object' && course.department?.name) {
      uniqueDepartments.add(course.department.name);
    } else if (course.department_name) {
      uniqueDepartments.add(course.department_name);
    }
  });
  return Array.from(uniqueDepartments);
});

// Department helper function
const getDepartmentName = (course: Course | PopulatedCourse): string => {
  if (typeof course.department === 'object' && course.department?.name) {
    return course.department.name;
  } else if ('department_name' in course) {
    return course.department_name;
  }
  return `Department ID: ${course.department}`;
};

// Credit options
const creditOptions = [1, 2, 3, 4, 5];

// Table headers
const headers = [
  { title: 'Code', key: 'code' },
  { title: 'Name', key: 'name' },
  { title: 'Department', key: 'department_display' },
  { title: 'Credits', key: 'credits' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false }
];

// Filtered courses based on selected filters
const filteredCourses = computed(() => {
  return courseStore.items.map(course => ({
    ...course,
    department_display: getDepartmentName(course)
  })).filter(course => {
    // Apply department filter
    if (selectedDepartment.value && selectedDepartment.value !== 'All Departments') {
      const departmentName = getDepartmentName(course);
      if (departmentName !== selectedDepartment.value) {
        return false;
      }
    }
    
    // Apply credits filter
    if (selectedCredits.value !== null) {
      if (course.credits !== selectedCredits.value) {
        return false;
      }
    }
    
    return true;
  });
});

// Handlers
const handleAddCourse = () => {
  router.push('/dashboard/courses/add');
};

const handleEditCourse = (id: number) => {
  router.push(`/dashboard/courses/edit/${id}`);
};

const handleViewDetails = (id: number) => {
  router.push(`/dashboard/courses/${id}`);
};

const handleDeleteCourse = async (id: number) => {
  try {
    await courseStore.deleteCourse(id);
    // Success notification could be added here
  } catch (error) {
    console.error('Error deleting course:', error);
    // Error notification could be added here
  }
};

const handleSearch = (query: string) => {
  searchQuery.value = query;
  updateFilters();
};

const handlePageChange = (newPage: number) => {
  page.value = newPage;
  updateFilters();
};

const resetFilters = () => {
  selectedDepartment.value = null;
  selectedCredits.value = null;
  updateFilters();
};

// Update store filters and fetch data
const updateFilters = () => {
  courseStore.setFilters({
    page: page.value,
    pageSize: itemsPerPage.value,
    search: searchQuery.value,
    filters: {
      // Add API-specific filter parameters here if needed
    }
  });
  
  fetchCourses();
};

// Fetch courses with current filters
const fetchCourses = async () => {
  try {
    await courseStore.fetchCourses();
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
};

// Load data on component mount
onMounted(() => {
  fetchCourses();
});
</script>

<template>
  <ListLayout
    title="Courses"
    subtitle="Manage academic courses"
    icon="mdi-book-multiple"
    primaryAction="Add Course"
    primaryActionIcon="mdi-plus"
    :iconColor="courseColor"
    :loading="courseStore.loading"
    :isEmpty="filteredCourses.length === 0"
    :showPagination="true"
    :totalItems="totalItems"
    :page="page"
    :itemsPerPage="itemsPerPage"
    emptyStateTitle="No Courses Found"
    emptyStateMessage="There are no courses in the system yet."
    @search="handleSearch"
    @primary-action="handleAddCourse"
    @page-change="handlePageChange"
  >
    <!-- Filters slot -->
    <template #filters>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedDepartment"
            label="Department"
            :items="['All Departments', ...departments]"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedCredits"
            label="Credits"
            :items="creditOptions"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <v-btn 
            variant="text" 
            :color="courseColor" 
            @click="resetFilters"
          >
            Reset Filters
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <!-- Main content -->
    <v-data-table
      :loading="courseStore.loading"
      :items="filteredCourses"
      :headers="headers"
      :items-per-page="itemsPerPage"
      :page="page"
      @update:page="page = $event"
      @update:items-per-page="itemsPerPage = $event"
      item-value="id"
      class="elevation-1"
    >
      <template v-slot:item.department_display="{ item }">
        {{ item.department_display }}
      </template>
      
      <template v-slot:item.status="{ item }">
        <v-chip
          :color="item.is_active ? 'success' : 'error'"
          size="small"
        >
          {{ item.is_active ? 'ACTIVE' : 'INACTIVE' }}
        </v-chip>
      </template>
      
      <template v-slot:item.actions="{ item }">
        <v-icon 
          size="small" 
          class="me-2" 
          @click="handleViewDetails(item.id)"
          title="View details"
        >
          mdi-eye
        </v-icon>
        <v-icon 
          size="small" 
          class="me-2" 
          @click="handleEditCourse(item.id)"
          title="Edit"
        >
          mdi-pencil
        </v-icon>
        <v-icon 
          size="small" 
          @click="handleDeleteCourse(item.id)"
          title="Delete"
        >
          mdi-delete
        </v-icon>
      </template>
      
      <template v-slot:no-data>
        <p class="text-center py-4">No courses found. Try adjusting your filters.</p>
      </template>
    </v-data-table>
  </ListLayout>
</template>

<style scoped>
/* Custom styles here if needed */
</style> 