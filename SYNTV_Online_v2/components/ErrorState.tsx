import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  message: string;
  onRetry?: () => void;
  icon?: string;
}

export default function ErrorState({ message, onRetry, icon = 'alert-circle-outline' }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="w-[90px] h-[90px] rounded-full bg-red-500/10 items-center justify-center mb-5">
        <Ionicons name={icon as any} size={44} color="#EF4444" />
      </View>
      <Text className="text-[#94A3B8] text-sm text-center leading-6 mb-5">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          className="flex-row items-center bg-[#EF4444] px-6 py-3 rounded-full gap-2"
          onPress={onRetry}
        >
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text className="text-white font-bold text-sm">Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
