import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Channel } from '../types';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../theme';
import FavoriteButton from './FavoriteButton';

interface ChannelCardProps {
  channel: Channel;
  onPress: () => void;
  onToggleFavorite: () => void;
  variant?: 'compact' | 'list';
}

export default function ChannelCard({ channel, onPress, onToggleFavorite, variant = 'compact' }: ChannelCardProps) {
  if (variant === 'list') {
    return (
      <TouchableOpacity style={styles.listContainer} onPress={onPress} activeOpacity={0.7}>
        <Image source={{ uri: channel.logo }} style={styles.listLogo} />
        <View style={styles.listInfo}>
          <Text style={styles.channelName} numberOfLines={1}>{channel.name}</Text>
          <Text style={styles.categoryText}>{channel.category}</Text>
        </View>
        {channel.isLive && (
          <View style={styles.liveBadgeSmall}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTextSmall}>LIVE</Text>
          </View>
        )}
        <FavoriteButton isFavorite={channel.isFavorite} onToggle={onToggleFavorite} size={18} />
        <Ionicons name="play-circle" size={28} color={COLORS.primary} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={[COLORS.cardBackground, '#1A2744']} style={styles.gradient}>
        <View style={styles.topRow}>
          {channel.isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          <FavoriteButton isFavorite={channel.isFavorite} onToggle={onToggleFavorite} size={18} />
        </View>
        <View style={styles.logoContainer}>
          <Image source={{ uri: channel.logo }} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.channelName} numberOfLines={1}>{channel.name}</Text>
        <Text style={styles.categoryText}>{channel.category}</Text>
        <View style={styles.playButton}>
          <Ionicons name="play" size={16} color={COLORS.textWhite} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.md,
    ...SHADOWS.medium,
  },
  gradient: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    height: 180,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logo: { width: 56, height: 56, borderRadius: 28 },
  channelName: {
    color: COLORS.textWhite,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginTop: 4,
  },
  categoryText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
  },
  playButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: 12,
  },
  listLogo: { width: 40, height: 40, borderRadius: 20 },
  listInfo: { flex: 1 },
  liveBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveTextSmall: { color: COLORS.error, fontSize: 9, fontWeight: '700', marginLeft: 3 },
});
