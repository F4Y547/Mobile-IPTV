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

export default function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { signUp, isLoading, clearError } = useAuthStore();

  const handleSignup = async () => {
    clearError();
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPw) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    try {
      await signUp(email, password, name);
    } catch (err: any) {
      Alert.alert('Signup Failed', err.message || 'Could not create account');
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#050816', '#0A0F2C', '#050816']} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <View className="pt-10 pb-3 items-center">
            <AppLogo size="lg" showTagline={false} />
          </View>

          <View className="mx-6 bg-[rgba(16,24,39,0.85)] rounded-2xl border border-white/10 p-6 shadow-lg">
            <Text className="text-[#F8FAFC] text-3xl font-extrabold text-center">Create Account</Text>
            <Text className="text-[#94A3B8] text-sm text-center mt-1.5 mb-5">Start your premium IPTV experience</Text>

            {(['Full Name', 'Email', 'Password', 'Confirm Password'] as const).map((field, i) => {
              const vals = [name, email, password, confirmPw];
              const setVals = [setName, setEmail, setPassword, setConfirmPw];
              const icons = ['person-outline', 'mail-outline', 'lock-closed-outline', 'lock-closed-outline'];
              const isPw = i >= 2;
              return (
                <View key={field} className="mb-3.5">
                  <Text className="text-[#94A3B8] text-xs font-medium mb-1.5">{field}</Text>
                  <View className="flex-row items-center bg-[#101827] rounded-xl border border-white/10 px-3.5 gap-2.5 h-[50px]">
                    <Ionicons name={icons[i] as any} size={18} color="#94A3B8" />
                    <TextInput
                      className="flex-1 text-[#F8FAFC] text-sm h-full"
                      value={vals[i]}
                      onChangeText={setVals[i]}
                      placeholder={isPw ? '••••••••' : field === 'Email' ? 'you@email.com' : 'John Doe'}
                      placeholderTextColor="#64748B"
                      secureTextEntry={isPw && !(i === 2 && showPw)}
                      keyboardType={i === 1 ? 'email-address' : 'default'}
                      autoCapitalize={i === 0 ? 'words' : 'none'}
                    />
                    {isPw && i === 2 && (
                      <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                        <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}

            <TouchableOpacity className="rounded-xl overflow-hidden mt-2" onPress={handleSignup} disabled={isLoading}>
              <LinearGradient colors={['#00AEEF', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="py-4 items-center">
                <Text className="text-white font-bold text-base">{isLoading ? 'Creating Account...' : 'Create Account'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-5 gap-1">
              <Text className="text-[#94A3B8] text-sm">Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text className="text-[#00AEEF] text-sm font-bold"> Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
