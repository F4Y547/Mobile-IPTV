import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SearchBar from '../components/SearchBar';
import { usePlaylistStore } from '../store/playlistStore';
import EmptyState from '../components/EmptyState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COL = 2;
const GAP = 12;
const CARD_W = (SCREEN_WIDTH - 32 - GAP) / NUM_COL;

interface Props {
  navigation: any;
}

interface DisplayItem {
  id: string;
  title: string;
  poster: string;
  category: string;
}

export default function MoviesScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const { channels } = usePlaylistStore();

  const items: DisplayItem[] = useMemo(() => {
    return channels
      .filter((c) =>
        c.category?.toLowerCase().includes('movie') || c.category?.toLowerCase().includes('vod')
      )
      .map((c, i) => ({
        id: `mv_${i}`,
        title: c.name,
        poster: c.tvgLogo || '',
        category: c.category || 'Uncategorized',
      }));
  }, [channels]);

  const categories = useMemo(() =>
    ['All', ...new Set(items.map((m) => m.category))],
    [items]
  );

  const filtered = useMemo(() =>
    items.filter((m) => {
      const ms = m.title.toLowerCase().includes(search.toLowerCase());
      const mc = selectedCat === 'All' || m.category === selectedCat;
      return ms && mc;
    }),
    [items, search, selectedCat]
  );

  return (
    <View className="flex-1 bg-[#050816]">
      <View className="pt-14 px-5 pb-1 flex-row justify-between items-end">
        <Text className="text-[#F8FAFC] text-3xl font-extrabold">Movies</Text>
        <Text className="text-[#94A3B8] text-sm">{filtered.length} movies</Text>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search movies..." />

      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        className="max-h-11 mb-2"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`px-4 py-2 rounded-full border ${selectedCat === item ? 'bg-[#00AEEF] border-[#00AEEF]' : 'bg-[#101827] border-white/10'}`}
            onPress={() => setSelectedCat(item)}
          >
            <Text className={`text-xs font-semibold ${selectedCat === item ? 'text-white' : 'text-[#94A3B8]'}`}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COL}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, flexGrow: 1 }}
        columnWrapperStyle={{ gap: GAP }}
        ListEmptyComponent={<EmptyState icon="film-outline" title="No movies found" />}
        renderItem={({ item }) => (
          <View style={{ width: CARD_W }}>
            <TouchableOpacity className="h-[210px] rounded-2xl overflow-hidden" onPress={() => {}} activeOpacity={0.85}>
              <Image
                source={{ uri: item.poster || 'https://via.placeholder.com/300x450/101827/00AEEF?text=Movie' }}
                className="absolute w-full h-full"
              />
              <LinearGradient colors={['transparent', 'rgba(5,8,22,0.95)']} className="absolute bottom-0 left-0 right-0 h-1/2" />
              <View className="absolute bottom-2 left-2 right-2">
                <Text className="text-[#F8FAFC] text-xs font-semibold" numberOfLines={2}>{item.title}</Text>
                {item.category && <Text className="text-[#94A3B8] text-[10px] mt-0.5">{item.category}</Text>}
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
