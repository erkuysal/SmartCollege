import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserCredentials, UserProfile, UserRegistration, PasswordResetRequest, PasswordResetConfirm } from '../../interfaces/users/baseUserInterface';
import authService from '../../services/users/authService';

// Define the store without the persist option for now
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<UserProfile | null>(null);
  const isAuthenticated = ref(authService.isAuthenticated());
  const token = ref(localStorage.getItem('access_token'));
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isLoggedIn = computed(() => isAuthenticated.value && !!token.value);
  const userName = computed(() => user.value ? `${user.value.first_name} ${user.value.last_name}` : 'User');
  const userRole = computed(() => user.value?.role || 'Guest');

  // Actions
  async function login(credentials: UserCredentials) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.login(credentials);
      const profileResponse = await authService.getProfile();
      user.value = profileResponse.data;
      isAuthenticated.value = true;
      token.value = response.data.access;
      // Manually persist the token
      localStorage.setItem('access_token', response.data.access);
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      throw err;
    }
  }

  async function logout() {
    loading.value = true;
    error.value = null;
    try {
      await authService.logout();
      user.value = null;
      isAuthenticated.value = false;
      token.value = null;
      // Manually remove the token
      localStorage.removeItem('access_token');
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Logout failed.';
    }
  }

  async function register(userData: UserRegistration) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.register(userData);
      loading.value = false;
      return response.data;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Registration failed.';
      throw err;
    }
  }

  async function updateProfile(profileData: Partial<UserProfile>) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.updateProfile(profileData);
      user.value = response.data;
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Failed to update profile.';
      throw err;
    }
  }

  async function refreshToken(refreshTokenStr: string) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.refreshToken(refreshTokenStr);
      token.value = response.data.access;
      isAuthenticated.value = true;
      // Manually persist the token
      localStorage.setItem('access_token', response.data.access);
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Failed to refresh token.';
      isAuthenticated.value = false;
      token.value = null;
      // Manually remove the token
      localStorage.removeItem('access_token');
      throw err;
    }
  }

  async function requestPasswordReset(email: string) {
    loading.value = true;
    error.value = null;
    try {
      await authService.requestPasswordReset({ email });
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Failed to request password reset.';
      throw err;
    }
  }

  async function confirmPasswordReset(resetData: PasswordResetConfirm) {
    loading.value = true;
    error.value = null;
    try {
      await authService.confirmPasswordReset(resetData);
      loading.value = false;
    } catch (err: any) {
      loading.value = false;
      error.value = err.response?.data?.detail || 'Failed to reset password.';
      throw err;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    user,
    isAuthenticated,
    token,
    loading,
    error,
    
    // Getters
    isLoggedIn,
    userName,
    userRole,
    
    // Actions
    login,
    logout,
    register,
    updateProfile,
    refreshToken,
    requestPasswordReset,
    confirmPasswordReset,
    clearError
  };
}); 