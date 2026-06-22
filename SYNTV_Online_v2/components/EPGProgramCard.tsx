import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  isLive?: boolean;
  onPress: () => void;
}

function formatTime(isoStr: string) {
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

export default function EPGProgramCard({ title, startTime, endTime, description, isLive, onPress }: Props) {
  return (
    <TouchableOpacity
      className={`flex-row rounded-xl mx-5 my-[3px] overflow-hidden border ${
        isLive ? 'border-[#00AEEF] bg-[#00AEEF]/10' : 'border-white/10 bg-[#101827]'
      }`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className={`w-[3px] ${isLive ? 'bg-[#00AEEF]' : 'bg-transparent'}`} />
      <View className="flex-1 p-3.5">
        <View className="flex-row items-center justify-between">
          <Text className={`text-sm font-semibold flex-1 ${isLive ? 'text-[#00AEEF]' : 'text-[#F8FAFC]'}`} numberOfLines={1}>
            {title}
          </Text>
          {isLive && (
            <View className="flex-row items-center bg-red-500 px-2 py-0.5 rounded ml-2">
              <View className="w-1.5 h-1.5 rounded-full bg-white mr-1" />
              <Text className="text-white text-[9px] font-bold">LIVE</Text>
            </View>
          )}
        </View>
        <Text className="text-[#94A3B8] text-xs mt-1">{formatTime(startTime)} - {formatTime(endTime)}</Text>
        {description && <Text className="text-[#64748B] text-xs mt-1.5 line-clamp-2" numberOfLines={2}>{description}</Text>}
      </View>
    </TouchableOpacity>
  );
}
