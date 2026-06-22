import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    setTimeout(onFinish, 2500);
  }, []);

  return (
    <LinearGradient colors={['#050816', '#0A0F2C', '#050816']} className="flex-1 items-center justify-center">
      <Animated.View className="items-center" style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <Animated.View
          className="absolute w-40 h-40 rounded-full border-2 border-[#00AEEF]/30"
          style={{ transform: [{ scale: pulseAnim }] }}
        />
        <View className="w-[100px] h-[100px] rounded-full bg-[#00AEEF]/10 items-center justify-center mb-4">
          <Ionicons name="play-circle" size={56} color="#00AEEF" />
        </View>
        <Text className="text-[#F8FAFC] text-5xl font-black tracking-wider">
          SY<Text className="text-[#00AEEF]">N</Text>TV
        </Text>
        <View className="flex-row items-center mt-1 gap-3">
          <View className="w-10 h-[1px] bg-[#00AEEF]/50" />
          <Text className="text-[#00AEEF] text-xs font-bold tracking-[3px]">ONLINE</Text>
          <View className="w-10 h-[1px] bg-[#00AEEF]/50" />
        </View>
      </Animated.View>

      <Text className="text-[#94A3B8] text-base tracking-wider mt-8">
        Premium Legal IPTV Player
      </Text>

      <View className="absolute bottom-8 items-center gap-2">
        <View className="w-[120px] h-[3px] bg-[#101827] rounded-full overflow-hidden">
          <View className="w-[35%] h-full bg-[#00AEEF] rounded-full" />
        </View>
        <Text className="text-[#64748B] text-xs">Loading...</Text>
        <Text className="text-[#64748B] text-[10px]">Developed by Mohammed Faysal</Text>
      </View>
    </LinearGradient>
  );
}
