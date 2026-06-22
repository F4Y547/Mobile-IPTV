import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Series } from '../types';
import FavoriteButton from './FavoriteButton';

interface Props {
  series: Series;
  onPress: () => void;
  onToggleFavorite: () => void;
  isFavorite?: boolean;
}

export default function SeriesCard({ series, onPress, onToggleFavorite, isFavorite = false }: Props) {
  return (
    <TouchableOpacity className="w-[140px] h-[210px] mr-4 rounded-2xl overflow-hidden" onPress={onPress} activeOpacity={0.85}>
      <Image
        source={{ uri: series.poster || 'https://via.placeholder.com/300x450/101827/7C3AED?text=Series' }}
        className="absolute w-full h-full"
      />
      <LinearGradient colors={['transparent', 'rgba(5,8,22,0.95)']} className="absolute bottom-0 left-0 right-0 h-1/2" />
      <View className="absolute top-2 left-2 right-2 flex-row justify-between">
        {series.rating && (
          <View className="flex-row items-center bg-black/60 px-1.5 py-0.5 rounded">
            <Ionicons name="star" size={10} color="#F59E0B" />
            <Text className="text-white text-[10px] font-bold ml-0.5">{series.rating}</Text>
          </View>
        )}
        <FavoriteButton isFavorite={isFavorite} onToggle={onToggleFavorite} size={18} />
      </View>
      <View className="absolute bottom-2 left-2 right-2">
        <Text className="text-[#F8FAFC] text-xs font-semibold" numberOfLines={2}>{series.title}</Text>
        <Text className="text-[#94A3B8] text-[10px] mt-0.5">
          {series.year || ''} {series.seasons ? `· ${series.seasons.length} Seasons` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
