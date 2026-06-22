import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ icon = 'folder-open-outline', title, subtitle }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="w-[100px] h-[100px] rounded-full bg-[#101827] items-center justify-center mb-5">
        <Ionicons name={icon as any} size={48} color="#64748B" />
      </View>
      <Text className="text-[#94A3B8] text-xl font-semibold text-center">{title}</Text>
      {subtitle && <Text className="text-[#64748B] text-sm text-center mt-2">{subtitle}</Text>}
    </View>
  );
}
