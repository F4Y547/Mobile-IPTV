import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING } from '../theme';
import SearchBar from '../components/SearchBar';
import ChannelCard from '../components/ChannelCard';
import MovieCard from '../components/MovieCard';
import SeriesCard from '../components/SeriesCard';
import { liveChannels, movies, series } from '../utils/mockData';

interface SearchScreenProps {
  navigation: any;
}

export default function SearchScreen({ navigation }: SearchScreenProps) {
  const [query, setQuery] = useState('');

  const channelResults = liveChannels.filter((ch) =>
    ch.name.toLowerCase().includes(query.toLowerCase())
  );
  const movieResults = movies.filter((mv) =>
    mv.title.toLowerCase().includes(query.toLowerCase())
  );
  const seriesResults = series.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  const hasResults = query.length > 0;
  const totalResults = channelResults.length + movieResults.length + seriesResults.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={{ width: 24 }} />
      </View>

      <SearchBar value={query} onChangeText={setQuery} placeholder="Search anything..." showFilter={false} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {!hasResults ? (
          <View style={styles.initialState}>
            <View style={styles.searchIconCircle}>
              <Ionicons name="search" size={48} color={COLORS.textDim} />
            </View>
            <Text style={styles.initialTitle}>Find Channels, Movies & Series</Text>
            <Text style={styles.initialSub}>Search across your entire IPTV library</Text>
          </View>
        ) : totalResults === 0 ? (
          <View style={styles.initialState}>
            <Ionicons name="search-outline" size={48} color={COLORS.textDim} />
            <Text style={styles.initialTitle}>No results found</Text>
            <Text style={styles.initialSub}>Try a different search term</Text>
          </View>
        ) : (
          <>
            {channelResults.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="tv" size={18} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Channels ({channelResults.length})</Text>
                </View>
                {channelResults.map((ch) => (
                  <ChannelCard
                    key={ch.id}
                    channel={ch}
                    onPress={() => navigation.navigate('VideoPlayer', { channel: ch })}
                    onToggleFavorite={() => {}}
                    variant="list"
                  />
                ))}
              </View>
            )}

            {movieResults.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="film" size={18} color={COLORS.secondary} />
                  <Text style={styles.sectionTitle}>Movies ({movieResults.length})</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.resultRow}>
                  {movieResults.map((mv) => (
                    <MovieCard
                      key={mv.id}
                      movie={mv}
                      onPress={() => {}}
                      onToggleFavorite={() => {}}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {seriesResults.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="layers" size={18} color={COLORS.success} />
                  <Text style={styles.sectionTitle}>Series ({seriesResults.length})</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.resultRow}>
                  {seriesResults.map((s) => (
                    <SeriesCard
                      key={s.id}
                      series={s}
                      onPress={() => {}}
                      onToggleFavorite={() => {}}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: 55,
    paddingBottom: SPACING.sm,
  },
  headerTitle: { color: COLORS.textWhite, fontSize: FONT_SIZES.xl, fontWeight: '700' },
  initialState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  searchIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  initialTitle: { color: COLORS.textMuted, fontSize: FONT_SIZES.xl, fontWeight: '600' },
  initialSub: { color: COLORS.textDim, fontSize: FONT_SIZES.md },
  section: { marginTop: SPACING.lg },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    gap: 8,
    marginBottom: SPACING.md,
  },
  sectionTitle: { color: COLORS.textWhite, fontWeight: '700', fontSize: FONT_SIZES.lg },
  resultRow: { paddingHorizontal: SPACING.lg, gap: SPACING.md },
});
