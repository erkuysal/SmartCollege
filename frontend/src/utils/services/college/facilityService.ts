import { BaseService } from '../baseService';

export enum FacilityType {
  LAB = 'Lab',
  LECTURE_HALL = 'Lecture Hall',
  LIBRARY = 'Library',
  CAFETERIA = 'Cafeteria',
  AMPHITHEATER = 'Amphitheater',
  HOSTEL = 'Hostel',
  SPORTS_CENTER = 'Sports Center',
  OTHER = 'Other'
}

export interface Facility {
  id: number;
  name: string;
  type: FacilityType;
  location: string | null;
  capacity: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class FacilityService extends BaseService {
  private static instance: FacilityService;

  private constructor() {
    super('/api/college/facilities');
  }

  public static getInstance(): FacilityService {
    if (!FacilityService.instance) {
      FacilityService.instance = new FacilityService();
    }
    return FacilityService.instance;
  }

  async getAllFacilities(): Promise<Facility[]> {
    const response = await this.get<Facility[]>('');
    return response.data;
  }

  async getFacilityById(id: number): Promise<Facility> {
    const response = await this.getById<Facility>(id);
    return response.data;
  }

  async createFacility(facility: Omit<Facility, 'id' | 'created_at' | 'updated_at'>): Promise<Facility> {
    const response = await this.create<Facility>(facility);
    return response.data;
  }

  async updateFacility(id: number, facility: Partial<Facility>): Promise<Facility> {
    const response = await this.patch<Facility>(id, facility);
    return response.data;
  }

  async deleteFacility(id: number): Promise<void> {
    await this.delete(id);
  }
}

export const facilityService = FacilityService.getInstance(); 