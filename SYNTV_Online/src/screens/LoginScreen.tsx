import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../theme';
import AppLogo from '../components/AppLogo';

interface LoginScreenProps {
  navigation: any;
  onLoginSuccess?: () => void;
}

export default function LoginScreen({ navigation, onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    onLoginSuccess?.();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#050816', '#0A0F2C', '#050816']} style={styles.bg}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.topSection}>
            <AppLogo size="large" />
          </View>

          <View style={styles.card}>
            <Text style={styles.welcome}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue watching</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@email.com"
                  placeholderTextColor={COLORS.textDim}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textDim}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
              <LinearGradient colors={[COLORS.primary, COLORS.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBtn}>
                <Text style={styles.loginText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
              <Ionicons name="logo-google" size={20} color={COLORS.textWhite} />
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text style={styles.noAccount}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}> Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>Premium Legal IPTV Player · v1.0</Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  topSection: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  card: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.xxl,
    ...SHADOWS.large,
  },
  welcome: {
    color: COLORS.textWhite,
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  field: { marginBottom: 16 },
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
  forgotBtn: { alignItems: 'flex-end', marginTop: 4, marginBottom: 20 },
  forgotText: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  loginBtn: { borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: 12 },
  gradientBtn: { paddingVertical: 16, alignItems: 'center' },
  loginText: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '700' },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 20,
  },
  googleText: { color: COLORS.textWhite, fontWeight: '600', fontSize: FONT_SIZES.md },
  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  noAccount: { color: COLORS.textMuted, fontSize: FONT_SIZES.md },
  signupLink: { color: COLORS.primary, fontSize: FONT_SIZES.md, fontWeight: '700' },
  footer: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    paddingVertical: 30,
  },
});
