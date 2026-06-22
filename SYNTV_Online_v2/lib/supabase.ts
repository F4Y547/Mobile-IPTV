import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import webStorage from './webStorage';
import { Playlist, WatchHistory } from '../types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const storage = Platform.OS === 'web' ? {
  getItem: webStorage.getItem,
  setItem: webStorage.setItem,
  removeItem: webStorage.removeItem,
} : AsyncStorage;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY env vars');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

export async function signUp(email: string, password: string, fullName: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (authError) throw authError;
  return authData;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function savePlaylist(playlist: Omit<Playlist, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('playlists').insert(playlist).select().single();
  if (error) throw error;
  return data;
}

export async function getUserPlaylists(userId: string) {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveChannels(channels: any[]) {
  const { data, error } = await supabase.from('channels').insert(channels).select();
  if (error) throw error;
  return data;
}

export async function getChannels(playlistId: string, page = 0, limit = 50) {
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('playlist_id', playlistId)
    .range(page * limit, (page + 1) * limit - 1)
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function searchChannels(playlistId: string, query: string, limit = 20) {
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('playlist_id', playlistId)
    .ilike('name', `%${query}%`)
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
}

export async function getFavoriteChannels(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('content_id')
    .eq('user_id', userId)
    .eq('content_type', 'channel');
  if (error) throw error;
  return (data || []).map((f: any) => f.content_id);
}

export async function getFavoriteChannelsFull(userId: string) {
  const ids = await getFavoriteChannels(userId);
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .in('id', ids);
  if (error) throw error;
  return data || [];
}

export async function isChannelFavorite(userId: string, channelId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('content_type', 'channel')
    .eq('content_id', channelId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function toggleFavoriteChannel(userId: string, channelId: string): Promise<boolean> {
  const { data: existing, error: findError } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('content_type', 'channel')
    .eq('content_id', channelId)
    .maybeSingle();

  if (findError) throw findError;

  if (existing) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      content_type: 'channel',
      content_id: channelId,
    });
  if (error) throw error;
  return true;
}

export async function saveWatchHistory(entry: Omit<WatchHistory, 'id'>) {
  const { data, error } = await supabase.from('watch_history').insert(entry).select().single();
  if (error) throw error;
  return data;
}

export async function getWatchHistory(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('watch_history')
    .select('*')
    .eq('user_id', userId)
    .order('last_watched', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
