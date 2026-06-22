import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export default function AppLogo({ size = 'md', showTagline = true }: Props) {
  const iconS = size === 'lg' ? 40 : size === 'md' ? 28 : 20;
  const textS = size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-lg';

  return (
    <View className="items-center">
      <View className="flex-row items-center">
        <View className="items-center justify-center mr-1.5" style={{ width: iconS + 16, height: iconS + 16 }}>
          <Ionicons name="play-circle" size={iconS} color="#00AEEF" />
          <View className="absolute w-full h-full rounded-full bg-[#00AEEF] opacity-15" />
        </View>
        <Text className={`${textS} text-[#F8FAFC] font-black tracking-wider`}>
          SY<Text className="text-[#00AEEF]">N</Text>TV
        </Text>
      </View>
      {showTagline && (
        <Text className="text-[#94A3B8] text-xs tracking-wider mt-1">
          Premium Legal IPTV Player
        </Text>
      )}
    </View>
  );
}
