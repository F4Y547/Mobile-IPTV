import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaylistStore } from '../store/playlistStore';
import { useFavoriteStore } from '../store/favoriteStore';
import SearchBar from '../components/SearchBar';
import ChannelCard from '../components/ChannelCard';
import { ListSkeleton } from '../components/LoadingSkeleton';

interface Props {
  navigation: any;
  route?: any;
}

const ITEMS_PER_PAGE = 30;

export default function LiveTVScreen({ navigation, route }: Props) {
  const { channels, activePlaylist } = usePlaylistStore();
  const { channelFavorites, toggleChannelFavorite } = useFavoriteStore();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);

  const categories = ['All', ...new Set(channels.map((c) => c.category || 'Uncategorized'))];

  useEffect(() => {
    if (route?.params?.category) {
      setSelectedCat(route.params.category);
    }
  }, [route?.params?.category]);

  const filtered = channels.filter((ch) => {
    const matchSearch = ch.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'All' || ch.category === selectedCat;
    return matchSearch && matchCat;
  });

  const paginated = filtered.slice(0, (page + 1) * ITEMS_PER_PAGE);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activePlaylist) {
      const { loadCachedChannels } = usePlaylistStore.getState();
      await loadCachedChannels(activePlaylist.id);
    }
    setRefreshing(false);
  }, [activePlaylist]);

  const handleSearch = useCallback((text: string) => {
    setSearch(text);
    setPage(0);
  }, []);

  const handleToggleFav = useCallback((channel: any) => {
    toggleChannelFavorite(
      {
        id: channel.id || `ch_${channel.name}`,
        playlist_id: activePlaylist?.id || '',
        name: channel.name,
        stream_url: channel.streamUrl,
        logo: channel.tvgLogo || '',
        category: channel.category,
        is_favorite: channelFavorites.some((c: any) => c.id === channel.id || c.name === channel.name),
        is_live: true,
      },
      ''
    );
  }, [activePlaylist, channelFavorites]);

  if (!channels.length) {
    return (
      <View className="flex-1 bg-[#050816]">
        <View className="pt-14 px-5 pb-2">
          <Text className="text-[#F8FAFC] text-3xl font-extrabold">Live TV</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="tv-outline" size={56} color="#64748B" />
          <Text className="text-[#94A3B8] text-lg font-semibold mt-4 text-center">No Channels Found</Text>
          <Text className="text-[#64748B] text-sm text-center mt-2">Add a playlist to start watching live TV</Text>
          <TouchableOpacity
            className="mt-5 bg-[#00AEEF] px-6 py-3 rounded-full"
            onPress={() => navigation.navigate('AddPlaylist')}
          >
            <Text className="text-white font-bold">Add Playlist</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#050816]">
      <View className="pt-14 px-5 pb-1 flex-row justify-between items-center">
        <Text className="text-[#F8FAFC] text-3xl font-extrabold">Live TV</Text>
        <TouchableOpacity onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
          <Ionicons name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'} size={22} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <SearchBar value={search} onChangeText={handleSearch} placeholder="Search channels..." />

      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        className="max-h-[44px] mb-2"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: 'center' }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`px-4 py-2 rounded-full border ${selectedCat === item ? 'bg-[#00AEEF] border-[#00AEEF]' : 'bg-[#101827] border-white/10'}`}
            onPress={() => { setSelectedCat(item); setPage(0); }}
          >
            <Text className={`text-xs font-semibold ${selectedCat === item ? 'text-white' : 'text-[#94A3B8]'}`}>
              {item} {item === 'All' ? `(${channels.length})` : `(${channels.filter((c) => c.category === item).length})`}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={paginated}
        keyExtractor={(item, idx) => `${item.name}_${idx}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00AEEF" />}
        numColumns={viewMode === 'grid' ? 2 : 1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: viewMode === 'grid' ? 16 : 0, paddingBottom: 100 }}
        columnWrapperStyle={viewMode === 'grid' ? { gap: 12 } : undefined}
        onEndReached={() => setPage((p) => p + 1)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={page > 0 && paginated.length < filtered.length ? (
          <View className="py-4"><ActivityIndicator color="#00AEEF" /></View>
        ) : null}
        renderItem={({ item, index }) => (
          <View style={viewMode === 'grid' ? { width: '48%' } : {}}>
            <ChannelCard
              channel={{
                id: `ch_${index}`,
                playlist_id: activePlaylist?.id || '',
                name: item.name,
                stream_url: item.streamUrl,
                logo: item.tvgLogo || '',
                category: item.category || 'Uncategorized',
                tvg_id: item.tvgId,
                is_favorite: channelFavorites.some((f: any) => f.name === item.name),
                is_live: true,
              }}
              onPress={() => navigation.navigate('Player', { channel: item })}
              onToggleFavorite={() => handleToggleFav(item)}
              variant={viewMode === 'list' ? 'list' : 'grid'}
            />
          </View>
        )}
      />
    </View>
  );
}
