import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../theme';
import SearchBar from '../components/SearchBar';
import ProgramCard from '../components/ProgramCard';
import { epgData, liveChannels } from '../utils/mockData';

interface TVGuideScreenProps {
  navigation: any;
}

const dates = ['Mon 22', 'Tue 23', 'Wed 24', 'Thu 25', 'Fri 26', 'Sat 27', 'Sun 28'];

export default function TVGuideScreen({ navigation }: TVGuideScreenProps) {
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredPrograms = epgData.filter(
    (p) => p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TV Guide</Text>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search programs..." showFilter={false} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow} contentContainerStyle={styles.dateContent}>
        {dates.map((d, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.dateBtn, i === selectedDate && styles.activeDateBtn]}
            onPress={() => setSelectedDate(i)}
          >
            <Text style={[styles.dateText, i === selectedDate && styles.activeDateText]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.programList} showsVerticalScrollIndicator={false}>
        <View style={styles.channelHeaderRow}>
          <Text style={styles.channelHeaderText}>Channel</Text>
          <Text style={styles.channelHeaderText}>Program</Text>
          <Text style={styles.channelHeaderText}>Time</Text>
        </View>

        {liveChannels.slice(0, 5).map((ch) => {
          const channelPrograms = filteredPrograms.filter((p) => p.channelId === ch.id);
          return (
            <View key={ch.id} style={styles.channelBlock}>
              <View style={styles.channelInfo}>
                <View style={styles.channelDot} />
                <Text style={styles.channelName}>{ch.name}</Text>
              </View>
              {channelPrograms.length > 0 ? (
                channelPrograms.map((prog) => (
                  <ProgramCard
                    key={prog.id}
                    program={prog}
                    isCurrent={prog.isLive}
                    onPress={() => {
                      setSelectedProgram(prog);
                      setModalVisible(true);
                    }}
                  />
                ))
              ) : (
                <Text style={styles.noEpg}>No program data available</Text>
              )}
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Program Detail Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            {selectedProgram && (
              <>
                <Text style={styles.modalTitle}>{selectedProgram.title}</Text>
                {selectedProgram.isLive && (
                  <View style={styles.modalLiveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.modalLiveText}>LIVE</Text>
                  </View>
                )}
                <View style={styles.modalTimeRow}>
                  <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
                  <Text style={styles.modalTime}>
                    {new Date(selectedProgram.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(selectedProgram.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                {selectedProgram.category && (
                  <View style={styles.modalCatRow}>
                    <Ionicons name="pricetag-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.modalCat}>{selectedProgram.category}</Text>
                  </View>
                )}
                {selectedProgram.description && (
                  <Text style={styles.modalDesc}>{selectedProgram.description}</Text>
                )}
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xl, paddingTop: 55, paddingBottom: SPACING.sm },
  headerTitle: { color: COLORS.textWhite, fontSize: FONT_SIZES.xxxl, fontWeight: '800' },
  dateRow: { maxHeight: 44, marginBottom: SPACING.sm },
  dateContent: { paddingHorizontal: SPACING.xl, gap: 8 },
  dateBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  activeDateBtn: { backgroundColor: COLORS.primary },
  dateText: { color: COLORS.textMuted, fontWeight: '600', fontSize: FONT_SIZES.sm },
  activeDateText: { color: '#fff' },
  programList: { flex: 1 },
  channelHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
    gap: 12,
  },
  channelHeaderText: { color: COLORS.textDim, fontSize: FONT_SIZES.xs, fontWeight: '700', flex: 1 },
  channelBlock: { marginBottom: SPACING.sm },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    gap: 8,
  },
  channelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  channelName: { color: COLORS.textWhite, fontWeight: '700', fontSize: FONT_SIZES.md },
  noEpg: { color: COLORS.textDim, fontSize: FONT_SIZES.sm, paddingLeft: SPACING.xl, paddingVertical: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.xxl,
    ...SHADOWS.large,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textDim,
    alignSelf: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: { color: COLORS.textWhite, fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  modalLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginTop: 8,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  modalLiveText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.xs },
  modalTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  modalTime: { color: COLORS.textMuted, fontSize: FONT_SIZES.md },
  modalCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  modalCat: { color: COLORS.textMuted, fontSize: FONT_SIZES.md },
  modalDesc: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    marginTop: 16,
  },
  modalCloseBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCloseText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.lg },
});
