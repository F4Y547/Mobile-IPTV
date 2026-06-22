import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../theme';
import SearchBar from '../components/SearchBar';
import ChannelCard from '../components/ChannelCard';
import CategoryCard from '../components/CategoryCard';
import MovieCard from '../components/MovieCard';
import SubscriptionCard from '../components/SubscriptionCard';
import AnnouncementBanner from '../components/AnnouncementBanner';
import { categories, liveChannels, movies, continueWatching } from '../utils/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const greeting = (() => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 18) return 'Good Afternoon';
    return 'Good Evening';
  })();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#0A0F2C', '#050816']} style={styles.headerGrad}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.userName}>Mohammed Faysal</Text>
            </View>
            <TouchableOpacity style={styles.avatarBtn}>
              <Ionicons name="person-circle" size={44} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder="Search channels, movies, series..."
            onFilterPress={() => navigation.navigate('Search')}
          />
        </LinearGradient>

        <SubscriptionCard plan="Premium" status="active" expiresAt="Dec 31, 2026" onUpgrade={() => {}} />

        <AnnouncementBanner
          title="New Channels Added!"
          description="50+ new legal IPTV channels now available"
          onPress={() => {}}
          onDismiss={() => {}}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Add Playlist</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddPlaylist')}>
              <Text style={styles.seeAll}>Add Now</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addPlaylistCard} onPress={() => navigation.navigate('AddPlaylist')}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.addPlaylistGrad}>
              <View style={styles.addPlaylistContent}>
                <View style={styles.addIconCircle}>
                  <Ionicons name="add-circle" size={32} color="#fff" />
                </View>
                <View style={styles.addPlaylistText}>
                  <Text style={styles.addPlaylistTitle}>Add Your IPTV Playlist</Text>
                  <Text style={styles.addPlaylistDesc}>M3U or Xtream Codes supported</Text>
                </View>
                <Ionicons name="arrow-forward" size={24} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {continueWatching.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continue Watching</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {continueWatching.map((movie, i) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPress={() => {}}
                  onToggleFavorite={() => {}}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LiveTV')}>
              <Text style={styles.seeAll}>All Channels</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} onPress={() => {}} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Channels</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LiveTV')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {liveChannels.slice(0, 5).map((ch) => (
              <ChannelCard
                key={ch.id}
                channel={ch}
                onPress={() => navigation.navigate('VideoPlayer', { channel: ch })}
                onToggleFavorite={() => {}}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Movies</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Movies')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {movies.slice(0, 5).map((mv) => (
              <MovieCard
                key={mv.id}
                movie={mv}
                onPress={() => navigation.navigate('MovieDetail', { movie: mv })}
                onToggleFavorite={() => {}}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Added</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {[...movies].reverse().slice(0, 4).map((mv) => (
              <MovieCard
                key={mv.id}
                movie={mv}
                onPress={() => navigation.navigate('MovieDetail', { movie: mv })}
                onToggleFavorite={() => {}}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerGrad: { paddingTop: 50, paddingBottom: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.sm,
  },
  greeting: { color: COLORS.textMuted, fontSize: FONT_SIZES.md },
  userName: { color: COLORS.textWhite, fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  avatarBtn: { padding: 4 },
  section: { marginTop: SPACING.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionTitle: { color: COLORS.textWhite, fontSize: FONT_SIZES.xl, fontWeight: '700' },
  seeAll: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  carousel: { paddingLeft: SPACING.xl, paddingRight: SPACING.md },
  addPlaylistCard: { marginHorizontal: SPACING.xl, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.medium },
  addPlaylistGrad: { borderRadius: RADIUS.lg },
  addPlaylistContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: 14,
  },
  addIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlaylistText: { flex: 1 },
  addPlaylistTitle: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '700' },
  addPlaylistDesc: { color: 'rgba(255,255,255,0.7)', fontSize: FONT_SIZES.sm, marginTop: 2 },
  bottomPadding: { height: 100 },
});
