import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, FONT_SIZES } from '../theme';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, { toValue: 1, duration: 600, easing: Easing.elastic(1), useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(loadingOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    setTimeout(onFinish, 3000);
  }, []);

  return (
    <LinearGradient colors={['#050816', '#0A0F2C', '#050816']} style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoWrapper, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <Animated.View style={[styles.glowRing, { transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.iconContainer}>
            <Ionicons name="play-circle" size={64} color={COLORS.primary} />
          </View>
          <Text style={styles.brandName}>
            SY<Text style={styles.accent}>N</Text>TV
          </Text>
          <View style={styles.taglineRow}>
            <View style={styles.line} />
            <Text style={styles.online}>ONLINE</Text>
            <View style={styles.line} />
          </View>
        </Animated.View>

        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Premium Legal IPTV Player
        </Animated.Text>

        <Animated.View style={[styles.loadingContainer, { opacity: loadingOpacity }]}>
          <View style={styles.loadingBar}>
            <View style={styles.loadingFill} />
          </View>
          <Text style={styles.loadingText}>Loading...</Text>
        </Animated.View>
      </View>

      <Text style={styles.footer}>Developed by Mohammed Faysal</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  logoWrapper: { alignItems: 'center', marginBottom: 30 },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(0,174,239,0.3)',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,174,239,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandName: {
    fontSize: 48,
    color: COLORS.textWhite,
    fontWeight: '900',
    letterSpacing: 4,
  },
  accent: { color: COLORS.primary },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  line: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.primary,
    opacity: 0.5,
  },
  online: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    letterSpacing: 3,
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.lg,
    letterSpacing: 1,
    marginBottom: 40,
  },
  loadingContainer: { alignItems: 'center', gap: 8 },
  loadingBar: {
    width: 120,
    height: 3,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingFill: {
    width: '40%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  loadingText: { color: COLORS.textDim, fontSize: FONT_SIZES.sm },
  footer: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.xs,
    paddingBottom: 30,
  },
});
