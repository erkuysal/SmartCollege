import apiClient from '../../apiClient';
import { API_ROUTES } from '../../config/apiRoutes';
import type { 
  UserCredentials, 
  TokenPair, 
  UserProfile, 
  UserRegistration, 
  PasswordResetRequest, 
  PasswordResetConfirm 
} from '../../interfaces/users/baseUserInterface';
import { BaseService } from '../baseService';

export class AuthService extends BaseService {
  constructor() {
    super(API_ROUTES.USERS_BASE_URL);
  }

  /**
   * Login a user with username and password
   */
  async login(credentials: UserCredentials) {
    const response = await this.post<TokenPair>(API_ROUTES.USERS_AUTH.LOGIN, credentials);
    apiClient.setTokens(response.data);
    return response;
  }

  /**
   * Logout the current user
   */
  async logout() {
    const response = await this.post(API_ROUTES.USERS_AUTH.LOGOUT);
    apiClient.clearTokens();
    return response;
  }

  /**
   * Register a new user
   */
  async register(userData: UserRegistration) {
    return this.post<UserProfile>(API_ROUTES.USERS_AUTH.REGISTER, userData);
  }

  /**
   * Get the current user's profile
   */
  async getProfile() {
    return this.get<UserProfile>(API_ROUTES.USERS_AUTH.PROFILE);
  }

  /**
   * Update the current user's profile
   */
  async updateProfile(profileData: Partial<UserProfile>) {
    return this.patch<UserProfile>(API_ROUTES.USERS_AUTH.PROFILE, profileData);
  }

  /**
   * Request a password reset
   */
  async requestPasswordReset(email: PasswordResetRequest) {
    return this.post(API_ROUTES.USERS_AUTH.PASSWORD_RESET, email);
  }

  /**
   * Confirm a password reset
   */
  async confirmPasswordReset(resetData: PasswordResetConfirm) {
    return this.post(API_ROUTES.USERS_AUTH.PASSWORD_RESET_CONFIRM, resetData);
  }

  /**
   * Refresh the authentication token
   */
  async refreshToken(refreshToken: string) {
    const response = await this.post<TokenPair>(API_ROUTES.USERS_AUTH.TOKEN_REFRESH, { refresh: refreshToken });
    apiClient.setTokens(response.data);
    return response;
  }

  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService; 