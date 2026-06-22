import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '../types';
import * as supabase from '../lib/supabase';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    try {
      const user = await supabase.getCurrentUser();
      if (user) {
        const profile = await supabase.getUserProfile(user.id);
        set({ user, profile, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password, fullName) => {
    set({ isLoading: true, error: null });
    try {
      const data = await supabase.signUp(email, password, fullName);
      if (data.user) {
        const profile = await supabase.getUserProfile(data.user.id);
        set({ user: data.user, profile, isAuthenticated: true, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Signup failed', isLoading: false });
      throw err;
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await supabase.signIn(email, password);
      if (data.user) {
        const profile = await supabase.getUserProfile(data.user.id);
        set({ user: data.user, profile, isAuthenticated: true, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  signOut: async () => {
    try {
      await supabase.signOut();
      set({ user: null, profile: null, isAuthenticated: false });
    } catch (err: any) {
      set({ error: err.message || 'Logout failed' });
    }
  },

  loadProfile: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const profile = await supabase.getUserProfile(user.id);
      set({ profile });
    } catch {}
  },

  clearError: () => set({ error: null }),
}));
