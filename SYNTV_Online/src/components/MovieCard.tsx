import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Movie } from '../types';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../theme';
import FavoriteButton from './FavoriteButton';

interface MovieCardProps {
  movie: Movie;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export default function MovieCard({ movie, onPress, onToggleFavorite }: MovieCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image
        source={{ uri: movie.poster || 'https://via.placeholder.com/300x450/101827/00AEEF?text=Movie' }}
        style={styles.poster}
      />
      <LinearGradient
        colors={['transparent', 'rgba(5,8,22,0.95)']}
        style={styles.posterGradient}
      />
      <View style={styles.topRow}>
        {movie.rating && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={COLORS.warning} />
            <Text style={styles.ratingText}>{movie.rating}</Text>
          </View>
        )}
        <FavoriteButton isFavorite={movie.isFavorite} onToggle={onToggleFavorite} size={18} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>
        <Text style={styles.meta}>{movie.year} · {movie.category}</Text>
      </View>
      <View style={styles.playCircle}>
        <Ionicons name="play" size={18} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 210,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  poster: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  posterGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  topRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    gap: 3,
  },
  ratingText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  info: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  title: {
    color: COLORS.textWhite,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  meta: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  playCircle: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,174,239,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
});
