import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  setLoading: (l: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));
