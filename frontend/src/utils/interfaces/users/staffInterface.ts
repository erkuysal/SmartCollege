import type { BaseUser } from './baseUserInterface';

export interface Permission {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface StaffRole {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Staff extends BaseUser {
  staff_id: string;
  department: string;
  position: string;
  hire_date: string;
  role: StaffRole;
  permissions: Permission[];
  is_admin: boolean;
  rfid_card_id?: string;
} 