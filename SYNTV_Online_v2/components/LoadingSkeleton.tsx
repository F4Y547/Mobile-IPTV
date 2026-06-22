import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

interface SkeletonBlockProps {
  className?: string;
  style?: any;
}

function SkeletonBlock({ className = '', style }: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      className={`bg-[#101827] rounded-lg ${className}`}
      style={[{ opacity }, style]}
    />
  );
}

export function ChannelSkeleton() {
  return (
    <View className="w-40 h-44 rounded-2xl bg-[#101827] mr-4 overflow-hidden">
      <View className="p-4 h-full justify-between">
        <View className="flex-row justify-between">
          <SkeletonBlock className="w-10 h-4 rounded" />
          <SkeletonBlock className="w-5 h-5 rounded-full" />
        </View>
        <View className="items-center">
          <SkeletonBlock className="w-12 h-12 rounded-full" />
        </View>
        <View className="gap-1">
          <SkeletonBlock className="w-3/4 h-3" />
          <SkeletonBlock className="w-1/2 h-2.5" />
        </View>
      </View>
    </View>
  );
}

export function MovieSkeleton() {
  return (
    <View className="w-[140px] h-[210px] rounded-2xl bg-[#101827] mr-4 overflow-hidden">
      <View className="p-3 h-full justify-end">
        <SkeletonBlock className="w-3/4 h-3 mb-1" />
        <SkeletonBlock className="w-1/2 h-2.5" />
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View className="gap-2 px-5">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className="flex-row items-center bg-[#101827] rounded-xl p-4 gap-3">
          <SkeletonBlock className="w-10 h-10 rounded-full" />
          <View className="flex-1 gap-1.5">
            <SkeletonBlock className="w-2/3 h-3" />
            <SkeletonBlock className="w-1/3 h-2.5" />
          </View>
          <SkeletonBlock className="w-7 h-7 rounded-full" />
        </View>
      ))}
    </View>
  );
}

export function HomeSkeleton() {
  return (
    <View className="flex-1 bg-[#050816] p-5 gap-5">
      <View className="gap-1">
        <SkeletonBlock className="w-24 h-3" />
        <SkeletonBlock className="w-36 h-6" />
      </View>
      <SkeletonBlock className="w-full h-11 rounded-2xl" />
      <SkeletonBlock className="w-full h-24 rounded-2xl" />
      <View className="gap-3">
        <View className="flex-row justify-between">
          <SkeletonBlock className="w-28 h-5" />
          <SkeletonBlock className="w-14 h-4" />
        </View>
        <View className="flex-row">
          {Array.from({ length: 4 }).map((_, i) => (
            <ChannelSkeleton key={i} />
          ))}
        </View>
      </View>
    </View>
  );
}

export default SkeletonBlock;
