import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING } from '../theme';
import ChannelCard from '../components/ChannelCard';
import MovieCard from '../components/MovieCard';
import SeriesCard from '../components/SeriesCard';
import EmptyState from '../components/EmptyState';
import { liveChannels, movies, series } from '../utils/mockData';

interface FavoritesScreenProps {
  navigation: any;
}

export default function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const [activeTab, setActiveTab] = useState<'channels' | 'movies' | 'series'>('channels');

  const favChannels = liveChannels.filter((ch) => ch.isFavorite);
  const favMovies = movies.filter((mv) => mv.isFavorite);
  const favSeries = series.filter((s) => s.isFavorite);

  const tabs = [
    { key: 'channels', label: 'Channels', count: favChannels.length, icon: 'tv' },
    { key: 'movies', label: 'Movies', count: favMovies.length, icon: 'film' },
    { key: 'series', label: 'Series', count: favSeries.length, icon: 'layers' },
  ] as const;

  const renderContent = () => {
    if (activeTab === 'channels') {
      return favChannels.length === 0 ? (
        <EmptyState icon="heart-outline" title="No favorite channels" subtitle="Tap the heart icon on any channel to save it here" />
      ) : (
        <View style={styles.tabContent}>
          {favChannels.map((ch) => (
            <ChannelCard
              key={ch.id}
              channel={ch}
              onPress={() => navigation.navigate('VideoPlayer', { channel: ch })}
              onToggleFavorite={() => {}}
              variant="list"
            />
          ))}
        </View>
      );
    }

    if (activeTab === 'movies') {
      return favMovies.length === 0 ? (
        <EmptyState icon="heart-outline" title="No favorite movies" subtitle="Tap the heart icon on any movie to save it here" />
      ) : (
        <View style={styles.grid}>
          {favMovies.map((mv) => (
            <MovieCard
              key={mv.id}
              movie={mv}
              onPress={() => {}}
              onToggleFavorite={() => {}}
            />
          ))}
        </View>
      );
    }

    return favSeries.length === 0 ? (
      <EmptyState icon="heart-outline" title="No favorite series" subtitle="Tap the heart icon on any series to save it here" />
    ) : (
      <View style={styles.grid}>
        {favSeries.map((s) => (
          <SeriesCard
            key={s.id}
            series={s}
            onPress={() => {}}
            onToggleFavorite={() => {}}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.activeTabBtn]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.key ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[styles.badge, activeTab === tab.key && styles.activeBadge]}>
                <Text style={styles.badgeText}>{tab.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderContent()}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xl, paddingTop: 55, paddingBottom: SPACING.md },
  headerTitle: { color: COLORS.textWhite, fontSize: FONT_SIZES.xxxl, fontWeight: '800' },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  activeTabBtn: { backgroundColor: COLORS.background },
  tabLabel: { color: COLORS.textMuted, fontWeight: '600', fontSize: FONT_SIZES.sm },
  activeTabLabel: { color: COLORS.primary },
  badge: {
    backgroundColor: 'rgba(148,163,184,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  activeBadge: { backgroundColor: 'rgba(0,174,239,0.2)' },
  badgeText: { color: COLORS.textMuted, fontSize: FONT_SIZES.xs, fontWeight: '700' },
  tabContent: { gap: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
});
