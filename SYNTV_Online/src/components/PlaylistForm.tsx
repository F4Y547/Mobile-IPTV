import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../theme';

interface PlaylistFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export default function PlaylistForm({ onSubmit, loading }: PlaylistFormProps) {
  const [mode, setMode] = useState<'m3u' | 'xtream'>('m3u');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [epgUrl, setEpgUrl] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (mode === 'm3u') {
      if (!url.trim()) return;
      onSubmit({ name, url, epgUrl, type: 'm3u' });
    } else {
      if (!serverUrl.trim() || !username.trim() || !password.trim()) return;
      onSubmit({ name, serverUrl, username, password, type: 'xtream' });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, mode === 'm3u' && styles.activeTab]}
          onPress={() => setMode('m3u')}
        >
          <Ionicons name="link" size={18} color={mode === 'm3u' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, mode === 'm3u' && styles.activeTabText]}>M3U URL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'xtream' && styles.activeTab]}
          onPress={() => setMode('xtream')}
        >
          <Ionicons name="server" size={18} color={mode === 'xtream' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, mode === 'xtream' && styles.activeTabText]}>Xtream Codes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Playlist Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="My Playlist"
            placeholderTextColor={COLORS.textDim}
          />
        </View>

        {mode === 'm3u' ? (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>M3U URL</Text>
              <TextInput
                style={styles.input}
                value={url}
                onChangeText={setUrl}
                placeholder="https://example.com/playlist.m3u"
                placeholderTextColor={COLORS.textDim}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>EPG XML URL (Optional)</Text>
              <TextInput
                style={styles.input}
                value={epgUrl}
                onChangeText={setEpgUrl}
                placeholder="https://example.com/epg.xml"
                placeholderTextColor={COLORS.textDim}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Server URL</Text>
              <TextInput
                style={styles.input}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="https://example.com:8080"
                placeholderTextColor={COLORS.textDim}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Your username"
                placeholderTextColor={COLORS.textDim}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor={COLORS.textDim}
                secureTextEntry
              />
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, (!name.trim() || loading) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!name.trim() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitText}>Save Playlist</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.disclaimer}>
        <Ionicons name="information-circle" size={16} color={COLORS.warning} />
        <Text style={styles.disclaimerText}>
          SYNTV Online does not host, sell, or distribute TV channels. Users are responsible for adding only legal playlists they are authorized to access.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.xl,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  activeTab: { backgroundColor: COLORS.background },
  tabText: { color: COLORS.textMuted, fontWeight: '600', fontSize: FONT_SIZES.md },
  activeTabText: { color: COLORS.primary },
  form: { gap: SPACING.lg },
  field: {},
  label: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    color: COLORS.textWhite,
    fontSize: FONT_SIZES.md,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: RADIUS.md,
    gap: 8,
    marginTop: SPACING.sm,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '700' },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.xl,
    gap: 8,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    flex: 1,
    lineHeight: 18,
  },
});
