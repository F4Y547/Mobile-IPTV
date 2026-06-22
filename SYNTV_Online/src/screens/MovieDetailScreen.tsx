import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../theme';
import FavoriteButton from '../components/FavoriteButton';
import { movies } from '../utils/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MovieDetailScreenProps {
  navigation: any;
  route: any;
}

export default function MovieDetailScreen({ navigation, route }: MovieDetailScreenProps) {
  const { movie } = route.params;
  const related = movies.filter((m) => m.category === movie.category && m.id !== movie.id);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Backdrop */}
        <View style={styles.backdropContainer}>
          <Image
            source={{ uri: movie.poster || 'https://via.placeholder.com/600x400/101827/00AEEF?text=Movie' }}
            style={styles.backdrop}
          />
          <LinearGradient colors={['transparent', COLORS.background]} style={styles.backdropGradient} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Title Row */}
          <View style={styles.titleRow}>
            <View style={styles.titleInfo}>
              <Text style={styles.title}>{movie.title}</Text>
              <Text style={styles.meta}>
                {movie.year} · {movie.category} · {movie.duration}
              </Text>
            </View>
            <FavoriteButton isFavorite={movie.isFavorite} onToggle={() => {}} size={24} />
          </View>

          {/* Rating */}
          {movie.rating && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color={COLORS.warning} />
              <Text style={styles.rating}>{movie.rating}</Text>
              <Text style={styles.ratingScale}>/10</Text>
            </View>
          )}

          {/* Play Button */}
          <TouchableOpacity style={styles.playBtn} activeOpacity={0.85}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.playGradient}>
              <Ionicons name="play" size={22} color="#fff" />
              <Text style={styles.playText}>Play Movie</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Description */}
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{movie.description}</Text>

          {/* Related */}
          {related.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Related Movies</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedRow}>
                {related.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={styles.relatedCard}
                    onPress={() => navigation.replace('MovieDetail', { movie: m })}
                  >
                    <Image
                      source={{ uri: m.poster || 'https://via.placeholder.com/150x225/101827/00AEEF?text=Movie' }}
                      style={styles.relatedPoster}
                    />
                    <Text style={styles.relatedTitle} numberOfLines={1}>{m.title}</Text>
                    <Text style={styles.relatedYear}>{m.year}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  backdropContainer: { height: 280 },
  backdrop: { width: SCREEN_WIDTH, height: 280, position: 'absolute' },
  backdropGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  backBtn: {
    position: 'absolute',
    top: 55,
    left: SPACING.xl,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: SPACING.xl, marginTop: -40 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleInfo: { flex: 1 },
  title: { color: COLORS.textWhite, fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  meta: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, marginTop: 4 },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  rating: { color: COLORS.warning, fontSize: FONT_SIZES.xl, fontWeight: '800' },
  ratingScale: { color: COLORS.textDim, fontSize: FONT_SIZES.md },
  playBtn: { marginTop: 20, borderRadius: RADIUS.md, overflow: 'hidden' },
  playGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  playText: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '700' },
  sectionLabel: {
    color: COLORS.textWhite,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
  },
  description: { color: COLORS.textMuted, fontSize: FONT_SIZES.md, lineHeight: 22 },
  relatedRow: { gap: SPACING.md },
  relatedCard: { width: 120 },
  relatedPoster: { width: 120, height: 180, borderRadius: RADIUS.md },
  relatedTitle: { color: COLORS.textWhite, fontSize: FONT_SIZES.sm, fontWeight: '600', marginTop: 6 },
  relatedYear: { color: COLORS.textMuted, fontSize: FONT_SIZES.xs },
});
