import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../theme';
import AppLogo from '../components/AppLogo';

interface SignupScreenProps {
  navigation: any;
  onSignupSuccess?: () => void;
}

export default function SignupScreen({ navigation, onSignupSuccess }: SignupScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    onSignupSuccess?.();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#050816', '#0A0F2C', '#050816']} style={styles.bg}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.topSection}>
            <AppLogo size="large" showTagline={false} />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your premium IPTV experience</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={COLORS.textMuted} />
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="John Doe" placeholderTextColor={COLORS.textDim} />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />
                <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@email.com" placeholderTextColor={COLORS.textDim} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />
                <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={COLORS.textDim} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />
                <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="••••••••" placeholderTextColor={COLORS.textDim} secureTextEntry />
              </View>
            </View>

            <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} activeOpacity={0.85}>
              <LinearGradient colors={[COLORS.primary, COLORS.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBtn}>
                <Text style={styles.signupText}>Create Account</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.hasAccount}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginLink}> Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  topSection: { paddingTop: 50, paddingBottom: 10, alignItems: 'center' },
  card: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.xxl,
    ...SHADOWS.large,
  },
  title: { color: COLORS.textWhite, fontSize: FONT_SIZES.xxxl, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: COLORS.textMuted, fontSize: FONT_SIZES.md, textAlign: 'center', marginTop: 6, marginBottom: 24 },
  field: { marginBottom: 14 },
  label: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, fontWeight: '500', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.md,
    gap: 10,
    height: 50,
  },
  input: { flex: 1, color: COLORS.textWhite, fontSize: FONT_SIZES.md, height: 50 },
  signupBtn: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: 8 },
  gradientBtn: { paddingVertical: 16, alignItems: 'center' },
  signupText: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  hasAccount: { color: COLORS.textMuted, fontSize: FONT_SIZES.md },
  loginLink: { color: COLORS.primary, fontSize: FONT_SIZES.md, fontWeight: '700' },
});
