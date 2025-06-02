import { BaseService } from '../baseService';
import { API_ROUTES } from '@/utils/config/apiRoutes';
import logger from '@/utils/logging/logger';
import { retry } from '@/utils/helpers/requestControl';
import type { 
  Schedule, 
  LegacySchedule, 
  PopulatedSchedule, 
  ScheduleResponse, 
  ScheduleFilter 
} from '@/utils/interfaces/college/scheduleInterface';

// Create a module-specific logger
const scheduleLogger = logger.createLogger('ScheduleService');

const { COLLEGE_BASE_URL, SCHEDULES_ROUTE } = API_ROUTES;

// Mock data for fallback when the API fails - updated to new format
const FALLBACK_SCHEDULES: Schedule[] = [
  {
    id: 1,
    classroom: 1,
    classroom_name: "Main-001",
    section: 1,
    section_name: "SCI100 - Section A (Fall 2024-2025)",
    course_name: "Introduction to Computer Science",
    time_slot: 1,
    time_slot_display: "Monday 08:00:00-09:30:00",
    is_active: true,
    notes: "Regular weekly schedule",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    classroom: 2,
    classroom_name: "Main-002",
    section: 2,
    section_name: "SCI101 - Section A (Fall 2024-2025)",
    course_name: "Advanced Mathematics",
    time_slot: 2,
    time_slot_display: "Monday 10:00:00-11:30:00",
    is_active: true,
    notes: "Regular weekly schedule",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    classroom: 3,
    classroom_name: "Main-003",
    section: 3,
    section_name: "SCI102 - Section A (Fall 2024-2025)",
    course_name: "Data Structures & Algorithms",
    time_slot: 3,
    time_slot_display: "Monday 13:00:00-14:30:00",
    is_active: true,
    notes: "Regular weekly schedule",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    classroom: 4,
    classroom_name: "Main-004",
    section: 4,
    section_name: "SCI103 - Section A (Spring 2024-2025)",
    course_name: "Database Systems",
    time_slot: 4,
    time_slot_display: "Monday 15:00:00-16:30:00",
    is_active: true,
    notes: "Regular weekly schedule",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    classroom: 5,
    classroom_name: "Main-005",
    section: 5,
    section_name: "SCI104 - Section B (Spring 2024-2025)",
    course_name: "Software Engineering",
    time_slot: 5,
    time_slot_display: "Tuesday 08:00:00-09:30:00",
    is_active: true,
    notes: "Regular weekly schedule",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Define a type for the response with fallback flag
interface ResponseWithFallback<T> extends Schedule {
  _useFallback?: boolean;
}

/**
 * Schedule Service provides methods to interact with the schedule API endpoints
 */
export class ScheduleService extends BaseService {
  private hasFallbackDataBeenUsed = false;

  constructor() {
    super(API_ROUTES.SCHEDULES_ROUTE);
    scheduleLogger.debug('ScheduleService initialized with endpoint:', { endpoint: API_ROUTES.SCHEDULES_ROUTE });
  }

  /**
   * Fetches schedules with optional filtering parameters
   * @param params - Optional parameters for filtering schedules
   */
  public async fetchSchedules(params?: ScheduleFilter) {
    try {
      // Build query parameters
      const queryParams: Record<string, any> = {};
      
      if (params?.classroom) queryParams.classroom = params.classroom;
      if (params?.section) queryParams.section = params.section;
      if (params?.time_slot) queryParams.time_slot = params.time_slot;
      if (params?.is_active !== undefined) queryParams.is_active = params.is_active;
      
      // Log query for debugging
      scheduleLogger.debug('Fetching schedules with params:', { params: queryParams });
      
      // Attempt to get data from API with retry mechanism
      const response = await retry(
        () => this.getList<Schedule>('', queryParams),
        {
          maxAttempts: 3,
          delay: 1000,
          backoffFactor: 1.5,
          onRetry: (attempt, error) => {
            scheduleLogger.warn(`Retry attempt ${attempt} for fetchSchedules`, { error });
          }
        }
      );
      
      // If we successfully retrieved data, reset the fallback flag
      this.hasFallbackDataBeenUsed = false;
      return response.data;
    } catch (error: any) { // Use any to allow checking for custom properties
      scheduleLogger.error('Error fetching schedules', { error });
      
      // Check if this error has the fallback flag
      const shouldUseFallback = error?._useFallback === true || 
                                (error?.response?.status === 500);
      
      if (shouldUseFallback) {
        // If this is the first time fallback data is used, log a special notice
        if (!this.hasFallbackDataBeenUsed) {
          scheduleLogger.warn('Using fallback schedule data due to API failure');
          this.hasFallbackDataBeenUsed = true;
        }
        
        // Return fallback data in the same format as the API would, with a flag indicating it's fallback data
        return {
          count: FALLBACK_SCHEDULES.length,
          next: null,
          previous: null,
          results: FALLBACK_SCHEDULES,
          _useFallback: true  // Add this flag to indicate fallback data
        };
      }
      
      // If not using fallback, rethrow the error
      throw error;
    }
  }

  /**
   * Fetch a specific schedule by ID
   * @param id - Schedule ID
   */
  public async fetchSchedule(id: number) {
    try {
      const response = await retry(
        () => this.getById<Schedule>(id),
        { maxAttempts: 2 }
      );
      return response.data;
    } catch (error: any) { // Use any to check for custom properties
      scheduleLogger.error(`Error fetching schedule ${id}`, { error });
      
      // Check if this error has the fallback flag or is a 500 error
      const shouldUseFallback = error?._useFallback === true || 
                                (error?.response?.status === 500);
      
      if (shouldUseFallback) {
        // Return the fallback item that matches the ID, or the first fallback item
        const fallbackItem = FALLBACK_SCHEDULES.find(s => s.id === id) || FALLBACK_SCHEDULES[0];
        
        // Clone and modify the item to make it clear it's fallback data
        return {
          ...fallbackItem,
          course_name: `${fallbackItem.course_name} (Fallback Data)`,
          _useFallback: true  // Add this flag to indicate fallback data
        };
      }
      
      // If not using fallback, rethrow the error
      throw error;
    }
  }

  /**
   * Get schedules for a specific classroom
   * @param classroomId - Classroom ID
   */
  public async fetchSchedulesByClassroom(classroomId: number) {
    try {
      // Using query params instead of path param to match the backend implementation
      const queryParams = { classroom: classroomId };
      const response = await retry(
        () => this.getList<Schedule>('', queryParams),
        { maxAttempts: 2 }
      );
      return response.data.results;
    } catch (error: any) { // Use any to check for custom properties
      scheduleLogger.error(`Error fetching schedules for classroom ${classroomId}`, { error });
      
      // Check if this error has the fallback flag or is a 500 error
      const shouldUseFallback = error?._useFallback === true || 
                                (error?.response?.status === 500);
      
      if (shouldUseFallback) {
        // Return filtered fallback data with the _useFallback flag
        const fallbackData = FALLBACK_SCHEDULES.map(s => ({
          ...s,
          classroom: classroomId,
          classroom_name: `Classroom ${classroomId} (Fallback Data)`,
          _useFallback: true
        }));
        
        return fallbackData;
      }
      
      // If not using fallback, rethrow the error
      throw error;
    }
  }
  
  /**
   * Get schedules for a specific section
   * @param sectionId - Section ID
   */
  public async fetchSchedulesBySection(sectionId: number) {
    try {
      const queryParams = { section: sectionId };
      const response = await retry(
        () => this.getList<Schedule>('', queryParams),
        { maxAttempts: 2 }
      );
      return response.data.results;
    } catch (error: any) { // Use any to check for custom properties
      scheduleLogger.error(`Error fetching schedules for section ${sectionId}`, { error });
      
      // Check if this error has the fallback flag or is a 500 error
      const shouldUseFallback = error?._useFallback === true || 
                                (error?.response?.status === 500);
      
      if (shouldUseFallback) {
        // Return filtered fallback data with the _useFallback flag
        const fallbackData = FALLBACK_SCHEDULES.map(s => ({
          ...s,
          section: sectionId,
          section_name: `Section ${sectionId} (Fallback Data)`,
          _useFallback: true
        }));
        
        return fallbackData;
      }
      
      // If not using fallback, rethrow the error
      throw error;
    }
  }

  /**
   * Creates a new schedule
   * @param data - Schedule data
   */
  public async createSchedule(data: Partial<Schedule>) {
    try {
      const response = await this.create<Schedule>(data);
      scheduleLogger.info('Schedule created successfully', { id: response.data.id });
      return response.data;
    } catch (error) {
      scheduleLogger.error('Error creating schedule', { error, data });
      throw error;
    }
  }

  /**
   * Updates an existing schedule
   * @param id - Schedule ID
   * @param data - Updated schedule data
   */
  public async updateSchedule(id: number, data: Partial<Schedule>) {
    try {
      const response = await this.update<Schedule>(id, data);
      scheduleLogger.info('Schedule updated successfully', { id });
      return response.data;
    } catch (error) {
      scheduleLogger.error(`Error updating schedule ${id}`, { error, data });
      throw error;
    }
  }

  /**
   * Deletes a schedule
   * @param id - Schedule ID
   */
  public async deleteSchedule(id: number) {
    try {
      await this.delete(id);
      scheduleLogger.info('Schedule deleted successfully', { id });
      return true;
    } catch (error) {
      scheduleLogger.error(`Error deleting schedule ${id}`, { error });
      throw error;
    }
  }
}

// Export a singleton instance
export default new ScheduleService();
