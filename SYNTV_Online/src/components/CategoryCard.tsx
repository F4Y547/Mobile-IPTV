import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Category } from '../types';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../theme';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

export default function CategoryCard({ category, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[category.gradient[0], category.gradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconCircle}>
          <Ionicons name={category.icon as any} size={24} color="#fff" />
        </View>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.count}>{category.channelCount} channels</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 110,
    height: 120,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.md,
    ...SHADOWS.small,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  name: {
    color: '#fff',
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  count: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
});
