import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const webStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (!isWeb) return null;
    try {
      const value = localStorage.getItem(key);
      if (value === 'undefined') return null;
      return value;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isWeb) {
      try { localStorage.setItem(key, value); } catch {}
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (isWeb) {
      try { localStorage.removeItem(key); } catch {}
    }
  },
  getAllKeys: async (): Promise<string[]> => {
    if (!isWeb) return [];
    try {
      return Object.keys(localStorage).filter(k => k.startsWith('@syntv/'));
    } catch {
      return [];
    }
  },
  multiRemove: async (keys: string[]): Promise<void> => {
    if (isWeb) {
      keys.forEach(k => { try { localStorage.removeItem(k); } catch {} });
    }
  },
};

export default webStorage;
