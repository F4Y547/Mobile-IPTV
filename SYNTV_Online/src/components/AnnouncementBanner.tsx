import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../theme';

interface AnnouncementBannerProps {
  title: string;
  description?: string;
  onPress?: () => void;
  onDismiss?: () => void;
}

export default function AnnouncementBanner({ title, description, onPress, onDismiss }: AnnouncementBannerProps) {
  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={['rgba(0,174,239,0.15)', 'rgba(124,58,237,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.banner}
      >
        <View style={styles.iconBox}>
          <Ionicons name="megaphone" size={20} color={COLORS.warning} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
            <Ionicons name="close" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    ...SHADOWS.small,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0,174,239,0.2)',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245,158,11,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  title: { color: COLORS.textWhite, fontSize: FONT_SIZES.md, fontWeight: '600' },
  description: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, marginTop: 2 },
  dismissBtn: { padding: 4 },
});
