import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { markOnboardingDone } from '../lib/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  {
    title: 'Watch Your IPTV Anywhere',
    subtitle: 'Add your legal IPTV playlist and enjoy live TV on your phone.',
    icon: 'wifi',
  },
  {
    title: 'Live TV, Movies & Series',
    subtitle: 'Browse channels, VOD, and series in one premium mobile app.',
    icon: 'film',
  },
  {
    title: 'Smart TV Guide',
    subtitle: 'Follow live programs with EPG support and favorites.',
    icon: 'calendar',
  },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
  };

  const goNext = () => {
    if (index < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await markOnboardingDone();
    onComplete();
  };

  return (
    <LinearGradient colors={['#050816', '#0A0F2C', '#050816']} className="flex-1">
      <View className="pt-14 px-6 items-end">
        <TouchableOpacity onPress={handleComplete}>
          <Text className="text-[#94A3B8] text-base font-semibold">Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatRef}
        data={slides}
        renderItem={({ item }) => (
          <View style={{ width: SCREEN_WIDTH }} className="items-center justify-center px-8">
            <View className="w-40 h-40 rounded-full bg-[#00AEEF]/10 items-center justify-center mb-10">
              <View className="absolute w-[180px] h-[180px] rounded-full border border-[#00AEEF]/20" />
              <Ionicons name={item.icon as any} size={80} color="#00AEEF" />
            </View>
            <Text className="text-[#F8FAFC] text-4xl font-extrabold text-center mb-4">{item.title}</Text>
            <Text className="text-[#94A3B8] text-lg text-center leading-7">{item.subtitle}</Text>
          </View>
        )}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      <View className="px-8 pb-14 flex-row items-center justify-between">
        <View className="flex-row gap-2">
          {slides.map((_, i) => (
            <View
              key={i}
              className={`rounded-full ${i === index ? 'w-7 bg-[#00AEEF]' : 'w-2 bg-[#64748B]'}`}
              style={{ height: 8 }}
            />
          ))}
        </View>
        <TouchableOpacity
          className="flex-row items-center bg-[#00AEEF] px-6 py-3.5 rounded-full gap-2"
          onPress={goNext}
        >
          <Text className="text-white font-bold text-base">
            {index === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={index === slides.length - 1 ? 'checkmark' : 'arrow-forward'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
