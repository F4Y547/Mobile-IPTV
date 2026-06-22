import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import webStorage from './webStorage';

const Store = Platform.OS === 'web' ? webStorage : AsyncStorage;

const KEYS = {
  LAST_PLAYLIST: '@syntv/last_playlist',
  RECENT_CHANNELS: '@syntv/recent_channels',
  FAVORITE_IDS: '@syntv/favorite_ids',
  APP_SETTINGS: '@syntv/app_settings',
  ONBOARDING_DONE: '@syntv/onboarding_done',
  CACHED_CHANNELS: '@syntv/cached_channels',
  CACHED_EPG: '@syntv/cached_epg',
  PARENTAL_PIN: '@syntv/parental_pin',
};

export async function cacheData(key: string, data: any, ttlMs = 3600000) {
  const item = { data, timestamp: Date.now(), ttl: ttlMs };
  await Store.setItem(key, JSON.stringify(item));
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const raw = await Store.getItem(key);
    if (!raw) return null;
    const item = JSON.parse(raw);
    if (Date.now() - item.timestamp > item.ttl) {
      await Store.removeItem(key);
      return null;
    }
    return item.data as T;
  } catch {
    return null;
  }
}

export async function getLastPlaylist() {
  return getCachedData<string>(KEYS.LAST_PLAYLIST);
}

export async function setLastPlaylist(id: string) {
  await cacheData(KEYS.LAST_PLAYLIST, id, 86400000);
}

export async function getRecentChannels() {
  return getCachedData<string[]>(KEYS.RECENT_CHANNELS);
}

export async function addRecentChannel(channelId: string) {
  const recent = (await getRecentChannels()) || [];
  const updated = [channelId, ...recent.filter((id) => id !== channelId)].slice(0, 20);
  await cacheData(KEYS.RECENT_CHANNELS, updated, 86400000);
}

export async function getFavoriteIds(type: 'channel' | 'movie' | 'series') {
  const key = `${KEYS.FAVORITE_IDS}_${type}`;
  return getCachedData<string[]>(key);
}

export async function setFavoriteIds(type: 'channel' | 'movie' | 'series', ids: string[]) {
  const key = `${KEYS.FAVORITE_IDS}_${type}`;
  await cacheData(key, ids, 86400000);
}

export async function getAppSettings() {
  return getCachedData<Record<string, any>>(KEYS.APP_SETTINGS);
}

export async function setAppSettings(settings: Record<string, any>) {
  await cacheData(KEYS.APP_SETTINGS, settings, 86400000);
}

export async function isOnboardingDone(): Promise<boolean> {
  const val = await Store.getItem(KEYS.ONBOARDING_DONE);
  return val === 'true';
}

export async function markOnboardingDone() {
  await Store.setItem(KEYS.ONBOARDING_DONE, 'true');
}

export async function clearAllCache() {
  const keys = await Store.getAllKeys();
  const appKeys = keys.filter((k) => k.startsWith('@syntv/'));
  if (appKeys.length > 0) {
    await Store.multiRemove(appKeys);
  }
}

export async function getParentalPin(): Promise<string | null> {
  return Store.getItem(KEYS.PARENTAL_PIN);
}

export async function saveWatchHistory(entry: {
  user_id: string;
  content_id: string;
  content_type: string;
  title: string;
  thumbnail?: string;
  last_watched: string;
}) {
  const key = `@syntv/watch_history_${entry.user_id}`;
  const existing = await getCachedData<any[]>(key) || [];
  const updated = [entry, ...existing.filter((e: any) => e.content_id !== entry.content_id)].slice(0, 50);
  await cacheData(key, updated, 86400000 * 7);
}

export async function setParentalPin(pin: string) {
  await Store.setItem(KEYS.PARENTAL_PIN, pin);
}

export async function verifyParentalPin(pin: string): Promise<boolean> {
  const stored = await getParentalPin();
  if (!stored) return true;
  return stored === pin;
}
