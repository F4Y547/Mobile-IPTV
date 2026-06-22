-- ============================================================================
-- SYNTV Online - Seed Data
-- Run after applying migration 00001_complete_schema.sql
-- ============================================================================

-- 1. Default app settings
INSERT INTO public.app_settings (key, value) VALUES
  ('app_name', '"SYNTV Online"'),
  ('logo_url', '""'),
  ('support_email', '"support@syntv.com"'),
  ('support_whatsapp', '""'),
  ('min_app_version', '"2.0.0"'),
  ('maintenance_mode', 'false'),
  ('legal_disclaimer', '"SYNTV Online does not host, sell, or distribute TV channels, movies, or streams. Users are responsible for adding only legal playlists and content sources they are authorized to access. SYNTV Online is only a media player and playlist management application."'),
  ('free_plan_limits', '{"playlists": 1, "favorites": 10, "epg": false, "vod": false, "max_bitrate": "SD"}'),
  ('premium_plan_limits', '{"playlists": 999, "favorites": 9999, "epg": true, "vod": true, "max_bitrate": "FHD"}')
ON CONFLICT (key) DO NOTHING;

-- 2. Default announcements
INSERT INTO public.announcements (title, message, type, is_active) VALUES
  ('Welcome to SYNTV Online', 'Welcome to SYNTV Online! Add your playlist to start watching live TV, movies, and series.', 'info', true),
  ('Legal Usage Notice', 'SYNTV Online is a media player application. You must only add playlists and content you are authorized to access.', 'warning', true)
ON CONFLICT DO NOTHING;

-- 3. Create initial admin user (run AFTER creating the user in Supabase Auth)
-- Replace with your actual admin user UUID after creating the account
-- INSERT INTO public.user_profiles (user_id, email, full_name, role, subscription_status, subscription_plan)
-- VALUES ('YOUR-USER-UUID-HERE', 'admin@syntv.com', 'Admin', 'admin', 'active', 'premium')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- 4. Helper: function to promote a user to admin (run in Supabase SQL editor)
-- CREATE OR REPLACE FUNCTION public.promote_to_admin(target_email text)
-- RETURNS void
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $$
-- BEGIN
--   UPDATE public.user_profiles
--   SET role = 'admin'
--   WHERE email = target_email;
-- END;
-- $$;
-- 
-- Usage: SELECT public.promote_to_admin('admin@syntv.com');
