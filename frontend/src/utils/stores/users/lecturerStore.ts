import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ListStoreState, FilterState } from '../base/types';
import type { 
  Lecturer, 
  CourseAssignment, 
  LecturerSchedule, 
  Attendance,
  OfficeHours
} from '../../interfaces/users/lecturerInterface';
import lecturerService from '../../services/users/lecturerService';
import type { RFIDCard } from '../../interfaces/utilities/RFIDInterface';

// Initial filters
const initialFilters: FilterState = {
  search: '',
  sortBy: 'last_name',
  sortOrder: 'asc',
  filters: {},
  page: 1,
  pageSize: 10
};

export const useLecturerStore = defineStore('lecturer', () => {
  // State
  const items = ref<Lecturer[]>([]);
  const pagination = ref({
    count: 0,
    next: null as string | null,
    previous: null as string | null
  });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedItem = ref<Lecturer | null>(null);
  
  // Additional state
  const assignedCourses = ref<CourseAssignment[]>([]);
  const schedule = ref<LecturerSchedule[]>([]);
  const attendanceRecords = ref<Attendance[]>([]);
  const officeHours = ref<OfficeHours[]>([]);
  const rfidCard = ref<RFIDCard | null>(null);
  const teachingLoad = ref(0);
  const filters = ref<FilterState>({ ...initialFilters });

  // Getters
  const lecturerById = (id: number): Lecturer | null => {
    return items.value.find(lecturer => lecturer.id === id) || null;
  };

  // Actions
  async function fetchLecturers(params = {}) {
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
      
      const response = await lecturerService.getLecturers(queryParams);
      console.log('Lecturer API response:', response.data);
      
      // Handle both paginated and non-paginated responses
      if (Array.isArray(response.data)) {
        // Direct array response
        items.value = response.data as Lecturer[];
        pagination.value = {
          count: response.data.length,
          next: null,
          previous: null
        };
      } else if (response.data.results) {
        // Paginated response
        items.value = response.data.results as Lecturer[];
        pagination.value = {
          count: response.data.count || 0,
          next: response.data.next,
          previous: response.data.previous
        };
      } else {
        // Unknown format, try to use the data directly
        console.warn('Unexpected API response format:', response.data);
        const processedData = Array.isArray(response.data) ? response.data : [response.data];
        items.value = processedData as Lecturer[];
        pagination.value = {
          count: items.value.length,
          next: null,
          previous: null
        };
      }
      
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Failed to fetch lecturers';
      console.error('Error fetching lecturers:', err);
    }
  }
  
  async function fetchLecturerById(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await lecturerService.getLecturerById(id);
      selectedItem.value = response.data;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to fetch lecturer with ID ${id}`;
    }
  }
  
  async function createLecturer(lecturerData: Partial<Lecturer>) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await lecturerService.createLecturer(lecturerData);
      items.value = [...items.value, response.data];
      loading.value = false;
      return response.data;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Failed to create lecturer';
      return null;
    }
  }
  
  async function updateLecturer(id: number, lecturerData: Partial<Lecturer>) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await lecturerService.updateLecturer(id, lecturerData);
      items.value = items.value.map(lecturer => 
        lecturer.id === id ? { ...lecturer, ...response.data } : lecturer
      );
      if (selectedItem.value && selectedItem.value.id === id) {
        selectedItem.value = { ...selectedItem.value, ...response.data };
      }
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to update lecturer with ID ${id}`;
    }
  }
  
  async function deleteLecturer(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      await lecturerService.deleteLecturer(id);
      items.value = items.value.filter(lecturer => lecturer.id !== id);
      if (selectedItem.value && selectedItem.value.id === id) {
        selectedItem.value = null;
      }
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to delete lecturer with ID ${id}`;
    }
  }
  
  async function fetchAssignedCourses(lecturerId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await lecturerService.getAssignedCourses(lecturerId);
      assignedCourses.value = response.data.results;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to fetch courses for lecturer with ID ${lecturerId}`;
    }
  }
  
  async function assignCourse(lecturerId: number, courseId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await lecturerService.assignCourse(lecturerId, courseId);
      assignedCourses.value = [...assignedCourses.value, response.data];
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to assign course to lecturer`;
    }
  }
  
  async function removeCourseAssignment(lecturerId: number, assignmentId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      await lecturerService.removeCourseAssignment(lecturerId, assignmentId);
      assignedCourses.value = assignedCourses.value.filter(assignment => assignment.id !== assignmentId);
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to remove course assignment`;
    }
  }
  
  async function fetchLecturerSchedule(lecturerId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await lecturerService.getLecturerSchedule(lecturerId);
      schedule.value = response.data.results;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to fetch schedule for lecturer with ID ${lecturerId}`;
    }
  }
  
  async function submitAttendance(courseId: number, attendanceData: Partial<Attendance>) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await lecturerService.submitAttendance(courseId, attendanceData);
      attendanceRecords.value = [...attendanceRecords.value, response.data];
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to submit attendance`;
    }
  }
  
  async function updateAttendance(attendanceId: number, status: string, notes?: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await lecturerService.updateAttendance(attendanceId, status, notes);
      attendanceRecords.value = attendanceRecords.value.map(record => 
        record.id === attendanceId ? { ...record, ...response.data } : record
      );
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to update attendance`;
    }
  }
  
  async function fetchTeachingLoad(lecturerId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await lecturerService.getTeachingLoad(lecturerId);
      teachingLoad.value = response.data.teaching_load;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to fetch teaching load for lecturer with ID ${lecturerId}`;
    }
  }
  
  async function fetchOfficeHours(lecturerId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await lecturerService.getOfficeHours(lecturerId);
      officeHours.value = response.data.results;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to fetch office hours for lecturer with ID ${lecturerId}`;
    }
  }
  
  async function updateOfficeHours(lecturerId: number, officeHoursData: Partial<OfficeHours>[]) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await lecturerService.updateOfficeHours(lecturerId, officeHoursData);
      officeHours.value = response.data;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to update office hours`;
    }
  }
  
  async function fetchLecturerRFIDCard(lecturerId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await lecturerService.getLecturerRFIDCard(lecturerId);
      rfidCard.value = response.data;
      loading.value = false;
    } catch (err: any) {
      // If 404, it means the lecturer doesn't have an RFID card
      if (err.response?.status === 404) {
        rfidCard.value = null;
        loading.value = false;
      } else {
        loading.value = false;
        error.value = err.response?.data?.detail || `Failed to fetch RFID card for lecturer with ID ${lecturerId}`;
      }
    }
  }
  
  async function assignRFIDCard(lecturerId: number, cardId: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await lecturerService.assignRFIDCard(lecturerId, cardId);
      rfidCard.value = response.data;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to assign RFID card to lecturer`;
    }
  }
  
  async function removeRFIDCard(lecturerId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      await lecturerService.removeRFIDCard(lecturerId);
      rfidCard.value = null;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to remove RFID card from lecturer`;
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
    assignedCourses.value = [];
    schedule.value = [];
    attendanceRecords.value = [];
    officeHours.value = [];
    rfidCard.value = null;
    teachingLoad.value = 0;
    filters.value = { ...initialFilters };
  }

  return {
    // State
    items,
    pagination,
    loading,
    error,
    selectedItem,
    assignedCourses,
    schedule,
    attendanceRecords,
    officeHours,
    rfidCard,
    teachingLoad,
    filters,
    
    // Getters
    lecturerById,
    
    // Actions
    fetchLecturers,
    fetchLecturerById,
    createLecturer,
    updateLecturer,
    deleteLecturer,
    fetchAssignedCourses,
    assignCourse,
    removeCourseAssignment,
    fetchLecturerSchedule,
    submitAttendance,
    updateAttendance,
    fetchTeachingLoad,
    fetchOfficeHours,
    updateOfficeHours,
    fetchLecturerRFIDCard,
    assignRFIDCard,
    removeRFIDCard,
    setFilters,
    resetFilters,
    clearError,
    resetState
  };
}); 