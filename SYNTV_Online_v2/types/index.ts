export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'premium';
  subscription_expires?: string;
  created_at: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  type: 'm3u' | 'xtream';
  url?: string;
  epg_url?: string;
  server_url?: string;
  username?: string;
  password?: string;
  channel_count?: number;
  movie_count?: number;
  series_count?: number;
  created_at: string;
  is_active: boolean;
}

export interface Channel {
  id: string;
  playlist_id: string;
  name: string;
  stream_url: string;
  logo?: string;
  category?: string;
  tvg_id?: string;
  tvg_name?: string;
  country?: string;
  language?: string;
  is_favorite: boolean;
  is_live?: boolean;
}

export interface Movie {
  id: string;
  playlist_id: string;
  title: string;
  stream_url: string;
  poster?: string;
  backdrop?: string;
  category?: string;
  year?: number;
  rating?: number;
  duration?: string;
  description?: string;
  is_favorite: boolean;
}

export interface Series {
  id: string;
  playlist_id: string;
  title: string;
  poster?: string;
  backdrop?: string;
  category?: string;
  year?: number;
  rating?: number;
  description?: string;
  is_favorite: boolean;
  seasons: Season[];
}

export interface Season {
  id: string;
  series_id: string;
  number: number;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  season_id: string;
  number: number;
  title: string;
  stream_url: string;
  thumbnail?: string;
  duration?: string;
  description?: string;
  is_watched: boolean;
}

export interface EPGProgram {
  id: string;
  channel_tvg_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  category?: string;
  is_live?: boolean;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  content_id: string;
  content_type: 'channel' | 'movie' | 'episode';
  title: string;
  thumbnail?: string;
  progress_seconds?: number;
  duration_seconds?: number;
  last_watched: string;
}

export interface ParsedChannel {
  name: string;
  streamUrl: string;
  tvgId?: string;
  tvgName?: string;
  tvgLogo?: string;
  groupTitle?: string;
  category?: string;
  country?: string;
  language?: string;
}

export interface XtreamAuthResponse {
  user_info: {
    username: string;
    password: string;
    message: string;
    auth: number;
    status: string;
    exp_date: string;
    is_trial: string;
    active_cons: string;
    created_at: string;
    max_connections: string;
    allowed_output_formats: string[];
  };
  server_info: {
    url: string;
    port: string;
    https_port: string;
    server_protocol: string;
    rtmp_port: string;
    timezone: string;
    timestamp_now: number;
    time_now: string;
  };
}

export interface XtreamCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface XtreamStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_id: string;
  category_ids: number[];
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

export interface XtreamSeries {
  num: number;
  name: string;
  series_id: number;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  last_updated: string;
  rating: string;
  rating_5based: number;
  backdrop_path: string[];
  youtube_trailer: string;
  episode_run_time: string;
  category_id: string;
  category_ids: number[];
}

export interface XtreamEpisode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    tmdb_id: number;
    release_date: string;
    plot: string;
    duration_secs: number;
    duration: string;
    movie_image: string;
  };
  custom_sid: string;
  added: string;
  season: number;
  direct_source: string;
}
