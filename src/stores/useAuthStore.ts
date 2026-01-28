import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, settingsApi, checkInApi, type User, type Settings, type CheckIn } from '../api/client';

interface AuthStore {
  // Auth
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Settings
  settings: Settings | null;

  // CheckIns
  checkIns: CheckIn[];

  // Auth actions
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;

  // Settings actions
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<boolean>;

  // CheckIn actions
  createCheckIn: (data: {
    date: string;
    period: 'morning' | 'afternoon';
    location_name: string;
    lat: number;
    lng: number;
  }) => Promise<boolean>;
  checkOut: (date: string, period: 'morning' | 'afternoon') => Promise<boolean>;
  fetchCheckIns: (date: string) => Promise<void>;
  fetchCheckInsByMonth: (year: number, month: number) => Promise<void>;

  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      settings: null,
      checkIns: [],

      signup: async (email, password, name) => {
        set({ isLoading: true, error: null });
        const { data, error } = await authApi.signup(email, password, name);

        if (error) {
          set({ isLoading: false, error });
          return false;
        }

        if (data) {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          set({
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isLoading: false,
          });
          // 설정 불러오기
          get().fetchSettings();
          return true;
        }

        return false;
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        const { data, error } = await authApi.login(email, password);

        if (error) {
          set({ isLoading: false, error });
          return false;
        }

        if (data) {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          set({
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isLoading: false,
          });
          // 설정 불러오기
          get().fetchSettings();
          return true;
        }

        return false;
      },

      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          settings: null,
          checkIns: [],
        });
      },

      fetchMe: async () => {
        const { data } = await authApi.getMe();
        if (data) {
          set({ user: data.user });
        }
      },

      fetchSettings: async () => {
        const { data } = await settingsApi.get();
        if (data) {
          set({ settings: data.settings });
        }
      },

      updateSettings: async (settingsData) => {
        set({ isLoading: true, error: null });
        const { data, error } = await settingsApi.update(settingsData);

        if (error) {
          set({ isLoading: false, error });
          return false;
        }

        if (data) {
          set({ settings: data.settings, isLoading: false });
          return true;
        }

        return false;
      },

      createCheckIn: async (checkInData) => {
        set({ isLoading: true, error: null });
        const { data, error } = await checkInApi.create(checkInData);

        if (error) {
          set({ isLoading: false, error });
          return false;
        }

        if (data) {
          set((state) => ({
            checkIns: [...state.checkIns, data.check_in],
            isLoading: false,
          }));
          return true;
        }

        return false;
      },

      checkOut: async (date, period) => {
        set({ isLoading: true, error: null });
        const { data, error } = await checkInApi.checkOut({ date, period });

        if (error) {
          set({ isLoading: false, error });
          return false;
        }

        if (data) {
          set((state) => ({
            checkIns: state.checkIns.map((c) =>
              c.id === data.check_in.id ? data.check_in : c
            ),
            isLoading: false,
          }));
          return true;
        }

        return false;
      },

      fetchCheckIns: async (date) => {
        const { data } = await checkInApi.getByDate(date);
        if (data) {
          set({ checkIns: data.check_ins });
        }
      },

      fetchCheckInsByMonth: async (year, month) => {
        const { data } = await checkInApi.getByMonth(year, month);
        if (data) {
          set({ checkIns: data.check_ins });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'checkin-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
