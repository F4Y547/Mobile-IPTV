import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppLogo from '../components/AppLogo';
import { useAuthStore } from '../store/authStore';

interface Props {
  navigation: any;
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { signIn, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    clearError();
    try {
      await signIn(email, password);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#050816', '#0A0F2C', '#050816']} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <View className="pt-14 pb-5 items-center">
            <AppLogo size="lg" />
          </View>

          <View className="mx-6 bg-[rgba(16,24,39,0.85)] rounded-2xl border border-white/10 p-6 shadow-lg">
            <Text className="text-[#F8FAFC] text-3xl font-extrabold text-center">Welcome Back</Text>
            <Text className="text-[#94A3B8] text-sm text-center mt-1.5 mb-6">Sign in to continue watching</Text>

            <View className="mb-4">
              <Text className="text-[#94A3B8] text-xs font-medium mb-1.5">Email</Text>
              <View className="flex-row items-center bg-[#101827] rounded-xl border border-white/10 px-3.5 gap-2.5 h-[50px]">
                <Ionicons name="mail-outline" size={18} color="#94A3B8" />
                <TextInput
                  className="flex-1 text-[#F8FAFC] text-sm h-full"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@email.com"
                  placeholderTextColor="#64748B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View className="mb-2">
              <Text className="text-[#94A3B8] text-xs font-medium mb-1.5">Password</Text>
              <View className="flex-row items-center bg-[#101827] rounded-xl border border-white/10 px-3.5 gap-2.5 h-[50px]">
                <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />
                <TextInput
                  className="flex-1 text-[#F8FAFC] text-sm h-full"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#64748B"
                  secureTextEntry={!showPw}
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity className="items-end mt-1 mb-5">
              <Text className="text-[#00AEEF] text-xs font-semibold">Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity className="rounded-xl overflow-hidden mb-3" onPress={handleLogin} disabled={isLoading}>
              <LinearGradient colors={['#00AEEF', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="py-4 items-center">
                <Text className="text-white font-bold text-base">{isLoading ? 'Signing in...' : 'Sign In'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-center bg-[#101827] rounded-xl border border-white/10 py-3.5 gap-2.5 mb-5">
              <Ionicons name="logo-google" size={20} color="#F8FAFC" />
              <Text className="text-[#F8FAFC] font-semibold text-sm">Continue with Google</Text>
            </TouchableOpacity>

            <View className="flex-row justify-center gap-1">
              <Text className="text-[#94A3B8] text-sm">Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text className="text-[#00AEEF] text-sm font-bold"> Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-[#64748B] text-xs text-center py-8">Premium Legal IPTV Player · v2.0</Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
