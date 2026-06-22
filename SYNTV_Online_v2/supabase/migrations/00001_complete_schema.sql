-- ============================================================================
-- SYNTV Online - Complete Production Schema
-- Includes: all tables, RLS policies, helper functions, indexes, triggers
-- ============================================================================

-- 0. EXTENSIONS
create extension if not exists "pgcrypto";
create extension if not exists "pg_net";

-- 1. HELPER: is_admin function
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.user_profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

-- 2. HELPER: subscription status check
create or replace function public.has_active_subscription(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.subscriptions
    where user_id = p_user_id
      and status = 'active'
      and expires_at > now()
  );
$$;

-- 3. HELPER: user's subscription plan
create or replace function public.get_subscription_plan(p_user_id uuid default auth.uid())
returns text
language sql
stable
security definer
as $$
  select coalesce(
    (select plan_name from public.subscriptions
     where user_id = p_user_id and status = 'active' and expires_at > now()
     order by expires_at desc limit 1),
    'free'
  );
$$;

-- ============================================================================
-- TABLE: user_profiles
-- ============================================================================
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  full_name text not null default '',
  email text not null,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  subscription_status text not null default 'free' check (subscription_status in ('free', 'active', 'expired', 'cancelled')),
  subscription_plan text not null default 'free' check (subscription_plan in ('free', 'premium', 'family')),
  subscription_expires_at timestamptz,
  parental_pin text,
  is_disabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

-- RLS: Users read own, admins read all
create policy "user_profiles_select_own"
  on public.user_profiles for select
  using (auth.uid() = user_id or public.is_admin());

-- RLS: Users insert own
create policy "user_profiles_insert_own"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

-- RLS: Users update own, admins update any
create policy "user_profiles_update_own"
  on public.user_profiles for update
  using (auth.uid() = user_id or public.is_admin());

-- RLS: Only admins can delete
create policy "user_profiles_delete_admin"
  on public.user_profiles for delete
  using (public.is_admin());

-- ============================================================================
-- TABLE: playlists
-- ============================================================================
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('m3u', 'xtream')),
  m3u_url text,
  epg_url text,
  server_url text,
  xtream_username text,
  xtream_password_encrypted text,
  status text not null default 'active' check (status in ('active', 'inactive', 'suspicious', 'error')),
  total_channels integer default 0,
  total_movies integer default 0,
  total_series integer default 0,
  is_suspicious boolean not null default false,
  last_synced_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.playlists enable row level security;

-- RLS: Users read own, admins read all
create policy "playlists_select_own"
  on public.playlists for select
  using (auth.uid() = user_id or public.is_admin());

-- RLS: Users insert own
create policy "playlists_insert_own"
  on public.playlists for insert
  with check (auth.uid() = user_id);

-- RLS: Users update own, admins update any
create policy "playlists_update_own"
  on public.playlists for update
  using (auth.uid() = user_id or public.is_admin());

-- RLS: Users delete own, admins delete any
create policy "playlists_delete_own"
  on public.playlists for delete
  using (auth.uid() = user_id or public.is_admin());

create index idx_playlists_user on public.playlists(user_id);
create index idx_playlists_status on public.playlists(status);

-- ============================================================================
-- TABLE: channels
-- ============================================================================
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  name text not null,
  logo_url text,
  stream_url text not null,
  category text,
  tvg_id text,
  tvg_name text,
  country text,
  language text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.channels enable row level security;

create policy "channels_select_own"
  on public.channels for select
  using (auth.uid() = user_id or public.is_admin());

create policy "channels_insert_own"
  on public.channels for insert
  with check (auth.uid() = user_id);

create policy "channels_update_own"
  on public.channels for update
  using (auth.uid() = user_id or public.is_admin());

create policy "channels_delete_own"
  on public.channels for delete
  using (auth.uid() = user_id or public.is_admin());

create index idx_channels_playlist on public.channels(playlist_id);
create index idx_channels_user on public.channels(user_id);
create index idx_channels_category on public.channels(category);

-- ============================================================================
-- TABLE: movies
-- ============================================================================
create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  title text not null,
  poster_url text,
  stream_url text not null,
  category text,
  year text,
  rating text,
  description text,
  created_at timestamptz not null default now()
);

alter table public.movies enable row level security;

create policy "movies_select_own"
  on public.movies for select
  using (auth.uid() = user_id or public.is_admin());

create policy "movies_insert_own"
  on public.movies for insert
  with check (auth.uid() = user_id);

create policy "movies_delete_own"
  on public.movies for delete
  using (auth.uid() = user_id or public.is_admin());

create index idx_movies_playlist on public.movies(playlist_id);
create index idx_movies_user on public.movies(user_id);

-- ============================================================================
-- TABLE: series
-- ============================================================================
create table if not exists public.series (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  title text not null,
  poster_url text,
  category text,
  description text,
  created_at timestamptz not null default now()
);

alter table public.series enable row level security;

create policy "series_select_own"
  on public.series for select
  using (auth.uid() = user_id or public.is_admin());

create policy "series_insert_own"
  on public.series for insert
  with check (auth.uid() = user_id);

create policy "series_delete_own"
  on public.series for delete
  using (auth.uid() = user_id or public.is_admin());

