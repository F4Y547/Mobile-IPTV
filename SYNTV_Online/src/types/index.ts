export interface Playlist {
  id: string;
  name: string;
  type: 'm3u' | 'xtream';
  url?: string;
  epgUrl?: string;
  serverUrl?: string;
  username?: string;
  password?: string;
  createdAt: Date;
  isActive: boolean;
  channelCount?: number;
  movieCount?: number;
  seriesCount?: number;
}

export interface Channel {
  id: string;
  name: string;
  logo: string;
  category: string;
  url: string;
  epgChannelId?: string;
  isFavorite: boolean;
  isLive: boolean;
  viewers?: number;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  poster: string;
  backdrop?: string;
  category: string;
  rating?: number;
  duration?: string;
  description?: string;
  url: string;
  isFavorite: boolean;
}

export interface Series {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  category: string;
  rating?: number;
  year: number;
  description?: string;
  seasons: Season[];
  isFavorite: boolean;
}

export interface Season {
  id: string;
  number: number;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  description?: string;
  duration: string;
  thumbnail: string;
  url: string;
  isWatched: boolean;
}

export interface EPGProgram {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  category?: string;
  isLive?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  channelCount: number;
  gradient: readonly [string, string];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscription?: Subscription;
}

export interface Subscription {
  plan: 'free' | 'basic' | 'premium';
  expiresAt: Date;
  isActive: boolean;
}

export interface OnboardingSlide {
  title: string;
  subtitle: string;
  image: string;
}
