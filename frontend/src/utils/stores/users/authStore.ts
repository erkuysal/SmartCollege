import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserCredentials, UserProfile, UserRegistration, PasswordResetRequest, PasswordResetConfirm } from '../../interfaces/users/baseUserInterface';
import authService from '../../services/users/authService';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);
  const userFullName = computed(() => {
    if (!user.value) return '';
    return `${user.value.first_name} ${user.value.last_name}`;
  });

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      // TODO: Implement actual login API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      user.value = data.user;
      token.value = data.token;
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  }

  async function checkAuth() {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return;

    loading.value = true;
    try {
      // TODO: Implement actual auth check API call
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      user.value = data.user;
      token.value = storedToken;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      logout();
    } finally {
      loading.value = false;
    }
  }

  async function register(userData: UserRegistration) {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (err: any) {
      console.error('Registration error:', err);
      throw err;
    }
  }

  async function updateProfile(profileData: Partial<UserProfile>) {
    try {
      const response = await authService.updateProfile(profileData);
      user.value = response.data;
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  }

  async function refreshToken(refreshTokenStr: string) {
    try {
      const response = await authService.refreshToken(refreshTokenStr);
      token.value = response.data.access;
    } catch (err: any) {
      console.error('Failed to refresh token:', err);
      logout();
      throw err;
    }
  }

  async function requestPasswordReset(email: string) {
    try {
      await authService.requestPasswordReset({ email });
    } catch (err: any) {
      console.error('Failed to request password reset:', err);
      throw err;
    }
  }

  async function confirmPasswordReset(resetData: PasswordResetConfirm) {
    try {
      await authService.confirmPasswordReset(resetData);
    } catch (err: any) {
      console.error('Failed to reset password:', err);
      throw err;
    }
  }

  function clearError() {
    // Implementation needed
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userFullName,
    login,
    logout,
    checkAuth,
    register,
    updateProfile,
    refreshToken,
    requestPasswordReset,
    confirmPasswordReset,
    clearError
  };
}); 