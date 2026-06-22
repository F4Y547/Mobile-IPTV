import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useFavoriteStore } from '../store/favoriteStore';
import SearchBar from '../components/SearchBar';
import ChannelCard from '../components/ChannelCard';
import CategoryCard from '../components/CategoryCard';
import MovieCard from '../components/MovieCard';
import { CATEGORIES } from '../constants/categories';
import { HomeSkeleton } from '../components/LoadingSkeleton';

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  const { profile } = useAuthStore();
  const { playlists, loadPlaylists, channels, categories, setActivePlaylist } = usePlaylistStore();
  const { channelFavorites, favoriteChannelIds, isChannelFavorite } = useFavoriteStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = profile?.user_id || profile?.id;

  useEffect(() => {
    if (userId) {
      loadPlaylists(userId).finally(() => setLoading(false));
    }
  }, [userId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (userId) await loadPlaylists(userId);
    setRefreshing(false);
  }, [userId]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const hasPlaylists = playlists.length > 0;
  const favChannels = channelFavorites.slice(0, 5);

  if (loading) return <HomeSkeleton />;

  return (
    <View className="flex-1 bg-[#050816]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00AEEF" />}
      >
        <LinearGradient colors={['#0A0F2C', '#050816']} className="pt-12 pb-2">
          <View className="flex-row justify-between items-center px-5 pb-2">
            <View>
              <Text className="text-[#94A3B8] text-sm">{greeting()}</Text>
              <Text className="text-[#F8FAFC] text-2xl font-extrabold">{profile?.full_name || 'Welcome'}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="person-circle" size={44} color="#00AEEF" />
            </TouchableOpacity>
          </View>
          <SearchBar value="" onChangeText={() => navigation.navigate('Search')} placeholder="Search channels, movies, series..." />
        </LinearGradient>

        {!hasPlaylists && (
          <View className="px-5 mt-4">
            <TouchableOpacity className="rounded-2xl overflow-hidden" onPress={() => navigation.navigate('AddPlaylist')}>
              <LinearGradient colors={['#00AEEF', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="p-5">
                <View className="flex-row items-center gap-3.5">
                  <View className="w-[52px] h-[52px] rounded-full bg-white/20 items-center justify-center">
                    <Ionicons name="add-circle" size={32} color="#fff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold">Add Your IPTV Playlist</Text>
                    <Text className="text-white/70 text-sm">M3U or Xtream Codes supported</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Subscription card */}
        <LinearGradient colors={['rgba(0,174,239,0.15)', 'rgba(124,58,237,0.1)']} className="mx-5 mt-4 rounded-2xl p-5 border border-[#00AEEF]/20">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[#94A3B8] text-xs">Current Plan</Text>
              <Text className="text-white text-2xl font-bold mt-0.5">{profile?.subscription_plan === 'premium' || profile?.subscription_plan === 'family' ? 'Premium' : 'Free'}</Text>
              {profile?.subscription_expires_at && (
                <Text className="text-[#94A3B8] text-[10px] mt-1">Expires: {new Date(profile.subscription_expires_at).toLocaleDateString()}</Text>
              )}
            </View>
            {profile?.subscription_plan === 'free' && (
              <TouchableOpacity className="flex-row items-center bg-white/20 px-4 py-2.5 rounded-full gap-1.5">
                <Text className="text-white font-bold text-xs">Upgrade</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {hasPlaylists && (
          <>
            <View className="mt-5 px-5">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[#F8FAFC] text-lg font-bold">Live Categories</Text>
                <TouchableOpacity onPress={() => navigation.navigate('LiveTV')}>
                  <Text className="text-[#00AEEF] text-xs font-semibold">All Channels</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    channelCount={
                      channels.filter((c) => c.category?.toLowerCase() === cat.name.toLowerCase()).length || undefined
                    }
                    onPress={() => navigation.navigate('LiveTV', { category: cat.name })}
                  />
                ))}
              </ScrollView>
            </View>

            {channels.length > 0 && (
              <View className="mt-5">
                <View className="flex-row justify-between items-center px-5 mb-3">
                  <Text className="text-[#F8FAFC] text-lg font-bold">Popular Channels</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('LiveTV')}>
                    <Text className="text-[#00AEEF] text-xs font-semibold">See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5">
                  {channels.slice(0, 10).map((ch, i) => (
                    <ChannelCard
                      key={i}
                      channel={{
                        id: ch.name,
                        playlist_id: '',
                        name: ch.name,
                        stream_url: ch.streamUrl,
                        logo: ch.tvgLogo || '',
                        category: ch.category,
                        tvg_id: ch.tvgId,
                        is_live: true,
                      }}
                      isFavorite={isChannelFavorite(ch.name)}
                      onPress={() => navigation.navigate('Player', { channel: ch })}
                      onToggleFavorite={() => {}}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {favChannels.length > 0 && (
              <View className="mt-5">
                <View className="flex-row justify-between items-center px-5 mb-3">
                  <Text className="text-[#F8FAFC] text-lg font-bold">Favorite Channels</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
                    <Text className="text-[#00AEEF] text-xs font-semibold">See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5">
                  {favChannels.map((ch) => (
                    <ChannelCard
                      key={ch.id}
                      channel={ch}
                      isFavorite={true}
                      onPress={() => navigation.navigate('Player', { channel: ch })}
                      onToggleFavorite={() => {}}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        )}

        <View className="mt-5 px-5">
          <View className="flex-row items-center bg-[#101827] rounded-xl p-4 border border-[#00AEEF]/20 gap-3">
            <View className="w-10 h-10 rounded-full bg-yellow-500/15 items-center justify-center">
              <Ionicons name="megaphone" size={20} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-[#F8FAFC] text-sm font-semibold">New Channels Added!</Text>
              <Text className="text-[#94A3B8] text-xs mt-0.5">50+ new legal IPTV channels now available</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
