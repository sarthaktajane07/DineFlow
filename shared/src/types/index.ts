export type UserRole = 'manager' | 'host' | 'staff';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export type TableStatus = 'free' | 'occupied' | 'reserved' | 'cleaning';
export type TableZone = 'indoor' | 'outdoor' | 'bar' | 'vip' | 'main' | 'patio' | string;
export type TableShape = 'square' | 'round' | 'rectangle';

export interface TablePosition {
  x: number;
  y: number;
}

export interface Table {
  _id: string;
  id?: string;
  tableNumber: string;
  seats: number;
  status: TableStatus;
  zone: TableZone;
  position: TablePosition;
  shape?: TableShape;
  currentGuest?: {
    _id: string;
    guestName: string;
    partySize: number;
    phoneNumber?: string;
  } | null;
  assignedWaiter?: {
    _id: string;
    fullName: string;
    email: string;
  } | null;
  occupiedAt?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type WaitlistStatus = 'waiting' | 'notified' | 'seated' | 'cancelled' | 'no-show';
export type WaitlistPriority = 'normal' | 'vip' | 'reservation';
export type NotificationPreference = 'sms' | 'whatsapp' | 'both';

export interface WaitlistEntry {
  _id: string;
  id?: string;
  guestName: string;
  phoneNumber: string;
  partySize: number;
  status: WaitlistStatus;
  priority?: WaitlistPriority;
  estimatedWaitTime?: number;
  notificationPreference?: NotificationPreference;
  notes?: string;
  assignedTable?: {
    _id: string;
    tableNumber: string;
    seats: number;
  } | null;
  addedBy?: {
    _id: string;
    fullName: string;
  } | null;
  notifiedAt?: string | null;
  seatedAt?: string | null;
  cancelledAt?: string | null;
  actualWaitTime?: number | null;
  queuePosition?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLog {
  _id: string;
  id?: string;
  type: 'table' | 'waitlist' | 'notification' | 'auth' | 'system' | string;
  action: string;
  description: string;
  performedBy?: {
    _id: string;
    id?: string;
    fullName: string;
    email?: string;
  } | null;
  metadata?: {
    tableId?: string;
    waitlistId?: string;
    targetName?: string;
  };
  createdAt: string;
}

export interface TableStats {
  total: number;
  free: number;
  occupied: number;
  reserved: number;
  cleaning: number;
  occupancyRate: number;
}

export interface WaitlistStats {
  waiting: number;
  notified: number;
  seatedToday: number;
  averageWaitTime: number;
  totalGuests: number;
}

export interface AnalyticsOverview {
  occupancyRate: number;
  avgWaitTime: number;
  avgServiceDuration: number;
  totalRevenue: number;
  totalGuestsSeated: number;
  totalTables?: number;
  occupiedTables?: number;
  waitingGuests?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  count?: number;
  data?: T;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RealtimeEvent<T = any> {
  event: string;
  payload: T;
  timestamp: string;
}
