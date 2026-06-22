import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useFavoriteStore } from '../store/favoriteStore';
import { addRecentChannel, saveWatchHistory } from '../lib/storage';
import VideoPlayer from '../components/VideoPlayer';
import FavoriteButton from '../components/FavoriteButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  navigation: any;
  route: any;
}

export default function PlayerScreen({ navigation, route }: Props) {
  const { channel } = route.params;
  const { profile } = useAuthStore();
  const { channels } = usePlaylistStore();
  const { isChannelFavorite, toggleChannelFavorite } = useFavoriteStore();
  const { currentProgram, nextProgram } = usePlayerStore();

  const currentIndex = channels.findIndex((c) => c.name === channel.name);
  const nextChannel = currentIndex >= 0 && currentIndex < channels.length - 1 ? channels[currentIndex + 1] : null;
  const prevChannel = currentIndex > 0 ? channels[currentIndex - 1] : null;
  const relatedChannels = channels.filter((c) => c.category === channel.category && c.name !== channel.name).slice(0, 5);
  const isFav = isChannelFavorite(channel.name);

  useEffect(() => {
    const uid = profile?.user_id || profile?.id;
    if (uid) {
      saveWatchHistory({
        user_id: uid,
        content_id: channel.name,
        content_type: 'channel',
        title: channel.name,
        thumbnail: channel.tvgLogo || undefined,
        last_watched: new Date().toISOString(),
      });
      addRecentChannel(channel.name);
    }
  }, [channel.name, uid]);

  const switchChannel = (ch: any) => {
    navigation.replace('Player', { channel: ch });
  };

  return (
    <View className="flex-1 bg-[#050816]">
      {/* Video Player */}
      <VideoPlayer
        streamUrl={channel.streamUrl}
        channelName={channel.name}
        onNext={nextChannel ? () => switchChannel(nextChannel) : undefined}
        onPrev={prevChannel ? () => switchChannel(prevChannel) : undefined}
      />

      {/* Info Section */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            {channel.tvgLogo && (
              <Image source={{ uri: channel.tvgLogo }} className="w-10 h-10 rounded-full" />
            )}
            <View className="flex-1">
              <Text className="text-[#F8FAFC] text-lg font-bold">{channel.name}</Text>
              <Text className="text-[#94A3B8] text-xs">{channel.category || 'Uncategorized'}</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <FavoriteButton isFavorite={isFav} onToggle={() => toggleChannelFavorite(
              {
                id: channel.name,
                playlist_id: '',
                name: channel.name,
                stream_url: channel.streamUrl,
                logo: channel.tvgLogo || '',
                category: channel.category,
                is_live: true,
              } as any,
              profile?.id || ''
            )} size={22} />
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* EPG Info */}
        {(currentProgram || nextProgram) && (
          <View className="mx-5 bg-[#101827] rounded-xl p-4 border border-white/10">
            {currentProgram && (
              <>
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="time" size={16} color="#00AEEF" />
                  <Text className="text-[#00AEEF] text-xs font-semibold">Now Playing</Text>
                </View>
                <Text className="text-[#F8FAFC] text-base font-bold">{currentProgram.title}</Text>
                <Text className="text-[#94A3B8] text-xs mt-1">
                  {new Date(currentProgram.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {' - '}
                  {new Date(currentProgram.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {currentProgram.description && (
                  <Text className="text-[#64748B] text-xs mt-2 line-clamp-2">{currentProgram.description}</Text>
                )}
              </>
            )}
            {nextProgram && (
              <View className="mt-3 pt-3 border-t border-white/10">
                <Text className="text-[#64748B] text-[10px] font-semibold uppercase tracking-wider">Up Next</Text>
                <Text className="text-[#F8FAFC] text-sm font-semibold mt-1">{nextProgram.title}</Text>
                <Text className="text-[#94A3B8] text-[10px]">
                  {new Date(nextProgram.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Related Channels */}
        {relatedChannels.length > 0 && (
          <View className="mt-5">
            <Text className="text-[#F8FAFC] text-base font-bold px-5 mb-3">Related Channels</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5">
              {relatedChannels.map((ch, i) => (
                <TouchableOpacity
                  key={i}
                  className="w-24 bg-[#101827] rounded-xl p-3 items-center mr-3 border border-white/10"
                  onPress={() => switchChannel(ch)}
                >
                  {ch.tvgLogo && <Image source={{ uri: ch.tvgLogo }} className="w-10 h-10 rounded-full" />}
                  <Text className="text-[#F8FAFC] text-[10px] font-semibold mt-2 text-center" numberOfLines={1}>{ch.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
