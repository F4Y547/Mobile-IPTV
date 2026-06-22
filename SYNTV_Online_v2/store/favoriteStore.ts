import { create } from 'zustand';
import { Channel, Movie, Series } from '../types';
import { getFavoriteChannels, getFavoriteChannelsFull, toggleFavoriteChannel, getFavorites } from '../lib/supabase';

interface FavoriteState {
  channelFavorites: Channel[];
  movieFavorites: Movie[];
  seriesFavorites: Series[];
  favoriteChannelIds: string[];
  isLoading: boolean;

  loadFavorites: (userId: string) => Promise<void>;
  toggleChannelFavorite: (channel: Channel, userId: string) => Promise<void>;
  toggleMovieFavorite: (movie: Movie) => void;
  toggleSeriesFavorite: (series: Series) => void;
  isChannelFavorite: (channelId: string) => boolean;
  isMovieFavorite: (movieId: string) => boolean;
  isSeriesFavorite: (seriesId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  channelFavorites: [],
  movieFavorites: [],
  seriesFavorites: [],
  favoriteChannelIds: [],
  isLoading: false,

  loadFavorites: async (userId) => {
    set({ isLoading: true });
    try {
      const [ids, fullChannels] = await Promise.all([
        getFavoriteChannels(userId),
        getFavoriteChannelsFull(userId),
      ]);
      set({
        favoriteChannelIds: ids,
        channelFavorites: fullChannels as Channel[],
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleChannelFavorite: async (channel, userId) => {
    if (!userId) return;
    const { channelFavorites, favoriteChannelIds } = get();
    const isFav = favoriteChannelIds.includes(channel.id);

    try {
      const nowFav = await toggleFavoriteChannel(userId, channel.id);

      if (nowFav) {
        set({
          favoriteChannelIds: [...favoriteChannelIds, channel.id],
          channelFavorites: [...channelFavorites, channel],
        });
      } else {
        set({
          favoriteChannelIds: favoriteChannelIds.filter((id) => id !== channel.id),
          channelFavorites: channelFavorites.filter((c) => c.id !== channel.id),
        });
      }
    } catch {
      // revert optimistic update on error
    }
  },

  toggleMovieFavorite: (movie) => {
    const { movieFavorites } = get();
    const updated = movieFavorites.some((m) => m.id === movie.id)
      ? movieFavorites.filter((m) => m.id !== movie.id)
      : [...movieFavorites, movie];
    set({ movieFavorites: updated });
  },

  toggleSeriesFavorite: (series) => {
    const { seriesFavorites } = get();
    const updated = seriesFavorites.some((s) => s.id === series.id)
      ? seriesFavorites.filter((s) => s.id !== series.id)
      : [...seriesFavorites, series];
    set({ seriesFavorites: updated });
  },

  isChannelFavorite: (channelId) => get().favoriteChannelIds.includes(channelId),
  isMovieFavorite: (movieId) => get().movieFavorites.some((m) => m.id === movieId),
  isSeriesFavorite: (seriesId) => get().seriesFavorites.some((s) => s.id === seriesId),
}));
