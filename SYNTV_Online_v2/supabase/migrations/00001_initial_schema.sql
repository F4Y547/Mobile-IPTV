-- SYNTV Online - Initial Schema
-- Tables: user_profiles, playlists, channels, movies, series, watch_history

-- 1. user_profiles
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  avatar_url text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'premium')),
  subscription_expires timestamptz,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- 2. playlists
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  name text not null,
  type text not null check (type in ('m3u', 'xtream')),
  url text,
  epg_url text,
  server_url text,
  username text,
  password text,
  channel_count int default 0,
  movie_count int default 0,
  series_count int default 0,
  created_at timestamptz not null default now(),
  is_active boolean not null default true
);

alter table public.playlists enable row level security;

create policy "Users can view own playlists"
  on public.playlists for select
  using (auth.uid() = user_id);

create policy "Users can insert own playlists"
  on public.playlists for insert
  with check (auth.uid() = user_id);

create policy "Users can update own playlists"
  on public.playlists for update
  using (auth.uid() = user_id);

create policy "Users can delete own playlists"
  on public.playlists for delete
  using (auth.uid() = user_id);

-- 3. channels
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  name text not null,
  stream_url text not null,
  logo text,
  category text,
  tvg_id text,
  tvg_name text,
  country text,
  language text,
  is_favorite boolean not null default false,
  is_live boolean default true
);

alter table public.channels enable row level security;

create policy "Users can view own channels"
  on public.channels for select
  using (auth.uid() = user_id);

create policy "Users can insert channels"
  on public.channels for insert
  with check (auth.uid() = user_id);

create policy "Users can update own channels"
  on public.channels for update
  using (auth.uid() = user_id);

create index idx_channels_playlist on public.channels(playlist_id);
create index idx_channels_user on public.channels(user_id);
create index idx_channels_favorite on public.channels(user_id, is_favorite) where is_favorite = true;

-- 4. movies
create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  title text not null,
  stream_url text not null,
  poster text,
  backdrop text,
  category text,
  year int,
  rating numeric(3,1),
  duration text,
  description text,
  is_favorite boolean not null default false
);

alter table public.movies enable row level security;

create policy "Users can view own movies"
  on public.movies for select
  using (auth.uid() = user_id);

create policy "Users can insert movies"
  on public.movies for insert
  with check (auth.uid() = user_id);

create policy "Users can update own movies"
  on public.movies for update
  using (auth.uid() = user_id);

create index idx_movies_user on public.movies(user_id);
create index idx_movies_favorite on public.movies(user_id, is_favorite) where is_favorite = true;

-- 5. series
create table if not exists public.series (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  title text not null,
  poster text,
  backdrop text,
  category text,
  year int,
  rating numeric(3,1),
  description text,
  is_favorite boolean not null default false,
  seasons jsonb default '[]'::jsonb
);

alter table public.series enable row level security;

create policy "Users can view own series"
  on public.series for select
  using (auth.uid() = user_id);

create policy "Users can insert series"
  on public.series for insert
  with check (auth.uid() = user_id);

create policy "Users can update own series"
  on public.series for update
  using (auth.uid() = user_id);

create index idx_series_user on public.series(user_id);
create index idx_series_favorite on public.series(user_id, is_favorite) where is_favorite = true;

-- 6. watch_history
create table if not exists public.watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  content_id text not null,
  content_type text not null check (content_type in ('channel', 'movie', 'episode')),
  title text not null,
  thumbnail text,
  progress_seconds int,
  duration_seconds int,
  last_watched timestamptz not null default now()
);

alter table public.watch_history enable row level security;

create policy "Users can view own watch history"
  on public.watch_history for select
  using (auth.uid() = user_id);

create policy "Users can insert watch history"
  on public.watch_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update own watch history"
  on public.watch_history for update
  using (auth.uid() = user_id);

create index idx_watch_history_user on public.watch_history(user_id);
create index idx_watch_history_recent on public.watch_history(user_id, last_watched desc);
