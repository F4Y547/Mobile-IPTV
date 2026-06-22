import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../theme';
import PlaylistForm from '../components/PlaylistForm';

interface AddPlaylistScreenProps {
  navigation: any;
}

export default function AddPlaylistScreen({ navigation }: AddPlaylistScreenProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (data: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Playlist Added',
        'Playlist added successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Add Playlist</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PlaylistForm onSubmit={handleSubmit} loading={loading} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: 55,
    paddingBottom: SPACING.md,
  },
  headerTitle: { color: COLORS.textWhite, fontSize: FONT_SIZES.xl, fontWeight: '700' },
});
