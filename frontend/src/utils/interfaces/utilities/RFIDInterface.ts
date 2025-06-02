export interface RFIDCard {
  id: number;
  card_number: string;
  card_status: 'active' | 'inactive' | 'lost' | 'stolen';
  card_status_display: string;
  last_used_at: string;
  created_at: string;
  updated_at: string;
}

export interface RFIDUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface RFIDResponse {
  user: RFIDUser;
  user_type: 'Student' | 'Lecturer' | 'Staff' | 'Admin';
  user_code: string;
  rfid: RFIDCard;
}

export interface UserRFIDStatus {
  tag_id: string;
  status: string;
  status_display: string;
  is_active: boolean;
}

export interface UserRFID {
  id: number;
  email: string;
  username: string;
  role: 'Student' | 'Lecturer' | 'Staff' | 'Admin';
  rfid_status: UserRFIDStatus | null;
}

export interface WriteRFIDResponse {
  message: string;
  rfid_card: RFIDCard;
}

export interface RFIDAccessLog {
  id: number;
  card_id: string;
  user_id: number;
  user_type: 'Student' | 'Lecturer' | 'Staff' | 'Admin';
  access_point: string;
  timestamp: string;
  is_granted: boolean;
  reason?: string;
}

export interface RFIDAccessVerification {
  card_id: string;
  access_point: string;
  timestamp: string;
}

export interface RFIDAccessResponse {
  is_granted: boolean;
  user_id?: number;
  user_type?: 'Student' | 'Lecturer' | 'Staff' | 'Admin';
  user_name?: string;
  reason?: string;
}
