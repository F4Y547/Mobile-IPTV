import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: number;
}

export default function FavoriteButton({ isFavorite, onToggle, size = 22 }: FavoriteButtonProps) {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.button} activeOpacity={0.7}>
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={size}
        color={isFavorite ? COLORS.error : COLORS.textMuted}
      />
      {isFavorite && <View style={styles.pulse} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 6,
    position: 'relative',
  },
  pulse: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    opacity: 0.6,
  },
});
