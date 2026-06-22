import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal, Image, ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import { useFavoriteStore } from '../store/favoriteStore';
import { usePlaylistStore } from '../store/playlistStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COL = 2;
const GAP = 12;
const CARD_W = (SCREEN_WIDTH - 32 - GAP) / NUM_COL;

interface Props {
  navigation: any;
}

interface DisplayItem {
  id: string;
  name: string;
  tvgLogo: string;
  category: string;
  description?: string;
  rating?: number;
  seasons: any[];
}

export default function SeriesScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const { channels } = usePlaylistStore();
  const { seriesFavorites } = useFavoriteStore();
  const [selectedSeries, setSelectedSeries] = useState<DisplayItem | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  // Series from playlist (channels with 'Series' category) + local favorites
  const seriesChannels: DisplayItem[] = channels
    .filter((c) => c.category?.toLowerCase().includes('series'))
    .map((c, i) => ({
      id: `ch_${i}`,
      name: c.name,
      tvgLogo: c.tvgLogo || '',
      category: c.category || 'Uncategorized',
      seasons: [],
    }));
  const seriesFavs: DisplayItem[] = seriesFavorites.map((s, i) => ({
    id: s.id,
    name: s.title,
    tvgLogo: s.poster || '',
    category: s.category || 'Uncategorized',
    description: s.description,
    rating: s.rating,
    seasons: s.seasons || [],
  }));
  const allItems = [...seriesChannels, ...seriesFavs].filter(
    (s, i, arr) => arr.findIndex((x) => x.name === s.name) === i
  );

  const filtered = allItems.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const openDetail = (item: any) => {
    setSelectedSeries(item);
    setSelectedSeason(0);
    setShowDetail(true);
  };

  return (
    <View className="flex-1 bg-[#050816]">
      <View className="pt-14 px-5 pb-1 flex-row justify-between items-end">
        <Text className="text-[#F8FAFC] text-3xl font-extrabold">Series</Text>
        <Text className="text-[#94A3B8] text-sm">{filtered.length} series</Text>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search series..." />

      <FlatList
        data={filtered}
        keyExtractor={(item, i) => `${item.name}_${i}`}
        numColumns={NUM_COL}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, flexGrow: 1 }}
        columnWrapperStyle={{ gap: GAP }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="tv-outline" size={48} color="#64748B" />
            <Text className="text-[#94A3B8] text-lg mt-4">No series found</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={{ width: CARD_W }}>
            <TouchableOpacity
              className="h-[210px] rounded-2xl overflow-hidden mb-4"
              onPress={() => openDetail(item)}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: item.tvgLogo || 'https://via.placeholder.com/300x450/101827/7C3AED?text=Series' }}
                className="absolute w-full h-full"
              />
              <View className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#050816]" style={{ backgroundColor: 'transparent' }} />
              <View className="absolute bottom-2 left-2 right-2">
                <Text className="text-[#F8FAFC] text-xs font-semibold" numberOfLines={2}>{item.name}</Text>
                {item.category && <Text className="text-[#94A3B8] text-[10px] mt-0.5">{item.category}</Text>}
              </View>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Series Detail Modal */}
      <Modal visible={showDetail} transparent animationType="slide">
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-[#101827] rounded-t-3xl max-h-[85%] p-5">
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity className="self-end p-1 mb-2" onPress={() => setShowDetail(false)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>

              {selectedSeries && (
                <>
                  <View className="flex-row gap-4 mb-5">
                    <Image
                      source={{ uri: selectedSeries.tvgLogo || 'https://via.placeholder.com/120x180/101827/7C3AED' }}
                      className="w-[120px] h-[180px] rounded-xl"
                    />
                    <View className="flex-1 gap-1.5">
                      <Text className="text-[#F8FAFC] text-lg font-extrabold">{selectedSeries.name}</Text>
                      <Text className="text-[#94A3B8] text-xs">
                        {selectedSeries.category || 'Uncategorized'}
                      </Text>
                      {selectedSeries.rating && (
                        <Text className="text-[#F59E0B] text-xs">{selectedSeries.rating} ⭐</Text>
                      )}
                      {selectedSeries.description && (
                        <Text className="text-[#94A3B8] text-xs leading-5 mt-2" numberOfLines={4}>
                          {selectedSeries.description}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Season selector */}
                  {selectedSeries.seasons && selectedSeries.seasons.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                      {selectedSeries.seasons.map((s: any, i: number) => (
                        <TouchableOpacity
                          key={s.id || i}
                          className={`px-4 py-2 rounded-full mr-2 border ${
                            i === selectedSeason
                              ? 'bg-[#00AEEF] border-[#00AEEF]'
                              : 'bg-[#050816] border-white/10'
                          }`}
                          onPress={() => setSelectedSeason(i)}
                        >
                          <Text className={`text-xs font-semibold ${i === selectedSeason ? 'text-white' : 'text-[#94A3B8]'}`}>
                            Season {s.number || (i + 1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}

                  {/* Episodes */}
                  {selectedSeries.seasons?.[selectedSeason]?.episodes?.map((ep: any, i: number) => (
                    <TouchableOpacity
                      key={ep.id || i}
                      className="flex-row items-center bg-[#050816] rounded-xl p-3.5 mb-2 border border-white/10 gap-3"
                    >
                      <View className="w-12 h-12 rounded-lg bg-[#101827] items-center justify-center">
                        <Ionicons name="play-circle" size={24} color="#00AEEF" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[#F8FAFC] text-sm font-semibold">
                          {ep.number || (i + 1)}. {ep.title || `Episode ${i + 1}`}
                        </Text>
                        {ep.duration && (
                          <Text className="text-[#94A3B8] text-xs mt-0.5">{ep.duration}</Text>
                        )}
                      </View>
                      {ep.is_watched && (
                        <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                      )}
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
