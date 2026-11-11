import { create } from 'zustand';
import { getCurrentUserAPI } from '../../api/authApi';

// Store user đăng nhập dùng chung cho Navbar/Profile (không persist — cookie là source of truth)
interface AuthState {
  user: UserProfile | null;
  loaded: boolean;
  fetch: () => Promise<void>;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loaded: false,

  fetch: async () => {
    try {
      const user = await getCurrentUserAPI();
      set({ user, loaded: true });
    } catch {
      set({ user: null, loaded: true });
    }
  },

  clear: () => set({ user: null, loaded: true }),
}));
