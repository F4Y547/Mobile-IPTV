import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useFavoriteStore } from '../store/favoriteStore';
import ChannelCard from '../components/ChannelCard';
import EmptyState from '../components/EmptyState';

interface Props {
  navigation: any;
}

export default function FavoritesScreen({ navigation }: Props) {
  const { profile } = useAuthStore();
  const { channelFavorites, movieFavorites, seriesFavorites, loadFavorites } = useFavoriteStore();
  const [activeTab, setActiveTab] = useState<'channels' | 'movies' | 'series'>('channels');

  useEffect(() => {
    const userId = profile?.user_id || profile?.id;
    if (userId) loadFavorites(userId);
  }, [profile?.id]);

  const tabs = [
    { key: 'channels', label: 'Channels', count: channelFavorites.length, icon: 'tv' },
    { key: 'movies', label: 'Movies', count: movieFavorites.length, icon: 'film' },
    { key: 'series', label: 'Series', count: seriesFavorites.length, icon: 'layers' },
  ] as const;

  const renderContent = () => {
    if (activeTab === 'channels') {
      if (channelFavorites.length === 0) {
        return <EmptyState icon="heart-outline" title="No favorite channels" subtitle="Tap the heart icon on any channel to save it here" />;
      }
      return (
        <FlatList
          data={channelFavorites}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <ChannelCard
              channel={item}
              isFavorite={true}
              onPress={() => navigation.navigate('Player', { channel: item })}
              onToggleFavorite={() => {}}
              variant="list"
            />
          )}
        />
      );
    }
    if (activeTab === 'movies') {
      if (movieFavorites.length === 0) {
        return <EmptyState icon="heart-outline" title="No favorite movies" subtitle="Tap the heart icon on any movie to save it here" />;
      }
      return (
        <View className="px-5">
          {movieFavorites.map((m, i) => (
            <View key={m.id || i} className="flex-row items-center bg-[#101827] rounded-xl p-4 mb-2 border border-white/10 gap-3">
              <View className="w-10 h-10 rounded-full bg-[#101827] items-center justify-center">
                <Ionicons name="film" size={20} color="#7C3AED" />
              </View>
              <View className="flex-1">
                <Text className="text-[#F8FAFC] text-sm font-semibold">{m.title}</Text>
                <Text className="text-[#94A3B8] text-xs">{m.category || ''}</Text>
              </View>
              <TouchableOpacity onPress={() => {}}>
                <Ionicons name="play-circle" size={28} color="#00AEEF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      );
    }
    if (seriesFavorites.length === 0) {
      return <EmptyState icon="heart-outline" title="No favorite series" subtitle="Tap the heart icon on any series to save it here" />;
    }
    return (
      <View className="px-5">
        {seriesFavorites.map((s, i) => (
          <View key={s.id || i} className="flex-row items-center bg-[#101827] rounded-xl p-4 mb-2 border border-white/10 gap-3">
            <View className="w-10 h-10 rounded-full bg-[#101827] items-center justify-center">
              <Ionicons name="layers" size={20} color="#22C55E" />
            </View>
            <View className="flex-1">
              <Text className="text-[#F8FAFC] text-sm font-semibold">{s.title}</Text>
              <Text className="text-[#94A3B8] text-xs">{s.category || ''}</Text>
            </View>
            <TouchableOpacity onPress={() => {}}>
              <Ionicons name="play-circle" size={28} color="#00AEEF" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#050816]">
      <View className="pt-14 px-5 pb-3">
        <Text className="text-[#F8FAFC] text-3xl font-extrabold">Favorites</Text>
      </View>

      <View className="flex-row mx-5 bg-[#101827] rounded-xl p-1 mb-4">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl gap-1.5 ${activeTab === tab.key ? 'bg-[#050816]' : ''}`}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.key ? '#00AEEF' : '#94A3B8'}
            />
            <Text className={`text-xs font-semibold ${activeTab === tab.key ? 'text-[#00AEEF]' : 'text-[#94A3B8]'}`}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View className={`px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-[#00AEEF]/20' : 'bg-[#94A3B8]/20'}`}>
                <Text className={`text-[10px] font-bold ${activeTab === tab.key ? 'text-[#00AEEF]' : 'text-[#94A3B8]'}`}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-1">
        {renderContent()}
      </View>
    </View>
  );
}
