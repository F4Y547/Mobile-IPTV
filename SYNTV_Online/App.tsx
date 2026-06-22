import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp, initialAppState } from './src/context/AppContext';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import AppNavigator from './src/navigation/AppNavigator';

const Stack = createNativeStackNavigator();

const navigationTheme = {
  dark: true,
  colors: {
    primary: '#00AEEF' as const,
    background: '#050816' as const,
    card: '#101827' as const,
    text: '#F8FAFC' as const,
    border: '#1E293B' as const,
    notification: '#00AEEF' as const,
  },
  fonts: {
    regular: { fontFamily: 'System' as const, fontWeight: '400' as const },
    medium: { fontFamily: 'System' as const, fontWeight: '500' as const },
    bold: { fontFamily: 'System' as const, fontWeight: '700' as const },
    heavy: { fontFamily: 'System' as const, fontWeight: '900' as const },
  },
};

function AuthStack({ onLogin }: { onLogin: () => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLoginSuccess={onLogin} />}
      </Stack.Screen>
      <Stack.Screen name="Signup">
        {(props) => <SignupScreen {...props} onSignupSuccess={onLogin} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function MainApp({ onLogout }: { onLogout: () => void }) {
  return <AppNavigator onLogout={onLogout} />;
}

function AppContent() {
  const { state, dispatch } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  if (showSplash) {
    return (
      <>
        <StatusBar style="light" hidden />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </>
    );
  }

  if (showOnboarding) {
    return (
      <>
        <StatusBar style="light" />
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
      </>
    );
  }

  if (!state.isLoggedIn) {
    return (
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="light" />
        <AuthStack
          onLogin={() => dispatch({ type: 'SET_USER', payload: { id: '1', name: 'Mohammed Faysal', email: 'faysal@email.com' } })}
        />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="light" />
      <MainApp onLogout={() => dispatch({ type: 'LOGOUT' })} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
