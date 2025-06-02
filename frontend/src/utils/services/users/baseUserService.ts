import { BaseService } from '../baseService';

export interface BaseUser {
  id: number;
  username: string;
  email: string;
  role: string | null;
  rfid_tag: string;
}

class BaseUserService extends BaseService {
  private static instance: BaseUserService;

  private constructor() {
    super('/api/users/base');
  }

  public static getInstance(): BaseUserService {
    if (!BaseUserService.instance) {
      BaseUserService.instance = new BaseUserService();
    }
    return BaseUserService.instance;
  }

  async getAllUsers(): Promise<BaseUser[]> {
    const response = await this.getList<BaseUser>();
    return response.data.results;
  }

  async getUserById(id: number): Promise<BaseUser> {
    const response = await this.getById<BaseUser>(id);
    return response.data;
  }

  async createUser(user: Omit<BaseUser, 'id'>): Promise<BaseUser> {
    const response = await this.create<BaseUser>(user);
    return response.data;
  }

  async updateUser(id: number, user: Partial<BaseUser>): Promise<BaseUser> {
    const response = await this.patch<BaseUser>(id, user);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.delete(id);
  }
}

export const baseUserService = BaseUserService.getInstance(); 