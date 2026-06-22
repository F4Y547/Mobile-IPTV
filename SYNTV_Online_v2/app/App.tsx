import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { isOnboardingDone } from '../lib/storage';

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
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
    isOnboardingDone().then((done) => {
      if (done) setAppState('app');
    });
  }, []);

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

  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#050816' }}>
        <StatusBar style="light" />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer theme={navTheme}>
          {isAuthenticated ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
