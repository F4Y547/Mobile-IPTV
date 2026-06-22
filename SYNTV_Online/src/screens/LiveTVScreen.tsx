import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING } from '../theme';
import SearchBar from '../components/SearchBar';
import ChannelCard from '../components/ChannelCard';
import { liveChannels } from '../utils/mockData';

interface LiveTVScreenProps {
  navigation: any;
}

const categories = ['All', 'Sports', 'News', 'Movies', 'Kids', 'Music', 'Documentary'];

export default function LiveTVScreen({ navigation }: LiveTVScreenProps) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = liveChannels.filter((ch) => {
    const matchesSearch = ch.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'All' || ch.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live TV</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            <Ionicons name={viewMode === 'grid' ? 'list' : 'grid'} size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search channels..." />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsContent}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selectedCat === cat && styles.activeChip]}
            onPress={() => setSelectedCat(cat)}
          >
            <Text style={[styles.chipText, selectedCat === cat && styles.activeChipText]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="tv-outline" size={48} color={COLORS.textDim} />
            <Text style={styles.emptyText}>No channels found</Text>
          </View>
        ) : viewMode === 'grid' ? (
          <View style={styles.grid}>
            {filtered.map((ch) => (
              <ChannelCard
                key={ch.id}
                channel={ch}
                onPress={() => navigation.navigate('VideoPlayer', { channel: ch })}
                onToggleFavorite={() => {}}
              />
            ))}
          </View>
        ) : (
          filtered.map((ch) => (
            <ChannelCard
              key={ch.id}
              channel={ch}
              onPress={() => navigation.navigate('VideoPlayer', { channel: ch })}
              onToggleFavorite={() => {}}
              variant="list"
            />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 55,
  },
  headerTitle: { color: COLORS.textWhite, fontSize: FONT_SIZES.xxxl, fontWeight: '800' },
  headerRight: { flexDirection: 'row', gap: 16 },
  chipsRow: { maxHeight: 44, marginBottom: SPACING.sm },
  chipsContent: { paddingHorizontal: SPACING.xl, gap: 8, alignItems: 'center' },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  activeChipText: { color: '#fff' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    justifyContent: 'flex-start',
  },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: COLORS.textDim, fontSize: FONT_SIZES.lg },
});
