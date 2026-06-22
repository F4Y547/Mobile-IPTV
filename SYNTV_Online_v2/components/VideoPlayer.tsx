import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Video, { VideoRef } from 'react-native-video';
import { usePlayerStore } from '../store/playerStore';

interface Props {
  streamUrl: string;
  channelName?: string;
  channelLogo?: string;
  onNext?: () => void;
  onPrev?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VideoPlayer({ streamUrl, channelName, onNext, onPrev }: Props) {
  const videoRef = useRef<VideoRef>(null);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);
  const {
    isPlaying, isFullscreen, isMuted, isLoading, hasError, errorMessage,
    play, pause, togglePlay, setFullscreen, toggleFullscreen, setMuted,
    setLoading, setError, clearError, reset,
  } = usePlayerStore();

  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    return () => reset();
  }, [streamUrl]);

  const showControlsForAWhile = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  const handleLoad = () => {
    setLoading(false);
    play();
  };

  const handleError = () => {
    setLoading(false);
    setError('Stream currently unavailable. Please check your playlist source.');
  };

  const handleRetry = () => {
    clearError();
    setLoading(true);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={showControlsForAWhile}
      className={isFullscreen ? 'flex-1 bg-black' : 'h-[280px]'}
    >
      <StatusBar hidden={isFullscreen} />

      <Video
        ref={videoRef}
        source={{ uri: streamUrl }}
        style={{ flex: 1 }}
        paused={!isPlaying}
        muted={isMuted}
        resizeMode="contain"
        onLoad={handleLoad}
        onError={handleError}
        onBuffer={({ isBuffering }) => setLoading(isBuffering)}
        repeat
      />

      {/* Loading overlay */}
      {isLoading && (
        <View className="absolute inset-0 items-center justify-center bg-black/60">
          <View className="w-12 h-12 rounded-full border-3 border-[#00AEEF] border-t-transparent" style={{ borderWidth: 3 }} />
          <Text className="text-[#94A3B8] text-sm mt-3">Loading stream...</Text>
        </View>
      )}

      {/* Error overlay */}
      {hasError && (
        <View className="absolute inset-0 items-center justify-center bg-black/80 px-8">
          <View className="w-20 h-20 rounded-full bg-red-500/10 items-center justify-center mb-4">
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
          </View>
          <Text className="text-white text-lg font-bold text-center">{errorMessage || 'Stream Currently Unavailable'}</Text>
          <Text className="text-[#94A3B8] text-sm text-center mt-2 px-4">
            The stream may be offline or the playlist may need to be refreshed.
          </Text>
          <TouchableOpacity
            className="flex-row items-center bg-[#00AEEF] px-6 py-3 rounded-full mt-5"
            onPress={handleRetry}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text className="text-white font-bold ml-2">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Controls overlay */}
      {showControls && !hasError && (
        <View className="absolute inset-0 justify-end">
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} className="flex-1 justify-between px-4 py-6">
            {/* Top controls */}
            <View className="flex-row items-center pt-10 gap-3">
              {isFullscreen && (
                <TouchableOpacity onPress={toggleFullscreen}>
                  <Ionicons name="chevron-down" size={28} color="#fff" />
                </TouchableOpacity>
              )}
              {channelName && (
                <View className="flex-row items-center flex-1 gap-2.5">
                  <Text className="text-white font-bold text-base" numberOfLines={1}>{channelName}</Text>
                </View>
              )}
            </View>

            {/* Center controls */}
            <View className="flex-row items-center justify-center gap-10">
              {onPrev && (
                <TouchableOpacity onPress={onPrev}>
                  <Ionicons name="play-skip-back" size={26} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="w-14 h-14 rounded-full bg-[#00AEEF] items-center justify-center"
                onPress={togglePlay}
              >
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#fff" style={{ marginLeft: isPlaying ? 0 : 3 }} />
              </TouchableOpacity>
              {onNext && (
                <TouchableOpacity onPress={onNext}>
                  <Ionicons name="play-skip-forward" size={26} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            {/* Bottom controls */}
            <View className="flex-row items-center gap-4 pb-2">
              <TouchableOpacity onPress={() => setMuted(!isMuted)}>
                <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={22} color="#fff" />
              </TouchableOpacity>
              <View className="flex-1 h-1 bg-white/20 rounded-full">
                <View className="w-[35%] h-full bg-[#00AEEF] rounded-full" />
              </View>
              <TouchableOpacity onPress={toggleFullscreen}>
                <Ionicons name={isFullscreen ? 'contract' : 'expand'} size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}
    </TouchableOpacity>
  );
}
