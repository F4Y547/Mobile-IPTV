import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaylistStore } from '../store/playlistStore';

interface Props {
  onSubmit: (data: any) => void;
}

export default function PlaylistForm({ onSubmit }: Props) {
  const [mode, setMode] = useState<'m3u' | 'xtream'>('m3u');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [epgUrl, setEpgUrl] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { testM3uConnection, testXtreamConnection, isTesting, testResult, channels, categories } = usePlaylistStore();

  const handleTest = async () => {
    if (mode === 'm3u') {
      if (!url.trim()) return;
      await testM3uConnection(url);
    } else {
      if (!serverUrl.trim() || !username.trim() || !password.trim()) return;
      await testXtreamConnection(serverUrl, username, password);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name,
      type: mode,
      url: url.trim(),
      epgUrl: epgUrl.trim(),
      serverUrl: serverUrl.trim(),
      username: username.trim(),
      password: password.trim(),
    });
  };

  return (
    <ScrollView className="flex-1 px-5 py-4">
      <View className="flex-row bg-[#101827] rounded-xl p-1 mb-6">
        {(['m3u', 'xtream'] as const).map((m) => (
          <TouchableOpacity
            key={m}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl gap-2 ${mode === m ? 'bg-[#050816]' : ''}`}
            onPress={() => setMode(m)}
          >
            <Ionicons name={m === 'm3u' ? 'link' : 'server'} size={18} color={mode === m ? '#00AEEF' : '#94A3B8'} />
            <Text className={`font-semibold text-sm ${mode === m ? 'text-[#00AEEF]' : 'text-[#94A3B8]'}`}>
              {m === 'm3u' ? 'M3U URL' : 'Xtream Codes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="gap-4">
        <View>
          <Text className="text-[#94A3B8] text-xs font-medium mb-1.5">Playlist Name</Text>
          <TextInput
            className="bg-[#101827] border border-white/10 rounded-xl px-4 py-3.5 text-[#F8FAFC] text-sm"
            value={name}
            onChangeText={setName}
            placeholder="My Playlist"
            placeholderTextColor="#64748B"
          />
        </View>

        {mode === 'm3u' ? (
          <>
            <View>
              <Text className="text-[#94A3B8] text-xs font-medium mb-1.5">M3U URL</Text>
              <TextInput
                className="bg-[#101827] border border-white/10 rounded-xl px-4 py-3.5 text-[#F8FAFC] text-sm"
                value={url}
                onChangeText={setUrl}
                placeholder="https://example.com/playlist.m3u"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            <View>
              <Text className="text-[#94A3B8] text-xs font-medium mb-1.5">EPG XML URL (Optional)</Text>
              <TextInput
                className="bg-[#101827] border border-white/10 rounded-xl px-4 py-3.5 text-[#F8FAFC] text-sm"
                value={epgUrl}
                onChangeText={setEpgUrl}
                placeholder="https://example.com/epg.xml"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          </>
        ) : (
          <>
            <View>
              <Text className="text-[#94A3B8] text-xs font-medium mb-1.5">Server URL</Text>
              <TextInput
                className="bg-[#101827] border border-white/10 rounded-xl px-4 py-3.5 text-[#F8FAFC] text-sm"
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="https://example.com:8080"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            <View>
              <Text className="text-[#94A3B8] text-xs font-medium mb-1.5">Username</Text>
              <TextInput
                className="bg-[#101827] border border-white/10 rounded-xl px-4 py-3.5 text-[#F8FAFC] text-sm"
                value={username}
                onChangeText={setUsername}
                placeholder="Your username"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
              />
            </View>
            <View>
              <Text className="text-[#94A3B8] text-xs font-medium mb-1.5">Password</Text>
              <TextInput
                className="bg-[#101827] border border-white/10 rounded-xl px-4 py-3.5 text-[#F8FAFC] text-sm"
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor="#64748B"
                secureTextEntry
              />
            </View>
          </>
        )}

        {/* Test Result */}
        {testResult && (
          <View className={`rounded-xl px-4 py-3 flex-row items-center gap-2.5 ${
            testResult.success ? 'bg-green-500/10' : 'bg-red-500/10'
          }`}>
            <Ionicons
              name={testResult.success ? 'checkmark-circle' : 'alert-circle'}
              size={20}
              color={testResult.success ? '#22C55E' : '#EF4444'}
            />
            <Text className={`flex-1 text-sm ${testResult.success ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              {testResult.message}
            </Text>
          </View>
        )}

        {/* Channel count */}
        {channels.length > 0 && (
          <View className="bg-[#00AEEF]/10 rounded-xl px-4 py-3">
            <Text className="text-[#00AEEF] text-sm font-semibold">
              {channels.length} channels detected in {categories.length} categories
            </Text>
          </View>
        )}

        <TouchableOpacity
          className="bg-[#1E293B] border border-white/10 rounded-xl py-3.5 items-center flex-row justify-center gap-2"
          onPress={handleTest}
          disabled={isTesting}
        >
          {isTesting ? (
            <ActivityIndicator color="#00AEEF" />
          ) : (
            <>
              <Ionicons name="refresh" size={18} color="#00AEEF" />
              <Text className="text-[#00AEEF] font-bold text-sm">Test Connection</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#00AEEF] rounded-xl py-4 items-center flex-row justify-center gap-2"
          onPress={handleSubmit}
          disabled={!name.trim()}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text className="text-white font-bold text-base">Save Playlist</Text>
        </TouchableOpacity>
      </View>

      {/* Legal disclaimer */}
      <View className="flex-row bg-yellow-500/10 rounded-xl p-3.5 mt-6 gap-2 items-start">
        <Ionicons name="information-circle" size={18} color="#F59E0B" />
        <Text className="text-[#94A3B8] text-[11px] flex-1 leading-5">
          SYNTV Online does not host, sell, or distribute TV channels, movies, or streams. Users are responsible for adding only legal playlists and content sources they are authorized to access.
        </Text>
      </View>
    </ScrollView>
  );
}
