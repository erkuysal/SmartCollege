import { defineStore } from 'pinia';
import type {
  AcademicYear,
  Semester,
  CourseOffering,
  ClassSchedule,
  CourseRegistration
} from '../api';
import {
  getAcademicYears,
  getAcademicYear,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  getSemesters,
  getSemester,
  createSemester,
  updateSemester,
  deleteSemester,
  getCourseOfferings,
  getCourseOffering,
  createCourseOffering,
  updateCourseOffering,
  deleteCourseOffering,
  getClassSchedules,
  getClassSchedule,
  createClassSchedule,
  updateClassSchedule,
  deleteClassSchedule,
  generateSessions,
  getCourseRegistrations,
  getCourseRegistration,
  createCourseRegistration,
  updateCourseRegistration,
  deleteCourseRegistration,
  approveRegistration,
  rejectRegistration
} from '../api';

interface AcademicState {
  // Academic Years
  academicYears: AcademicYear[];
  selectedAcademicYear: AcademicYear | null;
  academicYearsLoading: boolean;
  academicYearsError: string | null;
  
  // Semesters
  semesters: Semester[];
  selectedSemester: Semester | null;
  semestersLoading: boolean;
  semestersError: string | null;
  
  // Course Offerings
  courseOfferings: CourseOffering[];
  selectedCourseOffering: CourseOffering | null;
  courseOfferingsLoading: boolean;
  courseOfferingsError: string | null;
  
  // Class Schedules
  classSchedules: ClassSchedule[];
  selectedClassSchedule: ClassSchedule | null;
  classSchedulesLoading: boolean;
  classSchedulesError: string | null;
  
  // Course Registrations
  courseRegistrations: CourseRegistration[];
  selectedCourseRegistration: CourseRegistration | null;
  courseRegistrationsLoading: boolean;
  courseRegistrationsError: string | null;
}

