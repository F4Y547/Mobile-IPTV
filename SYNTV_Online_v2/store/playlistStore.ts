import { create } from 'zustand';
import { Playlist, ParsedChannel } from '../types';
import * as supabase from '../lib/supabase';
import { parseM3U, extractCategories, countChannelsByCategory } from '../lib/m3uParser';
import { testXtreamConnection, fetchLiveStreams, fetchLiveCategories } from '../lib/xtreamApi';
import { cacheData, getCachedData } from '../lib/storage';

interface PlaylistState {
  playlists: Playlist[];
  activePlaylist: Playlist | null;
  channels: ParsedChannel[];
  categories: string[];
  categoryCounts: Record<string, number>;
  isLoading: boolean;
  isTesting: boolean;
  testResult: { success: boolean; message: string; count?: number } | null;
  error: string | null;

  loadPlaylists: (userId: string) => Promise<void>;
  setActivePlaylist: (playlist: Playlist) => Promise<void>;
  testM3uConnection: (url: string) => Promise<{ success: boolean; message: string; count?: number }>;
  testXtreamConnection: (serverUrl: string, username: string, password: string) => Promise<{ success: boolean; message: string; count?: number }>;
  savePlaylist: (data: any, userId: string) => Promise<void>;
  removePlaylist: (id: string) => Promise<void>;
  loadCachedChannels: (playlistId: string) => Promise<void>;
  clearError: () => void;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  activePlaylist: null,
  channels: [],
  categories: [],
  categoryCounts: {},
  isLoading: false,
  isTesting: false,
  testResult: null,
  error: null,

  loadPlaylists: async (userId) => {
    set({ isLoading: true });
    try {
      const playlists = await supabase.getUserPlaylists(userId);
      set({ playlists: playlists || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  setActivePlaylist: async (playlist) => {
    set({ activePlaylist: playlist });
    const { loadCachedChannels } = get();
    await loadCachedChannels(playlist.id);
  },

  testM3uConnection: async (url) => {
    set({ isTesting: true, testResult: null });
    try {
      const response = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (!text.includes('#EXTM3U')) throw new Error('Not a valid M3U playlist');
      const channels = parseM3U(text);
      const count = channels.length;
      if (count === 0) throw new Error('No channels found in playlist');
      const cats = extractCategories(channels);
      const counts = countChannelsByCategory(channels);

      set({
        channels,
        categories: cats,
        categoryCounts: counts,
        isTesting: false,
        testResult: { success: true, message: `${count} channels found in ${cats.length} categories`, count },
      });
      return { success: true, message: `${count} channels found`, count };
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch playlist';
      set({ isTesting: false, testResult: { success: false, message: msg } });
      return { success: false, message: msg };
    }
  },

  testXtreamConnection: async (serverUrl, username, password) => {
    set({ isTesting: true, testResult: null });
    try {
      const auth = await testXtreamConnection(serverUrl, username, password);
      const categories = await fetchLiveCategories(serverUrl, username, password);
      const streams = await fetchLiveStreams(serverUrl, username, password);

      const channels: ParsedChannel[] = streams.map((s) => ({
        name: s.name,
        streamUrl: `${serverUrl.replace(/\/+$/, '')}/live/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${s.stream_id}.m3u8`,
        tvgId: s.epg_channel_id,
        tvgLogo: s.stream_icon,
        category: categories.find((c) => c.category_id === s.category_id)?.category_name || 'Uncategorized',
      }));

      const cats = extractCategories(channels);

      set({
        channels,
        categories: cats,
        categoryCounts: countChannelsByCategory(channels),
        isTesting: false,
        testResult: { success: true, message: `${channels.length} channels found in ${cats.length} categories`, count: channels.length },
      });
      return { success: true, message: `${channels.length} channels found`, count: channels.length };
    } catch (err: any) {
      const msg = err.message || 'Connection failed';
      set({ isTesting: false, testResult: { success: false, message: msg } });
      return { success: false, message: msg };
    }
  },

  savePlaylist: async (data, userId) => {
    set({ isLoading: true });
    try {
      const plData: any = {
        user_id: userId,
        name: data.name,
        type: data.type,
        is_active: true,
      };
      if (data.type === 'm3u') {
        plData.url = data.url;
        plData.epg_url = data.epgUrl || null;
        plData.channel_count = get().channels.length;
      } else {
        plData.server_url = data.serverUrl;
        plData.username = data.username;
        plData.channel_count = get().channels.length;
      }

      const saved = await supabase.savePlaylist(plData);
      const channelsToSave = get().channels.map((ch) => ({
        playlist_id: saved.id,
        name: ch.name,
        stream_url: ch.streamUrl,
        logo: ch.tvgLogo || null,
        category: ch.category || 'Uncategorized',
        tvg_id: ch.tvgId || null,
        tvg_name: ch.tvgName || null,
        country: ch.country || null,
        language: ch.language || null,
        is_favorite: false,
      }));

      if (channelsToSave.length > 0) {
        await supabase.saveChannels(channelsToSave);
      }

      await cacheData(`channels_${saved.id}`, channelsToSave, 86400000);

      set((state) => ({
        playlists: [saved, ...state.playlists],
        activePlaylist: saved,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  removePlaylist: async (id) => {
    try {
      const { error } = await supabase.supabase.from('playlists').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({
        playlists: state.playlists.filter((p) => p.id !== id),
        activePlaylist: state.activePlaylist?.id === id ? null : state.activePlaylist,
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  loadCachedChannels: async (playlistId) => {
    const cached = await getCachedData<ParsedChannel[]>(`channels_${playlistId}`);
    if (cached) {
      set({ channels: cached, categories: extractCategories(cached), categoryCounts: countChannelsByCategory(cached) });
    } else {
      try {
        const channels = await supabase.getChannels(playlistId);
        const parsed: ParsedChannel[] = channels.map((ch: any) => ({
          name: ch.name,
          streamUrl: ch.stream_url,
          tvgId: ch.tvg_id,
          tvgLogo: ch.logo,
          category: ch.category,
          country: ch.country,
          language: ch.language,
        }));
        set({ channels: parsed, categories: extractCategories(parsed), categoryCounts: countChannelsByCategory(parsed) });
      } catch {}
    }
  },

  clearError: () => set({ error: null }),
}));
