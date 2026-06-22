import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';
import { clearAllCache } from '../lib/storage';
import AppLogo from '../components/AppLogo';

interface Props {
  navigation: any;
}

function SettingItem({ icon, label, subtitle, onPress, right, danger }: {
  icon: string; label: string; subtitle?: string; onPress?: () => void; right?: React.ReactNode; danger?: boolean;
}) {
  return (
    <TouchableOpacity className="flex-row items-center px-4 py-3.5 gap-3.5" onPress={onPress} activeOpacity={0.7}>
      <View className={`w-9 h-9 rounded-full ${danger ? 'bg-red-500/10' : 'bg-[#00AEEF]/10'} items-center justify-center`}>
        <Ionicons name={icon as any} size={18} color={danger ? '#EF4444' : '#00AEEF'} />
      </View>
      <View className="flex-1">
        <Text className={`text-sm font-semibold ${danger ? 'text-[#EF4444]' : 'text-[#F8FAFC]'}`}>{label}</Text>
        {subtitle && <Text className="text-[#94A3B8] text-[11px] mt-0.5">{subtitle}</Text>}
      </View>
      {right || <Ionicons name="chevron-forward" size={16} color="#64748B" />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const { profile, signOut } = useAuthStore();
  const [notifications, setNotifications] = React.useState(true);
  const [autoPlay, setAutoPlay] = React.useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'This will clear all locally cached data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearAllCache().then(() => Alert.alert('Done', 'Cache cleared')) },
    ]);
  };

  return (
    <View className="flex-1 bg-[#050816]">
      <View className="pt-14 px-5 pb-3">
        <Text className="text-[#F8FAFC] text-3xl font-extrabold">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <LinearGradient colors={['rgba(0,174,239,0.1)', 'rgba(124,58,237,0.05)']} className="mx-5 rounded-2xl p-5 border border-[#00AEEF]/20 mb-5">
          <View className="flex-row items-center gap-3.5">
            <View className="w-14 h-14 rounded-full bg-[#00AEEF]/15 items-center justify-center">
              <Ionicons name="person" size={28} color="#00AEEF" />
            </View>
            <View className="flex-1">
              <Text className="text-[#F8FAFC] text-lg font-bold">{profile?.full_name || 'User'}</Text>
              <Text className="text-[#94A3B8] text-xs">{profile?.email || ''}</Text>
              <View className="flex-row items-center bg-yellow-500/15 px-2.5 py-0.5 rounded-full mt-1.5 gap-1.5 self-start">
                <Ionicons name="diamond" size={12} color="#F59E0B" />
                <Text className="text-[#F59E0B] text-[10px] font-bold uppercase">{profile?.subscription_plan || 'Free'}</Text>
              </View>
            </View>
            <TouchableOpacity className="bg-[#101827] px-4 py-2 rounded-full border border-white/10">
              <Text className="text-[#00AEEF] text-xs font-semibold">Edit</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Account */}
        <View className="mb-4">
          <Text className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider px-5 mb-2">Account</Text>
          <View className="mx-5 bg-[#101827] rounded-2xl border border-white/10 overflow-hidden">
            <SettingItem icon="server" label="Manage Playlists" subtitle="View and manage your IPTV playlists" onPress={() => navigation.navigate('AddPlaylist')} />
            <View className="h-[1px] bg-white/5 ml-[60px]" />
            <SettingItem icon="diamond" label="Subscription" subtitle={`${profile?.subscription_plan === 'premium' || profile?.subscription_plan === 'family' ? 'Premium' : 'Free'} plan`} onPress={() => {}} />
            <View className="h-[1px] bg-white/5 ml-[60px]" />
            <SettingItem icon="lock-closed" label="Parental Control" subtitle="Set content restrictions PIN" onPress={() => {}} />
            <View className="h-[1px] bg-white/5 ml-[60px]" />
            <SettingItem icon="trash" label="Clear Cache" subtitle="Free up storage space" onPress={handleClearCache} />
          </View>
        </View>

        {/* Preferences */}
        <View className="mb-4">
          <Text className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider px-5 mb-2">Preferences</Text>
          <View className="mx-5 bg-[#101827] rounded-2xl border border-white/10 overflow-hidden">
            <SettingItem icon="color-palette" label="App Theme" subtitle="Dark mode" />
            <View className="h-[1px] bg-white/5 ml-[60px]" />
            <SettingItem icon="language" label="Language" subtitle="English" />
            <View className="h-[1px] bg-white/5 ml-[60px]" />
            <SettingItem icon="notifications" label="Notifications" right={<Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#64748B', true: '#00AEEF' }} thumbColor="#fff" />} />
            <View className="h-[1px] bg-white/5 ml-[60px]" />
            <SettingItem icon="play" label="Auto-Play Videos" right={<Switch value={autoPlay} onValueChange={setAutoPlay} trackColor={{ false: '#64748B', true: '#00AEEF' }} thumbColor="#fff" />} />
          </View>
        </View>

        {/* Support */}
        <View className="mb-4">
          <Text className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider px-5 mb-2">Support</Text>
          <View className="mx-5 bg-[#101827] rounded-2xl border border-white/10 overflow-hidden">
            <SettingItem icon="help-circle" label="Help & Support" subtitle="FAQ, contact us" />
            <View className="h-[1px] bg-white/5 ml-[60px]" />
            <SettingItem icon="information-circle" label="Legal Disclaimer" subtitle="Usage terms" />
            <View className="h-[1px] bg-white/5 ml-[60px]" />
            <SettingItem icon="shield-checkmark" label="Privacy Policy" />
            <View className="h-[1px] bg-white/5 ml-[60px]" />
            <SettingItem icon="document-text" label="Terms of Service" />
          </View>
        </View>

        {/* About */}
        <View className="items-center py-6 gap-2">
          <AppLogo size="sm" />
          <Text className="text-[#64748B] text-xs text-center max-w-[280px] leading-5">
            SYNTV Online is a premium legal IPTV player. Users are responsible for adding only authorized playlists.
          </Text>
          <Text className="text-[#64748B] text-[10px]">Version 2.0.0</Text>
          <Text className="text-[#00AEEF] text-xs font-semibold mt-0.5">Developed by Mohammed Faysal</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="flex-row items-center justify-center mx-5 bg-[#101827] rounded-xl border border-red-500/30 py-3.5 gap-2"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-[#EF4444] font-bold text-base">Logout</Text>
        </TouchableOpacity>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
