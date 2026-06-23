import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayerStore } from '../store/playerStore';

interface Props {
  streamUrl: string;
  channelName?: string;
  channelLogo?: string;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function VideoPlayer({ streamUrl, channelName, onNext, onPrev }: Props) {
  const videoRef = useRef<any>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    isPlaying, isMuted, isLoading, hasError, errorMessage,
    play, pause, togglePlay, setMuted, setLoading,
    setError, clearError, reset,
  } = usePlayerStore();

  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
      reset();
    };
  }, [streamUrl, reset]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      const playPromise = video.play?.();
      if (playPromise?.catch) playPromise.catch(() => pause());
    } else {
      video.pause?.();
    }
  }, [isPlaying, pause]);

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
    const video = videoRef.current;
    if (video) {
      video.load?.();
      video.play?.().catch?.(() => {});
    }
  };

  const progressPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={showControlsForAWhile}
      style={{ height: 280, backgroundColor: '#000', overflow: 'hidden' }}
    >
      <StatusBar hidden />

      {React.createElement('video' as any, {
        ref: videoRef,
        src: streamUrl,
        muted: isMuted,
        controls: false,
        playsInline: true,
        style: {
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
          objectFit: 'contain',
        },
        onCanPlay: handleLoad,
        onWaiting: () => setLoading(true),
        onPlaying: () => setLoading(false),
        onError: handleError,
        onTimeUpdate: (event: any) => setCurrentTime(event.currentTarget?.currentTime || 0),
        onLoadedMetadata: (event: any) => setDuration(event.currentTarget?.duration || 0),
      })}

      {isLoading && (
        <View style={{ position: 'absolute', inset: 0 as any, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: '#00AEEF' }} />
          <Text style={{ color: '#94A3B8', fontSize: 14, marginTop: 12 }}>Loading stream...</Text>
        </View>
      )}

      {hasError && (
        <View style={{ position: 'absolute', inset: 0 as any, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.82)', paddingHorizontal: 32 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
          </View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' }}>{errorMessage || 'Stream Currently Unavailable'}</Text>
          <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            The stream may be offline or the playlist may need to be refreshed.
          </Text>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#00AEEF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999, marginTop: 20 }}
            onPress={handleRetry}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 8 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {showControls && !hasError && (
        <View style={{ position: 'absolute', inset: 0 as any, justifyContent: 'flex-end' }}>
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.86)']} style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 40, gap: 12 }}>
              {channelName && (
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, flex: 1 }} numberOfLines={1}>{channelName}</Text>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
              {onPrev && (
                <TouchableOpacity onPress={onPrev}>
                  <Ionicons name="play-skip-back" size={26} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#00AEEF', alignItems: 'center', justifyContent: 'center' }}
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

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingBottom: 8 }}>
              <TouchableOpacity onPress={() => setMuted(!isMuted)}>
                <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={22} color="#fff" />
              </TouchableOpacity>
              <View style={{ flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999 }}>
                <View style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#00AEEF', borderRadius: 999 }} />
              </View>
            </View>
          </LinearGradient>
        </View>
      )}
    </TouchableOpacity>
  );
}
