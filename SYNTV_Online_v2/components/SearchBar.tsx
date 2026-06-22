import React, { useState, useCallback, useRef } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  debounceMs?: number;
}

export default function SearchBar({
  value, onChangeText, placeholder = 'Search...', onSubmit, debounceMs = 300,
}: Props) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = useCallback((text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChangeText(text), debounceMs);
  }, [onChangeText, debounceMs]);

  return (
    <View className="flex-row items-center px-5 py-2 gap-2.5">
      <View className="flex-1 flex-row items-center bg-[#101827] rounded-2xl border border-white/10 px-3 h-11">
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          className="flex-1 text-[#F8FAFC] text-sm ml-2 h-11"
          defaultValue={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
