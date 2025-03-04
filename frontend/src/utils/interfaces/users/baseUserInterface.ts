export interface BaseUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
  profile_image?: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  password_confirm: string;
}

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

export type UserRole = 'student' | 'lecturer' | 'staff' | 'admin';

export interface UserProfile extends BaseUser {
  role: UserRole;
  phone_number?: string;
  address?: string;
  bio?: string;
} 