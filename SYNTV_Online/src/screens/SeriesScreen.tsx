import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, Image, FlatList, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../theme';
import SearchBar from '../components/SearchBar';
import SeriesCard from '../components/SeriesCard';
import { series } from '../utils/mockData';

interface SeriesScreenProps {
  navigation: any;
}

export default function SeriesScreen({ navigation }: SeriesScreenProps) {
  const [search, setSearch] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  const filtered = series.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));

  const openDetail = (s: any) => {
    setSelectedSeries(s);
    setSelectedSeason(0);
    setShowDetail(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Series</Text>
        <Text style={styles.headerCount}>{filtered.length} series</Text>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search series..." />

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="tv-outline" size={48} color={COLORS.textDim} />
            <Text style={styles.emptyText}>No series found</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map((s) => (
              <SeriesCard key={s.id} series={s} onPress={() => openDetail(s)} onToggleFavorite={() => {}} />
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Series Detail Modal */}
      <Modal visible={showDetail} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity onPress={() => setShowDetail(false)} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={COLORS.textWhite} />
              </TouchableOpacity>

              {selectedSeries && (
                <>
                  <View style={styles.detailHeader}>
                    <Image source={{ uri: selectedSeries.poster }} style={styles.detailPoster} />
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailTitle}>{selectedSeries.title}</Text>
                      <Text style={styles.detailMeta}>
                        {selectedSeries.year} · {selectedSeries.rating && `${selectedSeries.rating} ⭐`}
                      </Text>
                      <Text style={styles.detailMeta}>{selectedSeries.seasons.length} Seasons</Text>
                      <Text style={styles.detailDesc}>{selectedSeries.description}</Text>
                    </View>
                  </View>

                  {/* Season Selector */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonRow} contentContainerStyle={styles.seasonContent}>
                    {selectedSeries.seasons.map((s: any, i: number) => (
                      <TouchableOpacity
                        key={s.id}
                        style={[styles.seasonBtn, i === selectedSeason && styles.activeSeason]}
                        onPress={() => setSelectedSeason(i)}
                      >
                        <Text style={[styles.seasonText, i === selectedSeason && styles.activeSeasonText]}>
                          Season {s.number}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Episode List */}
                  {selectedSeries.seasons[selectedSeason]?.episodes.map((ep: any) => (
                    <TouchableOpacity key={ep.id} style={styles.episodeCard} activeOpacity={0.7}>
                      <View style={styles.episodeThumb}>
                        <Ionicons name="play-circle" size={24} color={COLORS.primary} />
                      </View>
                      <View style={styles.episodeInfo}>
                        <Text style={styles.episodeTitle}>
                          {ep.number}. {ep.title}
                        </Text>
                        <Text style={styles.episodeDuration}>{ep.duration}</Text>
                      </View>
                      {ep.isWatched && (
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: COLORS.textDim, fontSize: FONT_SIZES.lg },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: '85%',
    padding: SPACING.xl,
  },
  modalClose: { alignSelf: 'flex-end', padding: 4, marginBottom: SPACING.sm },
  detailHeader: { flexDirection: 'row', gap: 16, marginBottom: SPACING.xl },
  detailPoster: { width: 120, height: 180, borderRadius: RADIUS.md },
  detailInfo: { flex: 1, gap: 6 },
  detailTitle: { color: COLORS.textWhite, fontSize: FONT_SIZES.xl, fontWeight: '800' },
  detailMeta: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm },
  detailDesc: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, lineHeight: 20, marginTop: 8 },
  seasonRow: { maxHeight: 40, marginBottom: SPACING.md },
  seasonContent: { gap: 8 },
  seasonBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  activeSeason: { backgroundColor: COLORS.primary },
  seasonText: { color: COLORS.textMuted, fontWeight: '600', fontSize: FONT_SIZES.sm },
  activeSeasonText: { color: '#fff' },
  episodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  episodeThumb: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  episodeInfo: { flex: 1 },
  episodeTitle: { color: COLORS.textWhite, fontWeight: '600', fontSize: FONT_SIZES.md },
  episodeDuration: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, marginTop: 2 },
});
