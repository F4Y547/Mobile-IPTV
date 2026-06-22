import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  isFavorite: boolean;
  onToggle: () => void;
  size?: number;
}

export default function FavoriteButton({ isFavorite, onToggle, size = 22 }: Props) {
  return (
    <TouchableOpacity onPress={onToggle} className="p-1.5" activeOpacity={0.7}>
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={size}
        color={isFavorite ? '#EF4444' : '#94A3B8'}
      />
      {isFavorite && <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#EF4444] opacity-60" />}
    </TouchableOpacity>
  );
}
