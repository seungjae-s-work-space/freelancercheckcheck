const API_URL = import.meta.env.VITE_API_URL || 'https://devstudiomonorepo-production.up.railway.app/api/v1/checkin';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// 토큰 갱신 중인지 체크 (중복 갱신 방지)
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// 토큰 갱신 함수
async function refreshTokens(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();

    // 새 토큰 저장
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);

    // Zustand 스토어도 업데이트
    const stored = localStorage.getItem('checkin-auth-storage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        parsed.state.accessToken = data.access_token;
        parsed.state.refreshToken = data.refresh_token;
        localStorage.setItem('checkin-auth-storage', JSON.stringify(parsed));
      } catch {
        // 파싱 실패 시 무시
      }
    }

    return true;
  } catch {
    return false;
  }
}

// 로그아웃 처리 (토큰만 삭제, settings 유지)
function clearTokensAndReload() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');

  const stored = localStorage.getItem('checkin-auth-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      parsed.state.accessToken = null;
      parsed.state.refreshToken = null;
      localStorage.setItem('checkin-auth-storage', JSON.stringify(parsed));
    } catch {
      // 파싱 실패 시 무시
    }
  }

  window.location.reload();
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
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
      // 401 Unauthorized - refresh token으로 갱신 시도
      if (response.status === 401 && retry) {
        // 이미 갱신 중이면 기다림
        if (isRefreshing && refreshPromise) {
          const success = await refreshPromise;
          if (success) {
            return request<T>(endpoint, options, false);
          }
        } else {
          // 토큰 갱신 시도
          isRefreshing = true;
          refreshPromise = refreshTokens();
          const success = await refreshPromise;
          isRefreshing = false;
          refreshPromise = null;

          if (success) {
            // 새 토큰으로 재요청
            return request<T>(endpoint, options, false);
          }
        }

        // 갱신 실패 - 로그아웃
        clearTokensAndReload();
      }
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
    is_extra_day?: boolean;
  }) =>
    request<{ check_in: CheckIn }>('/checkins', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  checkOut: (data: { date: string; period: 'morning' | 'afternoon'; earn_extra?: boolean }) =>
    request<{ check_in: CheckIn; user: User }>('/checkouts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getByDate: (date: string) =>
    request<{ check_ins: CheckIn[] }>(`/checkins?date=${date}`),

  getByMonth: (year: number, month: number) =>
    request<{ check_ins: CheckIn[] }>(`/checkins?year=${year}&month=${month}`),

  useExtra: (data: { date: string; period: 'morning' | 'afternoon' }) =>
    request<{ check_in: CheckIn; user: User }>('/use-extra', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Admin API
export const adminApi = {
  // 사용자 관리
  getAllUsers: () =>
    request<{ users: User[] }>('/admin/users'),

  updateUserRole: (userId: string, role: 'user' | 'admin') =>
    request<{ message: string }>('/admin/users/role', {
      method: 'PUT',
      body: JSON.stringify({ user_id: userId, role }),
    }),

  updateUserExtraDays: (userId: string, extraDays: number) =>
    request<{ user: User }>('/admin/users/extra-days', {
      method: 'PUT',
      body: JSON.stringify({ user_id: userId, extra_days: extraDays }),
    }),

  // 출근 기록 관리
  getAllCheckIns: (params: { date?: string; year?: number; month?: number }) => {
    if (params.date) {
      return request<{ check_ins: CheckIn[] }>(`/admin/checkins?date=${params.date}`);
    }
    return request<{ check_ins: CheckIn[] }>(`/admin/checkins?year=${params.year}&month=${params.month}`);
  },

  createCheckIn: (data: { user_id: string; date: string; period: 'morning' | 'afternoon'; location_name?: string }) =>
    request<{ check_in: CheckIn }>('/admin/checkins', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createCheckOut: (data: { user_id: string; date: string; period: 'morning' | 'afternoon' }) =>
    request<{ check_in: CheckIn }>('/admin/checkouts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteCheckIn: (checkInId: string) =>
    request<{ message: string }>(`/admin/checkins/${checkInId}`, {
      method: 'DELETE',
    }),

  // 통계
  getUserStats: (year: number, month: number) =>
    request<{ stats: UserStats[] }>(`/admin/stats?year=${year}&month=${month}`),
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  extra_days: number;
  created_at: string;
}

export interface UserStats {
  id: string;
  name: string;
  email: string;
  role: string;
  extra_days: number;
  total_days: number;
  total_minutes: number;
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
  checked_out_at: string | null;
  work_minutes: number;
  is_extra_day: boolean;
  earned_extra: number;
}
