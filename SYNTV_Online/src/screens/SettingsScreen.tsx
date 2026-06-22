import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../theme';
import AppLogo from '../components/AppLogo';

interface SettingsScreenProps {
  navigation: any;
  onLogout?: () => void;
}

interface SettingItemProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}

function SettingItem({ icon, label, subtitle, onPress, right, danger }: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingIcon, danger && { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
        <Ionicons name={icon as any} size={20} color={danger ? COLORS.error : COLORS.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, danger && { color: COLORS.error }]}>{label}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {right || (
        <Ionicons name="chevron-forward" size={18} color={COLORS.textDim} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation, onLogout }: SettingsScreenProps) {
  const [notifications, setNotifications] = React.useState(true);
  const [autoPlay, setAutoPlay] = React.useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => onLogout?.(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <LinearGradient
          colors={['rgba(0,174,239,0.1)', 'rgba(124,58,237,0.05)']}
          style={styles.profileCard}
        >
          <View style={styles.profileLeft}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.profileName}>Mohammed Faysal</Text>
              <Text style={styles.profileEmail}>faysal@email.com</Text>
              <View style={styles.planBadge}>
                <Ionicons name="diamond" size={12} color={COLORS.warning} />
                <Text style={styles.planText}>Premium Plan</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Settings Groups */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Account</Text>
          <View style={styles.groupCard}>
            <SettingItem icon="server" label="Manage Playlists" subtitle="2 playlists active" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingItem icon="diamond" label="Subscription Plan" subtitle="Premium · Expires Dec 2026" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingItem icon="lock-closed" label="Parental Control" subtitle="Set content restrictions" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Preferences</Text>
          <View style={styles.groupCard}>
            <SettingItem icon="color-palette" label="App Theme" subtitle="Dark Mode" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingItem icon="language" label="Language" subtitle="English" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingItem
              icon="notifications"
              label="Notifications"
              right={<Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: COLORS.textDim, true: COLORS.primary }} thumbColor="#fff" />}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="play"
              label="Auto-Play Videos"
              right={<Switch value={autoPlay} onValueChange={setAutoPlay} trackColor={{ false: COLORS.textDim, true: COLORS.primary }} thumbColor="#fff" />}
            />
          </View>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Support</Text>
          <View style={styles.groupCard}>
            <SettingItem icon="help-circle" label="Help & Support" subtitle="FAQ, contact us" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingItem icon="information-circle" label="Legal Disclaimer" subtitle="Usage terms" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingItem icon="shield-checkmark" label="Privacy Policy" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingItem icon="document-text" label="Terms of Service" onPress={() => {}} />
          </View>
        </View>

        {/* About */}
        <View style={styles.aboutSection}>
          <AppLogo size="small" />
          <Text style={styles.aboutText}>
            SYNTV Online is a premium legal IPTV player. Users are responsible for adding only authorized playlists.
          </Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.developer}>Developed by Mohammed Faysal</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xl, paddingTop: 55, paddingBottom: SPACING.md },
  headerTitle: { color: COLORS.textWhite, fontSize: FONT_SIZES.xxxl, fontWeight: '800' },
  profileCard: {
    marginHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0,174,239,0.15)',
    marginBottom: SPACING.lg,
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,174,239,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { color: COLORS.textWhite, fontSize: FONT_SIZES.lg, fontWeight: '700' },
  profileEmail: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginTop: 6,
    gap: 6,
  },
  planText: { color: COLORS.warning, fontSize: FONT_SIZES.xs, fontWeight: '700' },
  editBtn: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  editText: { color: COLORS.primary, fontWeight: '600', fontSize: FONT_SIZES.sm },
  group: { marginBottom: SPACING.lg },
  groupTitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  groupCard: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: 14,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,174,239,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: { flex: 1 },
  settingLabel: { color: COLORS.textWhite, fontWeight: '600', fontSize: FONT_SIZES.md },
  settingSubtitle: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.glassBorder, marginLeft: 60 },
  aboutSection: {
    alignItems: 'center',
    padding: SPACING.xxl,
    gap: 8,
  },
  aboutText: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  version: { color: COLORS.textDim, fontSize: FONT_SIZES.xs },
  developer: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '600', marginTop: 4 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    paddingVertical: 14,
    gap: 8,
  },
  logoutText: { color: COLORS.error, fontWeight: '700', fontSize: FONT_SIZES.lg },
});
