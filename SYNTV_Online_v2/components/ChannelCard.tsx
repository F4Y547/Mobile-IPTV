import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Channel } from '../types';
import FavoriteButton from './FavoriteButton';

interface Props {
  channel: Channel;
  onPress: () => void;
  onToggleFavorite: () => void;
  variant?: 'grid' | 'list';
}

export default function ChannelCard({ channel, onPress, onToggleFavorite, variant = 'grid' }: Props) {
  if (variant === 'list') {
    return (
      <TouchableOpacity
        className="flex-row items-center bg-[#101827] rounded-xl px-4 py-3 mx-5 my-1 border border-white/10"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image source={{ uri: channel.logo }} className="w-10 h-10 rounded-full" />
        <View className="flex-1 ml-3">
          <Text className="text-[#F8FAFC] text-sm font-semibold" numberOfLines={1}>{channel.name}</Text>
          <Text className="text-[#94A3B8] text-xs">{channel.category || 'Uncategorized'}</Text>
        </View>
        {channel.is_live && (
          <View className="flex-row items-center bg-red-500/15 px-2 py-1 rounded mr-2">
            <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" />
            <Text className="text-red-500 text-[9px] font-bold">LIVE</Text>
          </View>
        )}
        <FavoriteButton isFavorite={channel.is_favorite} onToggle={onToggleFavorite} size={18} />
        <Ionicons name="play-circle" size={28} color="#00AEEF" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity className="w-40 mr-4" onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={['#101827', '#1A2744']} className="rounded-2xl p-4 h-44 justify-between">
        <View className="flex-row justify-between items-center">
          {channel.is_live && (
            <View className="flex-row items-center bg-red-500 px-2 py-0.5 rounded">
              <View className="w-1.5 h-1.5 rounded-full bg-white mr-1" />
              <Text className="text-white text-[9px] font-bold">LIVE</Text>
            </View>
          )}
          <FavoriteButton isFavorite={channel.is_favorite} onToggle={onToggleFavorite} size={18} />
        </View>
        <View className="items-center justify-center flex-1">
          <Image source={{ uri: channel.logo }} className="w-12 h-12 rounded-full" />
        </View>
        <Text className="text-[#F8FAFC] text-xs font-semibold mt-1" numberOfLines={1}>{channel.name}</Text>
        <Text className="text-[#94A3B8] text-[10px]">{channel.category || 'Uncategorized'}</Text>
        <View className="absolute right-2 bottom-2 w-7 h-7 rounded-full bg-[#00AEEF] items-center justify-center opacity-90">
          <Ionicons name="play" size={14} color="#fff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
