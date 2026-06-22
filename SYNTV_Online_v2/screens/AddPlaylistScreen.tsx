import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { usePlaylistStore } from '../store/playlistStore';
import PlaylistForm from '../components/PlaylistForm';

interface Props {
  navigation: any;
}

export default function AddPlaylistScreen({ navigation }: Props) {
  const { profile } = useAuthStore();
  const { savePlaylist, isLoading } = usePlaylistStore();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: any) => {
    const uid = profile?.user_id || profile?.id;
    if (!uid) return;
    setSaving(true);
    try {
      await savePlaylist(data, uid);
      Alert.alert('Success', 'Playlist added successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save playlist');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-[#050816]">
      <View className="flex-row items-center justify-between px-5 pt-14 pb-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text className="text-[#F8FAFC] text-lg font-bold">Add Playlist</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PlaylistForm onSubmit={handleSubmit} />
      </ScrollView>
    </View>
  );
}

import { TouchableOpacity } from 'react-native';
