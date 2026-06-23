import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { isOnboardingDone } from '../lib/storage';
import { isSupabaseConfigured, supabaseConfigError } from '../lib/supabase';
import { ErrorBoundary } from '../components/ErrorBoundary';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import BottomTabs from '../components/BottomTabs';
import AddPlaylistScreen from '../screens/AddPlaylistScreen';
import PlayerScreen from '../screens/PlayerScreen';
import SearchScreen from '../screens/SearchScreen';

const Stack = createNativeStackNavigator();

const navTheme = {
  dark: true,
  colors: {
    primary: '#00AEEF',
    background: '#050816',
    card: '#101827',
    text: '#F8FAFC',
    border: '#1E293B',
    notification: '#00AEEF',
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '900' as const },
  },
};

function FullScreenMessage({
  title,
  message,
  showSpinner = false,
}: {
  title: string;
  message: string;
  showSpinner?: boolean;
}) {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#050816' }}>
      <StatusBar style="light" />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          backgroundColor: '#050816',
        }}
      >
        {showSpinner && <ActivityIndicator size="large" color="#00AEEF" style={{ marginBottom: 20 }} />}
        <Text style={{ color: '#F8FAFC', fontSize: 22, fontWeight: '800', textAlign: 'center' }}>
          {title}
        </Text>
        <Text style={{ color: '#94A3B8', fontSize: 14, marginTop: 12, textAlign: 'center', lineHeight: 22 }}>
          {message}
        </Text>
      </View>
    </GestureHandlerRootView>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Main" component={BottomTabs} />
      <Stack.Screen name="AddPlaylist" component={AddPlaylistScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [appState, setAppState] = useState<'splash' | 'onboarding' | 'app'>('splash');
  const [startupTimeout, setStartupTimeout] = useState(false);
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    const startupTimer = setTimeout(() => setStartupTimeout(true), 8000);

    async function bootstrap() {
      try {
        await Promise.race([
          initialize(),
          new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Auth init timed out')), 7000)),
        ]);
      } catch (error) {
        console.warn('App bootstrap warning:', error);
      }

      try {
        const done = await isOnboardingDone();
        if (done) setAppState('app');
      } catch (error) {
        console.warn('Onboarding check failed:', error);
      }
    }

    bootstrap();
    return () => clearTimeout(startupTimer);
  }, [initialize]);

  if (appState === 'splash') {
    return (
      <>
        <StatusBar style="light" hidden />
        <SplashScreen onFinish={() => setAppState('onboarding')} />
      </>
    );
  }

  if (appState === 'onboarding') {
    return (
      <>
        <StatusBar style="light" />
        <OnboardingScreen onComplete={() => setAppState('app')} />
      </>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <ErrorBoundary>
        <FullScreenMessage
          title="SYNTV Online setup required"
          message={supabaseConfigError}
        />
      </ErrorBoundary>
    );
  }

  if (isLoading && !startupTimeout) {
    return (
      <FullScreenMessage
        title="Loading SYNTV Online"
        message="Preparing your IPTV workspace..."
        showSpinner
      />
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#050816' }}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <NavigationContainer theme={navTheme}>
            {isAuthenticated ? <MainStack /> : <AuthStack />}
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
