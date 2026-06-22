import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function signUp(email: string, password: string, fullName: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (authError) throw authError;

  if (authData.user) {
    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      subscription_tier: 'free',
    });
    if (profileError) throw profileError;
  }
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
    .eq('id', userId)
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

export async function toggleFavoriteChannel(channelId: string, isFavorite: boolean) {
  const { error } = await supabase
    .from('channels')
    .update({ is_favorite: isFavorite })
    .eq('id', channelId);
  if (error) throw error;
}

export async function getFavorites(userId: string, type: 'channel' | 'movie' | 'series') {
  const table = type === 'channel' ? 'channels' : type === 'movie' ? 'movies' : 'series';
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true);
  if (error) throw error;
  return data || [];
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

import { Playlist, WatchHistory } from '../types';
