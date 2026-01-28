const API_URL = import.meta.env.VITE_API_URL || 'https://devstudiomonorepo-production.up.railway.app/api/v1/checkin';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('access_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || '요청에 실패했습니다' };
    }

    return { data };
  } catch (error) {
    return { error: '네트워크 오류가 발생했습니다' };
  }
}

// Auth
export const authApi = {
  signup: (email: string, password: string, name: string) =>
    request<{ user: User; access_token: string; refresh_token: string }>(
      '/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }
    ),

  login: (email: string, password: string) =>
    request<{ user: User; access_token: string; refresh_token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    ),

  refresh: (refreshToken: string) =>
    request<{ access_token: string; refresh_token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  getMe: () => request<{ user: User }>('/me'),
};

// Settings
export const settingsApi = {
  get: () => request<{ settings: Settings }>('/settings'),

  update: (settings: Partial<SettingsUpdate>) =>
    request<{ settings: Settings }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};

// CheckIn
export const checkInApi = {
  create: (data: {
    date: string;
    period: 'morning' | 'afternoon';
    location_name: string;
    lat: number;
    lng: number;
  }) =>
    request<{ check_in: CheckIn }>('/checkins', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getByDate: (date: string) =>
    request<{ check_ins: CheckIn[] }>(`/checkins?date=${date}`),

  getByMonth: (year: number, month: number) =>
    request<{ check_ins: CheckIn[] }>(`/checkins?year=${year}&month=${month}`),
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Settings {
  id: string;
  user_id: string;
  work_days: number[];
  morning_location_name: string;
  morning_lat: number;
  morning_lng: number;
  morning_radius: number;
  afternoon_location_name: string;
  afternoon_lat: number;
  afternoon_lng: number;
  afternoon_radius: number;
}

export interface SettingsUpdate {
  work_days: number[];
  morning_location_name: string;
  morning_lat: number;
  morning_lng: number;
  morning_radius: number;
  afternoon_location_name: string;
  afternoon_lat: number;
  afternoon_lng: number;
  afternoon_radius: number;
}

export interface CheckIn {
  id: string;
  user_id: string;
  date: string;
  period: 'morning' | 'afternoon';
  location_name: string;
  lat: number;
  lng: number;
  checked_at: string;
}
