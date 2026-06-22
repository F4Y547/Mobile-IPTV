import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

function SkeletonBlock({ width = '100%', height = 20, borderRadius = RADIUS.sm, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: COLORS.cardBackground, opacity },
        style,
      ]}
    />
  );
}

export default function LoadingSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SkeletonBlock width={180} height={24} />
        <SkeletonBlock width={80} height={24} borderRadius={12} />
      </View>
      <View style={styles.row}>
        {[...Array(4)].map((_, i) => (
          <SkeletonBlock key={i} width={120} height={180} borderRadius={RADIUS.lg} />
        ))}
      </View>
      <View style={styles.header}>
        <SkeletonBlock width={140} height={20} />
      </View>
      <View style={styles.row}>
        {[...Array(3)].map((_, i) => (
          <View key={i} style={styles.listItem}>
            <SkeletonBlock width={40} height={40} borderRadius={20} />
            <SkeletonBlock width={120} height={16} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.lg, gap: SPACING.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: { flexDirection: 'row', gap: SPACING.md },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
});
