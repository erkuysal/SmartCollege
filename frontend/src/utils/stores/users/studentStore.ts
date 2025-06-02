import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ListStoreState, FilterState } from '../base/types';
import type { 
  Student, 
  EnrolledCourse, 
  StudentAttendance, 
  StudentGrade
} from '../../interfaces/users/studentInterface';
import studentService from '../../services/users/studentService';
import { rfidService } from '../../services/utilities/RFIDService';
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

export const useStudentStore = defineStore('student', () => {
  // State
  const items = ref<Student[]>([]);
  const pagination = ref({
    count: 0,
    next: null as string | null,
    previous: null as string | null
  });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedItem = ref<Student | null>(null);
  
  // Additional state
  const courses = ref<EnrolledCourse[]>([]);
  const attendanceRecords = ref<StudentAttendance[]>([]);
  const grades = ref<StudentGrade[]>([]);
  const rfidCard = ref<RFIDCard | null>(null);
  const filters = ref<FilterState>({ ...initialFilters });

  // Getters
  const studentById = (id: number): Student | null => {
    return items.value.find(student => student.id === id) || null;
  };

  // Actions
  async function fetchStudents(params = {}) {
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
      
      console.log('Fetching students with params:', queryParams);
      const response = await studentService.getStudents(queryParams);
      console.log('Student API response:', response.data);
      
      // Handle both paginated and non-paginated responses
      if (Array.isArray(response.data)) {
        // Direct array response
        items.value = response.data as Student[];
        pagination.value = {
          count: response.data.length,
          next: null,
          previous: null
        };
      } else if (response.data.results) {
        // Paginated response
        items.value = response.data.results as Student[];
        pagination.value = {
          count: response.data.count || 0,
          next: response.data.next,
          previous: response.data.previous
        };
      } else {
        // Unknown format, try to use the data directly
        console.warn('Unexpected API response format:', response.data);
        const processedData = Array.isArray(response.data) ? response.data : [response.data];
        items.value = processedData as Student[];
        pagination.value = {
          count: items.value.length,
          next: null,
          previous: null
        };
      }
      
      console.log('Processed students:', items.value);
      loading.value = false;
    } catch (err: any) {
      console.error('Error fetching students:', err);
      loading.value = false;
      error.value = err.response?.data?.detail || 'Failed to fetch students';
    }
  }
  
  async function fetchStudentById(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await studentService.getStudentById(id);
      selectedItem.value = {
        ...response.data,
        courses: response.data.courses ?? [],
        attendance_records: response.data.attendance_records ?? [],
        grades: response.data.grades ?? []
      };
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to fetch student with ID ${id}`;
    }
  }
  
  async function createStudent(studentData: Partial<Student>) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await studentService.createStudent(studentData);
      items.value = [...items.value, response.data];
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Failed to create student';
    }
  }
  
  async function updateStudent(id: number, studentData: Partial<Student>) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await studentService.updateStudent(id, studentData);
      items.value = items.value.map(student => 
        student.id === id ? { ...student, ...response.data } : student
      );
      if (selectedItem.value && selectedItem.value.id === id) {
        selectedItem.value = { ...selectedItem.value, ...response.data };
      }
      loading.value = false;
      return response.data;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to update student with ID ${id}`;
      throw err;
    }
  }
  
  /**
   * Safe update student method that ensures critical fields like student_number cannot be changed
   */
  async function safeUpdateStudent(id: number, studentData: Partial<Student>) {
    loading.value = true;
    error.value = null;
    
    try {
      // Get the current student data from the store or fetch it if not available
      let originalStudent = items.value.find(student => student.id === id);
      
      if (!originalStudent) {
        // If not in the store, fetch it from the API
        const response = await studentService.getStudentById(id);
        originalStudent = response.data;
      }
      
      // Safety check: prevent student_number from being changed
      if (studentData.student_number && originalStudent && 
          studentData.student_number !== originalStudent.student_number) {
        console.error('Attempt to change student number detected and prevented');
        error.value = 'Student number cannot be modified';
        loading.value = false;
        return null;
      }
      
      // Safe to update now - exclude student_number from the update
      const { student_number, ...safeData } = studentData;
      
      const response = await studentService.updateStudent(id, safeData);
      
      // Update the items in the store
      items.value = items.value.map(student => 
        student.id === id ? { ...student, ...response.data } : student
      );
      
      // Update selectedItem if it's the same student
      if (selectedItem.value && selectedItem.value.id === id) {
        selectedItem.value = { ...selectedItem.value, ...response.data };
      }
      
      loading.value = false;
      return response.data;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to update student with ID ${id}`;
      throw err;
    }
  }
  
  async function deleteStudent(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      await studentService.deleteStudent(id);
      items.value = items.value.filter(student => student.id !== id);
      if (selectedItem.value && selectedItem.value.id === id) {
        selectedItem.value = null;
      }
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to delete student with ID ${id}`;
    }
  }
  
  async function fetchStudentCourses(studentId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await studentService.getStudentCourses(studentId);
      courses.value = response.data.results;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to fetch courses for student with ID ${studentId}`;
    }
  }
  
  async function dropCourse(studentId: number, enrollmentId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      await studentService.dropCourse(studentId, enrollmentId);
      courses.value = courses.value.filter(course => course.id !== enrollmentId);
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to drop course`;
    }
  }
  
  async function fetchStudentAttendance(studentId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await studentService.getStudentAttendance(studentId);
      attendanceRecords.value = response.data.results;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to fetch attendance for student with ID ${studentId}`;
    }
  }
  
  async function fetchStudentGrades(studentId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await studentService.getStudentGrades(studentId);
      grades.value = response.data.results;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to fetch grades for student with ID ${studentId}`;
    }
  }
  
  async function fetchStudentRFIDCard(studentId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await studentService.getStudentRFIDCard(studentId);
      rfidCard.value = response.data;
      loading.value = false;
    } catch (err: any) {
      // If 404, it means the student doesn't have an RFID card
      if (err.response?.status === 404) {
        rfidCard.value = null;
        loading.value = false;
      } else {
        loading.value = false;
        error.value = err.response?.data?.detail || `Failed to fetch RFID card for student with ID ${studentId}`;
      }
    }
  }
  
  async function assignRFIDCard(studentId: number, cardId: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await studentService.assignRFIDCard(studentId, cardId);
      rfidCard.value = response.data;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to assign RFID card to student`;
    }
  }
  
  async function removeRFIDCard(studentId: number) {
    loading.value = true;
    error.value = null;
    
    try {
      await studentService.removeRFIDCard(studentId);
      rfidCard.value = null;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to remove RFID card from student`;
    }
  }
  
  async function readRFIDCard(cardId: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await rfidService.readRFID();
      if (response.data && response.data.user_code) {
        rfidCard.value = response.data.rfid;
        loading.value = false;
        return { 
          success: true, 
          cardId,
          userCode: response.data.user_code,
          userType: response.data.user_type,
          user: response.data.user
        };
      }
      loading.value = false;
      return { success: false, error: 'Invalid card data' };
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || `Failed to read RFID card`;
      return { success: false, error: error.value };
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
    courses.value = [];
    attendanceRecords.value = [];
    grades.value = [];
    rfidCard.value = null;
    filters.value = { ...initialFilters };
  }

  return {
    // State
    items,
    pagination,
    loading,
    error,
    selectedItem,
    courses,
    attendanceRecords,
    grades,
    rfidCard,
    filters,
    
    // Getters
    studentById,
    
    // Actions
    fetchStudents,
    fetchStudentById,
    createStudent,
    updateStudent,
    safeUpdateStudent,
    deleteStudent,
    fetchStudentCourses,
    dropCourse,
    fetchStudentAttendance,
    fetchStudentGrades,
    fetchStudentRFIDCard,
    assignRFIDCard,
    removeRFIDCard,
    readRFIDCard,
    setFilters,
    resetFilters,
    clearError,
    resetState
  };
});
