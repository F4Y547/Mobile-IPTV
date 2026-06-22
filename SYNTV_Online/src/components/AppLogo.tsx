import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES } from '../theme';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
}

export default function AppLogo({ size = 'medium', showTagline = true }: AppLogoProps) {
  const iconSize = size === 'large' ? 40 : size === 'medium' ? 28 : 20;
  const textSize = size === 'large' ? FONT_SIZES.display : size === 'medium' ? FONT_SIZES.xxxl : FONT_SIZES.xl;

  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <View style={[styles.iconWrapper, { width: iconSize + 16, height: iconSize + 16 }]}>
          <Ionicons name="play-circle" size={iconSize} color={COLORS.primary} />
          <View style={styles.iconGlow} />
        </View>
        <Text style={[styles.logoText, { fontSize: textSize }]}>
          SY<Text style={styles.accent}>N</Text>TV
        </Text>
      </View>
      {showTagline && (
        <Text style={[styles.tagline, { fontSize: size === 'small' ? FONT_SIZES.xs : FONT_SIZES.sm }]}>
          Premium Legal IPTV Player
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  iconGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    opacity: 0.15,
  },
  logoText: {
    color: COLORS.textWhite,
    fontFamily: 'System',
    fontWeight: '900',
    letterSpacing: 2,
  },
  accent: { color: COLORS.primary },
  tagline: {
    color: COLORS.textMuted,
    marginTop: 4,
    letterSpacing: 1,
  },
});
