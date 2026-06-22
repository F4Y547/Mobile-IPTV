import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaylistStore } from '../store/playlistStore';
import { useFavoriteStore } from '../store/favoriteStore';
import SearchBar from '../components/SearchBar';

interface Props {
  navigation: any;
}

export default function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const { channels } = usePlaylistStore();
  const { movieFavorites, seriesFavorites } = useFavoriteStore();

  const channelResults = channels.filter((ch) =>
    ch.name.toLowerCase().includes(query.toLowerCase())
  );
  const movieResults = movieFavorites.filter((m) =>
    m.title?.toLowerCase().includes(query.toLowerCase())
  );
  const seriesResults = seriesFavorites.filter((s) =>
    s.title?.toLowerCase().includes(query.toLowerCase())
  );

  const hasQuery = query.length > 0;
  const totalResults = channelResults.length + movieResults.length + seriesResults.length;

  const sections: { title: string; icon: string; color: string; data: any[]; render: (item: any, i: number) => any }[] = [];

  if (channelResults.length > 0) {
    sections.push({
      title: `Channels (${channelResults.length})`,
      icon: 'tv',
      color: '#00AEEF',
      data: channelResults,
      render: (item, i) => (
        <TouchableOpacity
          key={i}
          className="flex-row items-center bg-[#101827] rounded-xl p-3.5 mb-1.5 border border-white/10 gap-3"
          onPress={() => navigation.navigate('Player', { channel: item })}
        >
          {item.tvgLogo && <Image source={{ uri: item.tvgLogo }} className="w-9 h-9 rounded-full" />}
          <View className="flex-1">
            <Text className="text-[#F8FAFC] text-sm font-semibold">{item.name}</Text>
            <Text className="text-[#94A3B8] text-[10px]">{item.category || 'Uncategorized'}</Text>
          </View>
          <Ionicons name="play-circle" size={28} color="#00AEEF" />
        </TouchableOpacity>
      ),
    });
  }

  if (movieResults.length > 0) {
    sections.push({
      title: `Movies (${movieResults.length})`,
      icon: 'film',
      color: '#7C3AED',
      data: movieResults,
      render: (item, i) => (
        <View key={i} className="flex-row items-center bg-[#101827] rounded-xl p-3.5 mb-1.5 border border-white/10 gap-3">
          <View className="w-9 h-9 rounded-full bg-[#101827] items-center justify-center">
            <Ionicons name="film" size={18} color="#7C3AED" />
          </View>
          <View className="flex-1">
            <Text className="text-[#F8FAFC] text-sm font-semibold">{item.title || item.name}</Text>
            <Text className="text-[#94A3B8] text-[10px]">{item.category || ''}</Text>
          </View>
        </View>
      ),
    });
  }

  if (seriesResults.length > 0) {
    sections.push({
      title: `Series (${seriesResults.length})`,
      icon: 'layers',
      color: '#22C55E',
      data: seriesResults,
      render: (item, i) => (
        <View key={i} className="flex-row items-center bg-[#101827] rounded-xl p-3.5 mb-1.5 border border-white/10 gap-3">
          <View className="w-9 h-9 rounded-full bg-[#101827] items-center justify-center">
            <Ionicons name="layers" size={18} color="#22C55E" />
          </View>
          <View className="flex-1">
            <Text className="text-[#F8FAFC] text-sm font-semibold">{item.title || item.name}</Text>
            <Text className="text-[#94A3B8] text-[10px]">{item.category || ''}</Text>
          </View>
        </View>
      ),
    });
  }

  return (
    <View className="flex-1 bg-[#050816]">
      <View className="flex-row items-center justify-between px-5 pt-14 pb-1">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text className="text-[#F8FAFC] text-lg font-bold flex-1 text-center">Search</Text>
        <View style={{ width: 24 }} />
      </View>

      <SearchBar value={query} onChangeText={setQuery} placeholder="Search channels, movies, series..." />

      {!hasQuery ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-[100px] h-[100px] rounded-full bg-[#101827] items-center justify-center mb-5">
            <Ionicons name="search" size={48} color="#64748B" />
          </View>
          <Text className="text-[#94A3B8] text-xl font-semibold text-center">Find Channels, Movies & Series</Text>
          <Text className="text-[#64748B] text-sm text-center mt-2">Search across your entire IPTV library</Text>
        </View>
      ) : totalResults === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="search-outline" size={48} color="#64748B" />
          <Text className="text-[#94A3B8] text-lg mt-4">No results found</Text>
          <Text className="text-[#64748B] text-sm mt-2">Try a different search term</Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.title}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item: section }) => (
            <View className="mt-4">
              <View className="flex-row items-center px-5 gap-2 mb-3">
                <Ionicons name={section.icon as any} size={18} color={section.color as any} />
                <Text className="text-[#F8FAFC] text-base font-bold">{section.title}</Text>
              </View>
              <View className="px-5">
                {section.data.map((item: any, i: number) => section.render(item, i))}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
