import { create } from 'zustand';
import { Channel, Movie, Series } from '../types';
import { getFavorites, toggleFavoriteChannel } from '../lib/supabase';
import { getFavoriteIds, setFavoriteIds } from '../lib/storage';

interface FavoriteState {
  channelFavorites: Channel[];
  movieFavorites: Movie[];
  seriesFavorites: Series[];
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
  isLoading: false,

  loadFavorites: async (userId) => {
    set({ isLoading: true });
    try {
      const channels = await getFavorites(userId, 'channel');
      const movies = await getFavorites(userId, 'movie') as any as Movie[];
      const series = await getFavorites(userId, 'series') as any as Series[];
      set({
        channelFavorites: channels as Channel[],
        movieFavorites: movies,
        seriesFavorites: series,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleChannelFavorite: async (channel, userId) => {
    const { channelFavorites } = get();
    const isFav = channelFavorites.some((c) => c.id === channel.id);
    const updated = isFav
      ? channelFavorites.filter((c) => c.id !== channel.id)
      : [...channelFavorites, channel];

    set({ channelFavorites: updated });
    await toggleFavoriteChannel(channel.id, !isFav);
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

  isChannelFavorite: (channelId) => get().channelFavorites.some((c) => c.id === channelId),
  isMovieFavorite: (movieId) => get().movieFavorites.some((m) => m.id === movieId),
  isSeriesFavorite: (seriesId) => get().seriesFavorites.some((s) => s.id === seriesId),
}));
