import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  ApiResponse,
  AuthResponse,
  User,
  Table,
  TableStats,
  WaitlistEntry,
  WaitlistStats,
  ActivityLog,
  AnalyticsOverview,
} from '../types/index.js';

let tokenProvider: (() => string | null | Promise<string | null>) = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('token');
  }
  return null;
};

let unauthorizedHandler: (() => void) | null = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    if (window.location && window.location.pathname !== '/auth') {
      window.location.href = '/auth';
    }
  }
};

export const setTokenProvider = (provider: () => string | null | Promise<string | null>) => {
  tokenProvider = provider;
};

export const setUnauthorizedHandler = (handler: () => void) => {
  unauthorizedHandler = handler;
};

const defaultBaseUrl = 'http://localhost:5000/api';

export const createApiClient = (baseURL: string = defaultBaseUrl): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await Promise.resolve(tokenProvider());
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  });

  instance.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error.response?.status === 401 && unauthorizedHandler) {
        unauthorizedHandler();
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = createApiClient();

export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
    return data;
  },
  register: async (fullName: string, email: string, password: string, role: string = 'staff'): Promise<ApiResponse<AuthResponse>> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', { fullName, email, password, role });
    return data;
  },
  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const { data } = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return data;
  },
  updateProfile: async (fullName?: string, email?: string): Promise<ApiResponse<{ user: User }>> => {
    const { data } = await api.put<ApiResponse<{ user: User }>>('/auth/update-profile', { fullName, email });
    return data;
  },
  updatePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    const { data } = await api.put<ApiResponse<void>>('/auth/update-password', { currentPassword, newPassword });
    return data;
  },
};

export const tablesApi = {
  getAll: async (params?: { status?: string; zone?: string; isActive?: boolean }): Promise<ApiResponse<{ tables: Table[] }>> => {
    const { data } = await api.get<ApiResponse<{ tables: Table[] }>>('/tables', { params });
    return data;
  },
  getStats: async (): Promise<ApiResponse<{ stats: TableStats }>> => {
    const { data } = await api.get<ApiResponse<{ stats: TableStats }>>('/tables/stats/overview');
    return data;
  },
  getById: async (id: string): Promise<ApiResponse<{ table: Table }>> => {
    const { data } = await api.get<ApiResponse<{ table: Table }>>(`/tables/${id}`);
    return data;
  },
  create: async (tableData: Partial<Table>): Promise<ApiResponse<{ table: Table }>> => {
    const { data } = await api.post<ApiResponse<{ table: Table }>>('/tables', tableData);
    return data;
  },
  update: async (id: string, tableData: Partial<Table>): Promise<ApiResponse<{ table: Table }>> => {
    const { data } = await api.put<ApiResponse<{ table: Table }>>(`/tables/${id}`, tableData);
    return data;
  },
  deleteTable: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete<ApiResponse<void>>(`/tables/${id}`);
    return data;
  },
};

export const waitlistApi = {
  getAll: async (params?: { status?: string; priority?: string }): Promise<ApiResponse<{ waitlist: WaitlistEntry[] }>> => {
    const { data } = await api.get<ApiResponse<{ waitlist: WaitlistEntry[] }>>('/waitlist', { params });
    return data;
  },
  getStats: async (): Promise<ApiResponse<{ stats: WaitlistStats }>> => {
    const { data } = await api.get<ApiResponse<{ stats: WaitlistStats }>>('/waitlist/stats/overview');
    return data;
  },
  getById: async (id: string): Promise<ApiResponse<{ entry: WaitlistEntry }>> => {
    const { data } = await api.get<ApiResponse<{ entry: WaitlistEntry }>>(`/waitlist/${id}`);
    return data;
  },
  create: async (entryData: {
    guestName: string;
    phoneNumber: string;
    partySize: number;
    priority?: string;
    notificationPreference?: string;
    notes?: string;
    estimatedWaitTime?: number;
  }): Promise<ApiResponse<{ entry: WaitlistEntry; notification: any }>> => {
    const { data } = await api.post<ApiResponse<{ entry: WaitlistEntry; notification: any }>>('/waitlist', entryData);
    return data;
  },
  update: async (id: string, entryData: Partial<WaitlistEntry>): Promise<ApiResponse<{ entry: WaitlistEntry }>> => {
    const { data } = await api.put<ApiResponse<{ entry: WaitlistEntry }>>(`/waitlist/${id}`, entryData);
    return data;
  },
  deleteEntry: async (id: string, reason?: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete<ApiResponse<void>>(`/waitlist/${id}`, { data: { reason } });
    return data;
  },
  notify: async (id: string, payload?: { tableNumber?: string; preference?: string }): Promise<ApiResponse<{ entry: WaitlistEntry; notification: any }>> => {
    const { data } = await api.post<ApiResponse<{ entry: WaitlistEntry; notification: any }>>(`/waitlist/${id}/notify`, payload);
    return data;
  },
  seat: async (id: string, tableId: string): Promise<ApiResponse<{ entry: WaitlistEntry; table: Table }>> => {
    const { data } = await api.post<ApiResponse<{ entry: WaitlistEntry; table: Table }>>(`/waitlist/${id}/seat`, { tableId });
    return data;
  },
};

export const activitiesApi = {
  getAll: async (limit: number = 50): Promise<ApiResponse<{ activities: ActivityLog[] }>> => {
    const { data } = await api.get<ApiResponse<{ activities: ActivityLog[] }>>('/activities', { params: { limit } });
    return data;
  },
};

export const analyticsApi = {
  getOverview: async (): Promise<ApiResponse<AnalyticsOverview>> => {
    const { data } = await api.get<ApiResponse<AnalyticsOverview>>('/analytics/overview');
    return data;
  },
  getOccupancy: async (): Promise<ApiResponse<any>> => {
    const { data } = await api.get<ApiResponse<any>>('/analytics/occupancy');
    return data;
  },
  getWaitTime: async (): Promise<ApiResponse<any>> => {
    const { data } = await api.get<ApiResponse<any>>('/analytics/wait-time');
    return data;
  },
  getServiceDuration: async (): Promise<ApiResponse<any>> => {
    const { data } = await api.get<ApiResponse<any>>('/analytics/service-duration');
    return data;
  },
  getWaiterPerformance: async (): Promise<ApiResponse<any>> => {
    const { data } = await api.get<ApiResponse<any>>('/analytics/waiter-performance');
    return data;
  },
  getRevenue: async (): Promise<ApiResponse<any>> => {
    const { data } = await api.get<ApiResponse<any>>('/analytics/revenue');
    return data;
  },
};
