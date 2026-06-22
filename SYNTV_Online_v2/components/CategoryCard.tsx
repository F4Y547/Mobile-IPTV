import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CategoryDef } from '../constants/categories';

interface Props {
  category: CategoryDef;
  channelCount?: number;
  onPress: () => void;
}

export default function CategoryCard({ category, channelCount, onPress }: Props) {
  return (
    <TouchableOpacity className="w-[110px] h-[120px] mr-4 overflow-hidden" onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[category.gradient[0], category.gradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 rounded-xl items-center justify-center px-3"
      >
        <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center mb-2">
          <Ionicons name={category.icon as any} size={24} color="#fff" />
        </View>
        <Text className="text-white text-sm font-bold text-center">{category.name}</Text>
        {channelCount !== undefined && (
          <Text className="text-white/70 text-[10px] mt-0.5">{channelCount} channels</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
