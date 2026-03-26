
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from '../utils/secureStorage';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null, token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: true,
      setUser: (user, token) => set({ user, token, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () => set({ user: null, token: null, isLoading: false }),
    }),
    {
      name: '_sys_pref',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