create index idx_series_playlist on public.series(playlist_id);
create index idx_series_user on public.series(user_id);

-- ============================================================================
-- TABLE: episodes
-- ============================================================================
create table if not exists public.episodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  series_id uuid not null references public.series(id) on delete cascade,
  season_number integer not null default 1,
  episode_number integer not null default 1,
  title text not null,
  stream_url text not null,
  duration text,
  created_at timestamptz not null default now()
);

alter table public.episodes enable row level security;

create policy "episodes_select_own"
  on public.episodes for select
  using (auth.uid() = user_id or public.is_admin());

create policy "episodes_insert_own"
  on public.episodes for insert
  with check (auth.uid() = user_id);

create policy "episodes_delete_own"
  on public.episodes for delete
  using (auth.uid() = user_id or public.is_admin());

create index idx_episodes_series on public.episodes(series_id);
create index idx_episodes_user on public.episodes(user_id);

-- ============================================================================
-- TABLE: epg_programs
-- ============================================================================
create table if not exists public.epg_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  channel_id uuid references public.channels(id) on delete set null,
  tvg_id text,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  category text,
  created_at timestamptz not null default now()
);

alter table public.epg_programs enable row level security;

create policy "epg_programs_select_own"
  on public.epg_programs for select
  using (auth.uid() = user_id or public.is_admin());

create policy "epg_programs_insert_own"
  on public.epg_programs for insert
  with check (auth.uid() = user_id);

create policy "epg_programs_delete_own"
  on public.epg_programs for delete
  using (auth.uid() = user_id or public.is_admin());

create index idx_epg_channel on public.epg_programs(channel_id);
create index idx_epg_tvg_id on public.epg_programs(tvg_id);
create index idx_epg_time on public.epg_programs(start_time, end_time);
create index idx_epg_user on public.epg_programs(user_id);

-- ============================================================================
-- TABLE: favorites
-- ============================================================================
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_type text not null check (content_type in ('channel', 'movie', 'series', 'episode')),
  content_id uuid not null,
  created_at timestamptz not null default now(),
  unique(user_id, content_type, content_id)
);

alter table public.favorites enable row level security;

create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = user_id or public.is_admin());

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = user_id or public.is_admin());

create index idx_favorites_user on public.favorites(user_id);
create index idx_favorites_type on public.favorites(content_type);

-- ============================================================================
-- TABLE: watch_history
-- ============================================================================
create table if not exists public.watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_type text not null check (content_type in ('channel', 'movie', 'episode')),
  content_id uuid not null,
  progress_seconds integer default 0,
  last_watched_at timestamptz not null default now()
);

alter table public.watch_history enable row level security;

create policy "watch_history_select_own"
  on public.watch_history for select
  using (auth.uid() = user_id or public.is_admin());

create policy "watch_history_insert_own"
  on public.watch_history for insert
  with check (auth.uid() = user_id);

create policy "watch_history_update_own"
  on public.watch_history for update
  using (auth.uid() = user_id);

create index idx_watch_history_user on public.watch_history(user_id);
create index idx_watch_history_recent on public.watch_history(user_id, last_watched_at desc);

-- ============================================================================
-- TABLE: subscriptions
-- ============================================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_name text not null check (plan_name in ('premium', 'family')),
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled', 'trialing')),
  payment_provider text not null check (payment_provider in ('stripe', 'manual', 'bkash', 'nagad', 'rocket', 'bank')),
  payment_id text,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id or public.is_admin());

create policy "subscriptions_insert_admin"
  on public.subscriptions for insert
  with check (public.is_admin());

create policy "subscriptions_update_admin"
  on public.subscriptions for update
  using (public.is_admin());

create index idx_subscriptions_user on public.subscriptions(user_id);
create index idx_subscriptions_status on public.subscriptions(status);
create index idx_subscriptions_active on public.subscriptions(user_id, status) where status = 'active';

-- ============================================================================
-- TABLE: announcements
-- ============================================================================
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info', 'warning', 'success', 'maintenance')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

-- Everyone can read active announcements
create policy "announcements_select_active"
  on public.announcements for select
  using (is_active = true or public.is_admin());

-- Only admins can manage announcements
create policy "announcements_insert_admin"
  on public.announcements for insert
  with check (public.is_admin());

create policy "announcements_update_admin"
  on public.announcements for update
  using (public.is_admin());

create policy "announcements_delete_admin"
  on public.announcements for delete
  using (public.is_admin());

-- ============================================================================
-- TABLE: app_settings
-- ============================================================================
create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- Everyone can read app settings (non-sensitive)
create policy "app_settings_select_all"
  on public.app_settings for select
  using (true);

-- Only admins can update
create policy "app_settings_update_admin"
  on public.app_settings for update
  using (public.is_admin());

create policy "app_settings_insert_admin"
  on public.app_settings for insert
  with check (public.is_admin());

-- ============================================================================
-- TRIGGER: auto-update updated_at
-- ============================================================================
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trigger_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.update_updated_at_column();

create trigger trigger_playlists_updated_at
  before update on public.playlists
  for each row execute function public.update_updated_at_column();

create trigger trigger_channels_updated_at
  before update on public.channels
  for each row execute function public.update_updated_at_column();

-- ============================================================================
-- TRIGGER: auto-create user_profiles on auth.users signup
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
