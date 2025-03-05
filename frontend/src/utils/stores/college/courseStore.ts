import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ListStoreState, FilterState } from '../base/types';
import type { 
  Course, 
  CourseSchedule, 
  CourseEnrollment 
} from '../../interfaces/college/courseInterface';
import courseService from '../../services/college/courseService';

// Initial filters
const initialFilters: FilterState = {
  search: '',
  sortBy: 'course_code',
  sortOrder: 'asc',
  filters: {},
  page: 1,
  pageSize: 10
};

export const useCourseStore = defineStore('course', () => {
  // State
  const items = ref<Course[]>([]);
  const pagination = ref({
    count: 0,
    next: null as string | null,
    previous: null as string | null
  });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedItem = ref<Course | null>(null);
  
  // Additional state
  const schedules = ref<CourseSchedule[]>([]);
  const enrollments = ref<CourseEnrollment[]>([]);
  const filters = ref<FilterState>({ ...initialFilters });

  // Getters
  const courseById = (id: number): Course | null => {
    return items.value.find(course => course.id === id) || null;
  };

  // Actions
  async function fetchCourses(params = {}) {
    loading.value = true;
    error.value = null;
    
    try {
      const queryParams = {
        page: filters.value.page,
        page_size: filters.value.pageSize,
        search: filters.value.search,
        ordering: `${filters.value.sortOrder === 'desc' ? '-' : ''}${filters.value.sortBy}`,
        ...filters.value.filters,
        ...params
      };
      
      const response = await courseService.getCourses(queryParams);
      console.log('Course API response:', response.data);
      
      // Handle both paginated and non-paginated responses
      if (Array.isArray(response.data)) {
        // Direct array response
        items.value = response.data as Course[];
        pagination.value = {
          count: response.data.length,
          next: null,
          previous: null
        };
      } else if (response.data.results) {
        // Paginated response
        items.value = response.data.results as Course[];
        pagination.value = {
          count: response.data.count || 0,
          next: response.data.next,
          previous: response.data.previous
        };
      } else {
        // Unknown format, try to use the data directly
        console.warn('Unexpected API response format:', response.data);
        const processedData = Array.isArray(response.data) ? response.data : [response.data];
        items.value = processedData as Course[];
        pagination.value = {
          count: items.value.length,
          next: null,
          previous: null
        };
      }
      
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Failed to fetch courses';
    }
  }
  
  async function fetchCourseById(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await courseService.getCourseById(id);
      selectedItem.value = response.data;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to fetch course with ID ${id}`;
    }
  }
  
  async function createCourse(courseData: Partial<Course>) {
    loading.value = true;
    error.value = null;
    
    try {
      console.log('Creating course with data:', courseData);
      const response = await courseService.createCourse(courseData);
      items.value = [response.data, ...items.value];
      loading.value = false;
      return response.data;
    } catch (err: any) {
      console.error('Error creating course:', err);
      loading.value = false;
      
      // Try to extract detailed error information
      if (err.response?.data) {
        console.error('API error response:', err.response.data);
        
        // Handle Django REST Framework validation errors
        if (typeof err.response.data === 'object') {
          const errorMessages = [];
          for (const [field, messages] of Object.entries(err.response.data)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${messages}`);
            }
          }
          
          if (errorMessages.length > 0) {
            error.value = errorMessages.join('\n');
          } else {
            error.value = JSON.stringify(err.response.data);
          }
        } else {
          error.value = err.response.data.detail || JSON.stringify(err.response.data);
        }
      } else {
        error.value = err.message || 'Failed to create course';
      }
      
      throw err;
    }
  }
  
  async function updateCourse(id: number, courseData: Partial<Course>) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await courseService.updateCourse(id, courseData);
      items.value = items.value.map(item => item.id === id ? response.data : item);
      if (selectedItem.value?.id === id) {
        selectedItem.value = response.data;
      }
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to update course with ID ${id}`;
    }
  }
  
  async function deleteCourse(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      await courseService.deleteCourse(id);
      items.value = items.value.filter(item => item.id !== id);
      if (selectedItem.value?.id === id) {
        selectedItem.value = null;
      }
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to delete course with ID ${id}`;
    }
  }
  
  async function fetchCourseSchedules(courseId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await courseService.getCourseSchedule(courseId);
      schedules.value = response.data.results;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to fetch schedules for course with ID ${courseId}`;
    }
  }
  
  async function updateCourseSchedule(courseId: number, scheduleData: Partial<CourseSchedule>[]) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await courseService.updateCourseSchedule(courseId, scheduleData);
      schedules.value = response.data;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to update schedule for course`;
    }
  }
  
  async function fetchCourseEnrollments(courseId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await courseService.getCourseEnrollments(courseId);
      enrollments.value = response.data.results;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to fetch enrollments for course with ID ${courseId}`;
    }
  }
  
  async function enrollStudent(courseId: number, studentId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await courseService.enrollStudent(courseId, studentId);
      enrollments.value = [...enrollments.value, response.data];
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to enroll student in course`;
    }
  }
  
  async function unenrollStudent(courseId: number, enrollmentId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      await courseService.unenrollStudent(courseId, enrollmentId);
      enrollments.value = enrollments.value.filter(enrollment => enrollment.id !== enrollmentId);
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to unenroll student from course`;
    }
  }
  
  function setFilters(newFilters: Partial<FilterState>) {
    filters.value = { ...filters.value, ...newFilters };
  }
  
  function resetFilters() {
    filters.value = { ...initialFilters };
  }
  
  function clearError() {
    error.value = null;
  }
  
  function resetState() {
    items.value = [];
    pagination.value = {
      count: 0,
      next: null,
      previous: null
    };
    loading.value = false;
    error.value = null;
    selectedItem.value = null;
    schedules.value = [];
    enrollments.value = [];
    filters.value = { ...initialFilters };
  }

  return {
    // State
    items,
    pagination,
    loading,
    error,
    selectedItem,
    schedules,
    enrollments,
    filters,
    
    // Getters
    courseById,
    
    // Actions
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    fetchCourseSchedules,
    updateCourseSchedule,
    fetchCourseEnrollments,
    enrollStudent,
    unenrollStudent,
    setFilters,
    resetFilters,
    clearError,
    resetState
  };
});
