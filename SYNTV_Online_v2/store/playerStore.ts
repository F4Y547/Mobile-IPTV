import { create } from 'zustand';
import { EPGProgram } from '../types';
import { getCurrentProgram, getNextProgram } from '../lib/epgParser';

interface PlayerState {
  isPlaying: boolean;
  isFullscreen: boolean;
  isMuted: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  currentProgram: EPGProgram | null;
  nextProgram: EPGProgram | null;

  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setFullscreen: (val: boolean) => void;
  toggleFullscreen: () => void;
  setMuted: (val: boolean) => void;
  setLoading: (val: boolean) => void;
  setError: (message: string) => void;
  clearError: () => void;
  setCurrentProgram: (program: EPGProgram | null) => void;
  setNextProgram: (program: EPGProgram | null) => void;
  updateEpg: (programs: EPGProgram[], tvgId: string) => void;
  reset: () => void;
}

const initialState = {
  isPlaying: false,
  isFullscreen: false,
  isMuted: false,
  isLoading: false,
  hasError: false,
  errorMessage: '',
  currentProgram: null,
  nextProgram: null,
};

export const usePlayerStore = create<PlayerState>((set) => ({
  ...initialState,

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setFullscreen: (val) => set({ isFullscreen: val }),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
  setMuted: (val) => set({ isMuted: val }),
  setLoading: (val) => set({ isLoading: val }),
  setError: (message) => set({ hasError: true, errorMessage: message, isLoading: false }),
  clearError: () => set({ hasError: false, errorMessage: '' }),
  setCurrentProgram: (program) => set({ currentProgram: program }),
  setNextProgram: (program) => set({ nextProgram: program }),
  updateEpg: (programs, tvgId) => {
    set({
      currentProgram: getCurrentProgram(programs, tvgId) || null,
      nextProgram: getNextProgram(programs, tvgId) || null,
    });
  },
  reset: () => set(initialState),
}));
