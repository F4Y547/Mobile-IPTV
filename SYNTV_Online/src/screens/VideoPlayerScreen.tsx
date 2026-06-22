import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, Dimensions, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../theme';
import FavoriteButton from '../components/FavoriteButton';
import { epgData, liveChannels } from '../utils/mockData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoPlayerScreenProps {
  navigation: any;
  route: any;
}

export default function VideoPlayerScreen({ navigation, route }: VideoPlayerScreenProps) {
  const { channel } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);

  const currentProgram = epgData.find((epg) => epg.channelId === channel.id && epg.isLive);
  const nextProgram = epgData.find((epg) => epg.channelId === channel.id && !epg.isLive);
  const relatedChannels = liveChannels.filter((ch) => ch.category === channel.category && ch.id !== channel.id);

  useEffect(() => {
    showControlsForAWhile();
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  const showControlsForAWhile = () => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 4000);
  };

  const handlePlayPause = () => {
    if (hasError) {
      setHasError(false);
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsPlaying(true);
        setHasError(false);
      }, 1500);
    } else {
      setIsPlaying(!isPlaying);
    }
    showControlsForAWhile();
  };

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      <StatusBar hidden={isFullscreen} />

      {/* Video Area */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={showControlsForAWhile}
        style={[styles.videoArea, isFullscreen && styles.fullscreenVideo]}
      >
        <LinearGradient colors={['#000', '#0A0F2C', '#000']} style={styles.videoBg}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.spinner} />
              <Text style={styles.loadingText}>Loading stream...</Text>
            </View>
          )}

          {hasError ? (
            <View style={styles.errorOverlay}>
              <View style={styles.errorIconCircle}>
                <Ionicons name="alert-circle" size={48} color={COLORS.error} />
              </View>
              <Text style={styles.errorTitle}>Stream Currently Unavailable</Text>
              <Text style={styles.errorSub}>
                {channel.name} may be offline. {channel.isLive ? 'The broadcast may have ended.' : 'Check your playlist source.'}
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={handlePlayPause}>
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : isPlaying && !isFullscreen ? (
            <View style={styles.playingContent}>
              <Ionicons name="tv" size={48} color={COLORS.primary} />
              <Text style={styles.playingText}>Now Playing</Text>
              <Text style={styles.playingChannel}>{channel.name}</Text>
            </View>
          ) : !isPlaying ? (
            <View style={styles.pausedContent}>
              <View style={styles.channelLogoLarge}>
                <Image source={{ uri: channel.logo }} style={styles.channelLogoImg} />
              </View>
              <Text style={styles.channelNameLarge}>{channel.name}</Text>
              <TouchableOpacity style={styles.playBtnLarge} onPress={handlePlayPause}>
                <Ionicons name="play" size={32} color="#fff" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          ) : null}

          {isPlaying && isFullscreen && (
            <View style={styles.fullscreenPlaying}>
              <View style={styles.fsChannelInfo}>
                <Image source={{ uri: channel.logo }} style={styles.fsLogo} />
                <Text style={styles.fsChannelName}>{channel.name}</Text>
              </View>
              <View style={styles.fsCenter}>
                <Ionicons name="tv" size={64} color={COLORS.primary} />
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Controls Overlay */}
        {showControls && (
          <View style={[styles.controlsOverlay, isFullscreen && styles.fsControls]}>
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.controlsGradient}>
              <View style={styles.topControls}>
                {isFullscreen && (
                  <TouchableOpacity onPress={() => setIsFullscreen(false)}>
                    <Ionicons name="chevron-down" size={28} color="#fff" />
                  </TouchableOpacity>
                )}
                <View style={styles.topChannelInfo}>
                  <Image source={{ uri: channel.logo }} style={styles.topLogo} />
                  <View>
                    <Text style={styles.topChannelName}>{channel.name}</Text>
                    {currentProgram && (
                      <Text style={styles.topProgram}>{currentProgram.title}</Text>
                    )}
                  </View>
                </View>
                <FavoriteButton isFavorite={channel.isFavorite} onToggle={() => {}} size={22} />
              </View>

              <View style={styles.centerControls}>
                <TouchableOpacity onPress={() => {}}>
                  <Ionicons name="play-skip-back" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mainPlayBtn} onPress={handlePlayPause}>
                  <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#fff" style={{ marginLeft: isPlaying ? 0 : 4 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {}}>
                  <Ionicons name="play-skip-forward" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.bottomControls}>
                <TouchableOpacity onPress={() => setIsMuted(!isMuted)}>
                  <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={22} color="#fff" />
                </TouchableOpacity>
                <View style={styles.progressBar}>
                  <View style={styles.progressFill} />
                </View>
                <TouchableOpacity onPress={() => setIsFullscreen(!isFullscreen)}>
                  <Ionicons name={isFullscreen ? 'contract' : 'expand'} size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}
      </TouchableOpacity>

      {/* Info & Related - Only in portrait */}
      {!isFullscreen && (
        <ScrollView style={styles.infoSection} showsVerticalScrollIndicator={false}>
          {currentProgram && (
            <View style={styles.epgBox}>
              <View style={styles.epgHeader}>
                <Ionicons name="calendar" size={16} color={COLORS.primary} />
                <Text style={styles.epgTitle}>Current Program</Text>
              </View>
              <Text style={styles.epgProgramName}>{currentProgram.title}</Text>
              {currentProgram.description && (
                <Text style={styles.epgDesc}>{currentProgram.description}</Text>
              )}
              {nextProgram && (
                <View style={styles.nextProgram}>
                  <Text style={styles.nextLabel}>Up Next:</Text>
                  <Text style={styles.nextName}>{nextProgram.title}</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Related Channels</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedRow}>
            {relatedChannels.map((ch) => (
              <TouchableOpacity
                key={ch.id}
                style={styles.relatedCard}
                onPress={() => navigation.replace('VideoPlayer', { channel: ch })}
              >
                <Image source={{ uri: ch.logo }} style={styles.relatedLogo} />
                <Text style={styles.relatedName} numberOfLines={1}>{ch.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  fullscreenContainer: { backgroundColor: '#000' },
  videoArea: { height: 280 },
  fullscreenVideo: { flex: 1, height: SCREEN_HEIGHT },
  videoBg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingOverlay: { alignItems: 'center', gap: 12 },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderTopColor: 'transparent',
  },
  loadingText: { color: COLORS.textMuted, fontSize: FONT_SIZES.md },
  errorOverlay: { alignItems: 'center', padding: SPACING.xl, gap: 8 },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  errorTitle: { color: '#fff', fontSize: FONT_SIZES.xl, fontWeight: '700' },
  errorSub: { color: COLORS.textMuted, fontSize: FONT_SIZES.md, textAlign: 'center', paddingHorizontal: 20 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    gap: 8,
    marginTop: 12,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  playingContent: { alignItems: 'center', gap: 8 },
  playingText: { color: COLORS.success, fontSize: FONT_SIZES.lg, fontWeight: '700' },
  playingChannel: { color: COLORS.textWhite, fontSize: FONT_SIZES.xl, fontWeight: '800' },
  pausedContent: { alignItems: 'center', gap: 16 },
  channelLogoLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  channelLogoImg: { width: 56, height: 56, borderRadius: 28 },
  channelNameLarge: { color: '#fff', fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  playBtnLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenPlaying: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  fsChannelInfo: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fsLogo: { width: 40, height: 40, borderRadius: 20 },
  fsChannelName: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '700' },
  fsCenter: { alignItems: 'center' },
  controlsOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  fsControls: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  controlsGradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 40,
  },
  topChannelInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  topLogo: { width: 36, height: 36, borderRadius: 18 },
  topChannelName: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.md },
  topProgram: { color: COLORS.textMuted, fontSize: FONT_SIZES.xs },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  mainPlayBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 10,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  progressFill: {
    width: '35%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  infoSection: { flex: 1 },
  epgBox: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  epgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  epgTitle: { color: COLORS.primary, fontWeight: '600', fontSize: FONT_SIZES.sm },
  epgProgramName: { color: COLORS.textWhite, fontSize: FONT_SIZES.lg, fontWeight: '700' },
  epgDesc: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, marginTop: 4 },
  nextProgram: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
  },
  nextLabel: { color: COLORS.textDim, fontSize: FONT_SIZES.xs },
  nextName: { color: COLORS.textWhite, fontWeight: '600', fontSize: FONT_SIZES.md },
  sectionHeader: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionTitle: { color: COLORS.textWhite, fontSize: FONT_SIZES.xl, fontWeight: '700' },
  relatedRow: { paddingHorizontal: SPACING.lg, gap: SPACING.md },
  relatedCard: {
    width: 100,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  relatedLogo: { width: 44, height: 44, borderRadius: 22 },
  relatedName: { color: COLORS.textWhite, fontSize: FONT_SIZES.xs, fontWeight: '600', marginTop: 6, textAlign: 'center' },
});
