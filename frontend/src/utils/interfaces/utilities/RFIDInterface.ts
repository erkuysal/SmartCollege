export interface RFIDCard {
  id: number;
  card_id: string;
  user_id: number;
  user_type: 'student' | 'lecturer' | 'staff';
  is_active: boolean;
  issue_date: string;
  expiry_date?: string;
  last_used?: string;
}

export interface RFIDAccessLog {
  id: number;
  card_id: string;
  user_id: number;
  user_type: 'student' | 'lecturer' | 'staff';
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
  user_type?: 'student' | 'lecturer' | 'staff';
  user_name?: string;
  reason?: string;
}
