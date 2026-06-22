import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING } from '../theme';
import SearchBar from '../components/SearchBar';
import MovieCard from '../components/MovieCard';
import { movies } from '../utils/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const categories = ['All', 'Action', 'Sci-Fi', 'Drama', 'Comedy', 'Horror'];

interface MoviesScreenProps {
  navigation: any;
}

export default function MoviesScreen({ navigation }: MoviesScreenProps) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const filtered = movies.filter((mv) => {
    const matchesSearch = mv.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'All' || mv.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Movies</Text>
        <Text style={styles.headerCount}>{filtered.length} movies</Text>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search movies..." />

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
            <Ionicons name="film-outline" size={48} color={COLORS.textDim} />
            <Text style={styles.emptyText}>No movies found</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map((mv) => (
              <View key={mv.id} style={{ width: CARD_WIDTH }}>
                <MovieCard
                  movie={mv}
                  onPress={() => navigation.navigate('MovieDetail', { movie: mv })}
                  onToggleFavorite={() => {}}
                />
              </View>
            ))}
          </View>
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
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.xl,
    paddingTop: 55,
    paddingBottom: SPACING.sm,
  },
  headerTitle: { color: COLORS.textWhite, fontSize: FONT_SIZES.xxxl, fontWeight: '800' },
  headerCount: { color: COLORS.textMuted, fontSize: FONT_SIZES.md },
  chipsRow: { maxHeight: 44, marginBottom: SPACING.sm },
  chipsContent: { paddingHorizontal: SPACING.xl, gap: 8 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  activeChip: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.textMuted, fontWeight: '600', fontSize: FONT_SIZES.sm },
  activeChipText: { color: '#fff' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: COLORS.textDim, fontSize: FONT_SIZES.lg },
});