export const useAcademicStore = defineStore('academic', {
  state: (): AcademicState => ({
    // Academic Years
    academicYears: [],
    selectedAcademicYear: null,
    academicYearsLoading: false,
    academicYearsError: null,
    
    // Semesters
    semesters: [],
    selectedSemester: null,
    semestersLoading: false,
    semestersError: null,
    
    // Course Offerings
    courseOfferings: [],
    selectedCourseOffering: null,
    courseOfferingsLoading: false,
    courseOfferingsError: null,
    
    // Class Schedules
    classSchedules: [],
    selectedClassSchedule: null,
    classSchedulesLoading: false,
    classSchedulesError: null,
    
    // Course Registrations
    courseRegistrations: [],
    selectedCourseRegistration: null,
    courseRegistrationsLoading: false,
    courseRegistrationsError: null,
  }),

  actions: {
    // Academic Year Actions
    async fetchAcademicYears() {
      this.academicYearsLoading = true;
      this.academicYearsError = null;
      try {
        const response = await getAcademicYears();
        this.academicYears = response.data.results;
      } catch (error) {
        this.academicYearsError = error instanceof Error ? error.message : 'Failed to fetch academic years';
      } finally {
        this.academicYearsLoading = false;
      }
    },

    async fetchAcademicYear(id: number) {
      this.academicYearsLoading = true;
      this.academicYearsError = null;
      try {
        const response = await getAcademicYear(id);
        this.selectedAcademicYear = response.data;
      } catch (error) {
        this.academicYearsError = error instanceof Error ? error.message : 'Failed to fetch academic year';
      } finally {
        this.academicYearsLoading = false;
      }
    },

    async addAcademicYear(data: { year: string; start_date: string; end_date: string; is_active?: boolean }) {
      this.academicYearsLoading = true;
      this.academicYearsError = null;
      try {
        const response = await createAcademicYear(data);
        this.academicYears.push(response.data);
        return response.data;
      } catch (error) {
        this.academicYearsError = error instanceof Error ? error.message : 'Failed to create academic year';
        throw error;
      } finally {
        this.academicYearsLoading = false;
      }
    },

    async editAcademicYear(id: number, data: Partial<AcademicYear>) {
      this.academicYearsLoading = true;
      this.academicYearsError = null;
      try {
        const response = await updateAcademicYear(id, data);
        const index = this.academicYears.findIndex(ay => ay.id === id);
        if (index !== -1) {
          this.academicYears[index] = response.data;
        }
        if (this.selectedAcademicYear?.id === id) {
          this.selectedAcademicYear = response.data;
        }
        return response.data;
      } catch (error) {
        this.academicYearsError = error instanceof Error ? error.message : 'Failed to update academic year';
        throw error;
      } finally {
        this.academicYearsLoading = false;
      }
    },

    async removeAcademicYear(id: number) {
      this.academicYearsLoading = true;
      this.academicYearsError = null;
      try {
        await deleteAcademicYear(id);
        this.academicYears = this.academicYears.filter(ay => ay.id !== id);
        if (this.selectedAcademicYear?.id === id) {
          this.selectedAcademicYear = null;
        }
      } catch (error) {
        this.academicYearsError = error instanceof Error ? error.message : 'Failed to delete academic year';
        throw error;
      } finally {
        this.academicYearsLoading = false;
      }
    },

    // Semester Actions
    async fetchSemesters() {
      this.semestersLoading = true;
      this.semestersError = null;
      try {
        const response = await getSemesters();
        this.semesters = response.data.results;
      } catch (error) {
        this.semestersError = error instanceof Error ? error.message : 'Failed to fetch semesters';
      } finally {
        this.semestersLoading = false;
      }
    },

    async fetchSemester(id: number) {
      this.semestersLoading = true;
      this.semestersError = null;
      try {
        const response = await getSemester(id);
        this.selectedSemester = response.data;
      } catch (error) {
        this.semestersError = error instanceof Error ? error.message : 'Failed to fetch semester';
      } finally {
        this.semestersLoading = false;
      }
    },

    async addSemester(data: {
      academic_year: number;
      semester_type: 'fall' | 'spring' | 'summer';
      start_date: string;
      end_date: string;
      registration_start: string;
      registration_end: string;
      is_active?: boolean;
    }) {
      this.semestersLoading = true;
      this.semestersError = null;
      try {
        const response = await createSemester(data);
        this.semesters.push(response.data);
        return response.data;
      } catch (error) {
        this.semestersError = error instanceof Error ? error.message : 'Failed to create semester';
        throw error;
      } finally {
        this.semestersLoading = false;
      }
    },

    async editSemester(id: number, data: Partial<Semester>) {
      this.semestersLoading = true;
      this.semestersError = null;
      try {
        const response = await updateSemester(id, data);
        const index = this.semesters.findIndex(s => s.id === id);
        if (index !== -1) {
          this.semesters[index] = response.data;
        }
        if (this.selectedSemester?.id === id) {
          this.selectedSemester = response.data;
        }
        return response.data;
      } catch (error) {
        this.semestersError = error instanceof Error ? error.message : 'Failed to update semester';
        throw error;
      } finally {
        this.semestersLoading = false;
      }
    },

    async removeSemester(id: number) {
      this.semestersLoading = true;
      this.semestersError = null;
      try {
        await deleteSemester(id);
        this.semesters = this.semesters.filter(s => s.id !== id);
        if (this.selectedSemester?.id === id) {
          this.selectedSemester = null;
        }
      } catch (error) {
        this.semestersError = error instanceof Error ? error.message : 'Failed to delete semester';
        throw error;
      } finally {
        this.semestersLoading = false;
      }
    },

    // Course Offering Actions
    async fetchCourseOfferings(params?: { course?: number; semester?: number }) {
      this.courseOfferingsLoading = true;
      this.courseOfferingsError = null;
      try {
        const response = await getCourseOfferings(params);
        this.courseOfferings = response.data.results;
      } catch (error) {
        this.courseOfferingsError = error instanceof Error ? error.message : 'Failed to fetch course offerings';
      } finally {
        this.courseOfferingsLoading = false;
      }
    },

    async fetchCourseOffering(id: number) {
      this.courseOfferingsLoading = true;
      this.courseOfferingsError = null;
      try {
        const response = await getCourseOffering(id);
        this.selectedCourseOffering = response.data;
      } catch (error) {
        this.courseOfferingsError = error instanceof Error ? error.message : 'Failed to fetch course offering';
      } finally {
        this.courseOfferingsLoading = false;
      }
    },

    async addCourseOffering(data: {
      course: number;
      semester: number;
      instructor: number;
      capacity: number;
      is_active?: boolean;
    }) {
      this.courseOfferingsLoading = true;
      this.courseOfferingsError = null;
      try {
        const response = await createCourseOffering(data);
        this.courseOfferings.push(response.data);
        return response.data;
      } catch (error) {
        this.courseOfferingsError = error instanceof Error ? error.message : 'Failed to create course offering';
        throw error;
      } finally {
        this.courseOfferingsLoading = false;
      }
    },

    async editCourseOffering(id: number, data: Partial<CourseOffering>) {
      this.courseOfferingsLoading = true;
      this.courseOfferingsError = null;
      try {
        const response = await updateCourseOffering(id, data);
        const index = this.courseOfferings.findIndex(co => co.id === id);
        if (index !== -1) {
          this.courseOfferings[index] = response.data;
        }
        if (this.selectedCourseOffering?.id === id) {
          this.selectedCourseOffering = response.data;
        }
        return response.data;
      } catch (error) {
        this.courseOfferingsError = error instanceof Error ? error.message : 'Failed to update course offering';
        throw error;
      } finally {
        this.courseOfferingsLoading = false;
      }
    },

    async removeCourseOffering(id: number) {
      this.courseOfferingsLoading = true;
      this.courseOfferingsError = null;
      try {
        await deleteCourseOffering(id);
        this.courseOfferings = this.courseOfferings.filter(co => co.id !== id);
        if (this.selectedCourseOffering?.id === id) {
          this.selectedCourseOffering = null;
        }
      } catch (error) {
        this.courseOfferingsError = error instanceof Error ? error.message : 'Failed to delete course offering';
        throw error;
      } finally {
        this.courseOfferingsLoading = false;
      }
    },

    // Class Schedule Actions
    async fetchClassSchedules(params?: { course_offering?: number }) {
      this.classSchedulesLoading = true;
      this.classSchedulesError = null;
      try {
        const response = await getClassSchedules(params);
        this.classSchedules = response.data.results;
      } catch (error) {
        this.classSchedulesError = error instanceof Error ? error.message : 'Failed to fetch class schedules';
      } finally {
        this.classSchedulesLoading = false;
      }
    },

    async fetchClassSchedule(id: number) {
      this.classSchedulesLoading = true;
      this.classSchedulesError = null;
      try {
        const response = await getClassSchedule(id);
        this.selectedClassSchedule = response.data;
      } catch (error) {
        this.classSchedulesError = error instanceof Error ? error.message : 'Failed to fetch class schedule';
      } finally {
        this.classSchedulesLoading = false;
      }
    },

    async addClassSchedule(data: {
      course_offering: number;
      classroom: number;
      day: string;
      time_slot: number;
      start_date: string;
      end_date: string;
      is_active?: boolean;
      notes?: string;
      recurrence_rule?: string;
    }) {
      this.classSchedulesLoading = true;
      this.classSchedulesError = null;
      try {
        const response = await createClassSchedule(data);
        this.classSchedules.push(response.data);
        return response.data;
      } catch (error) {
        this.classSchedulesError = error instanceof Error ? error.message : 'Failed to create class schedule';
        throw error;
      } finally {
        this.classSchedulesLoading = false;
      }
    },

    async editClassSchedule(id: number, data: Partial<ClassSchedule>) {
      this.classSchedulesLoading = true;
      this.classSchedulesError = null;
      try {
        const response = await updateClassSchedule(id, data);
        const index = this.classSchedules.findIndex(cs => cs.id === id);
        if (index !== -1) {
          this.classSchedules[index] = response.data;
        }
        if (this.selectedClassSchedule?.id === id) {
          this.selectedClassSchedule = response.data;
        }
        return response.data;
      } catch (error) {
        this.classSchedulesError = error instanceof Error ? error.message : 'Failed to update class schedule';
        throw error;
      } finally {
        this.classSchedulesLoading = false;
      }
    },

    async removeClassSchedule(id: number) {
      this.classSchedulesLoading = true;
      this.classSchedulesError = null;
      try {
        await deleteClassSchedule(id);
        this.classSchedules = this.classSchedules.filter(cs => cs.id !== id);
        if (this.selectedClassSchedule?.id === id) {
          this.selectedClassSchedule = null;
        }
      } catch (error) {
        this.classSchedulesError = error instanceof Error ? error.message : 'Failed to delete class schedule';
        throw error;
      } finally {
        this.classSchedulesLoading = false;
      }
    },

    async generateSessions(id: number, data: { start_date: string; end_date: string }) {
      this.classSchedulesLoading = true;
      this.classSchedulesError = null;
      try {
        const response = await generateSessions(id, data);
        const index = this.classSchedules.findIndex(cs => cs.id === id);
        if (index !== -1) {
          this.classSchedules[index] = response.data;
        }
        if (this.selectedClassSchedule?.id === id) {
          this.selectedClassSchedule = response.data;
        }
        return response.data;
      } catch (error) {
        this.classSchedulesError = error instanceof Error ? error.message : 'Failed to generate sessions';
        throw error;
      } finally {
        this.classSchedulesLoading = false;
      }
    },

    // Course Registration Actions
    async fetchCourseRegistrations(params?: { student?: number; course_offering?: number }) {
      this.courseRegistrationsLoading = true;
      this.courseRegistrationsError = null;
      try {
        const response = await getCourseRegistrations(params);
        this.courseRegistrations = response.data.results;
      } catch (error) {
        this.courseRegistrationsError = error instanceof Error ? error.message : 'Failed to fetch course registrations';
      } finally {
        this.courseRegistrationsLoading = false;
      }
    },

    async fetchCourseRegistration(id: number) {
      this.courseRegistrationsLoading = true;
      this.courseRegistrationsError = null;
      try {
        const response = await getCourseRegistration(id);
        this.selectedCourseRegistration = response.data;
      } catch (error) {
        this.courseRegistrationsError = error instanceof Error ? error.message : 'Failed to fetch course registration';
      } finally {
        this.courseRegistrationsLoading = false;
      }
    },

    async addCourseRegistration(data: { student: number; course_offering: number; notes?: string }) {
      this.courseRegistrationsLoading = true;
      this.courseRegistrationsError = null;
      try {
        const response = await createCourseRegistration(data);
        this.courseRegistrations.push(response.data);
        return response.data;
      } catch (error) {
        this.courseRegistrationsError = error instanceof Error ? error.message : 'Failed to create course registration';
        throw error;
      } finally {
        this.courseRegistrationsLoading = false;
      }
    },

    async editCourseRegistration(id: number, data: Partial<CourseRegistration>) {
      this.courseRegistrationsLoading = true;
      this.courseRegistrationsError = null;
      try {
        const response = await updateCourseRegistration(id, data);
        const index = this.courseRegistrations.findIndex(cr => cr.id === id);
        if (index !== -1) {
          this.courseRegistrations[index] = response.data;
        }
        if (this.selectedCourseRegistration?.id === id) {
          this.selectedCourseRegistration = response.data;
        }
        return response.data;
      } catch (error) {
        this.courseRegistrationsError = error instanceof Error ? error.message : 'Failed to update course registration';
        throw error;
      } finally {
        this.courseRegistrationsLoading = false;
      }
    },

    async removeCourseRegistration(id: number) {
      this.courseRegistrationsLoading = true;
      this.courseRegistrationsError = null;
      try {
        await deleteCourseRegistration(id);
        this.courseRegistrations = this.courseRegistrations.filter(cr => cr.id !== id);
        if (this.selectedCourseRegistration?.id === id) {
          this.selectedCourseRegistration = null;
        }
      } catch (error) {
        this.courseRegistrationsError = error instanceof Error ? error.message : 'Failed to delete course registration';
        throw error;
      } finally {
        this.courseRegistrationsLoading = false;
      }
    },

    async approveRegistration(id: number, data?: { notes?: string }) {
      this.courseRegistrationsLoading = true;
      this.courseRegistrationsError = null;
      try {
        const response = await approveRegistration(id, data);
        const index = this.courseRegistrations.findIndex(cr => cr.id === id);
        if (index !== -1) {
          this.courseRegistrations[index] = response.data;
        }
        if (this.selectedCourseRegistration?.id === id) {
          this.selectedCourseRegistration = response.data;
        }
        return response.data;
      } catch (error) {
        this.courseRegistrationsError = error instanceof Error ? error.message : 'Failed to approve registration';
        throw error;
      } finally {
        this.courseRegistrationsLoading = false;
      }
    },

    async rejectRegistration(id: number, data: { reason: string }) {
      this.courseRegistrationsLoading = true;
      this.courseRegistrationsError = null;
      try {
        const response = await rejectRegistration(id, data);
        const index = this.courseRegistrations.findIndex(cr => cr.id === id);
        if (index !== -1) {
          this.courseRegistrations[index] = response.data;
        }
        if (this.selectedCourseRegistration?.id === id) {
          this.selectedCourseRegistration = response.data;
        }
        return response.data;
      } catch (error) {
        this.courseRegistrationsError = error instanceof Error ? error.message : 'Failed to reject registration';
        throw error;
      } finally {
        this.courseRegistrationsLoading = false;
      }
    },
  },
}); 