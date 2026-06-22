import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import LiveTVScreen from '../screens/LiveTVScreen';
import TVGuideScreen from '../screens/TVGuideScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddPlaylistScreen from '../screens/AddPlaylistScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import MoviesScreen from '../screens/MoviesScreen';
import SeriesScreen from '../screens/SeriesScreen';
import SearchScreen from '../screens/SearchScreen';
import MovieDetailScreen from '../screens/MovieDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

interface AppNavigatorProps {
  onLogout?: () => void;
}

function MainTabs({ onLogout }: { onLogout?: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(16,24,39,0.98)',
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 10,
          paddingTop: 6,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textDim,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const iconMap: { [key: string]: string } = {
            Home: focused ? 'home' : 'home-outline',
            LiveTV: focused ? 'tv' : 'tv-outline',
            Guide: focused ? 'calendar' : 'calendar-outline',
            Favorites: focused ? 'heart' : 'heart-outline',
            Settings: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={iconMap[route.name] as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="LiveTV" component={LiveTVScreen} options={{ tabBarLabel: 'Live TV' }} />
      <Tab.Screen name="Guide" component={TVGuideScreen} options={{ tabBarLabel: 'Guide' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Settings">
        {(props: any) => <SettingsScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator({ onLogout }: AppNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="AddPlaylist" component={AddPlaylistScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
      <Stack.Screen name="Movies" component={MoviesScreen} />
      <Stack.Screen name="Series" component={SeriesScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
    </Stack.Navigator>
  );
}
