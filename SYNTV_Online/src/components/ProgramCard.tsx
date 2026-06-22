import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EPGProgram } from '../types';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING } from '../theme';

interface ProgramCardProps {
  program: EPGProgram;
  isCurrent?: boolean;
  onPress: () => void;
}

export default function ProgramCard({ program, isCurrent, onPress }: ProgramCardProps) {
  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity
      style={[styles.card, isCurrent && styles.currentCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.timeIndicator, isCurrent && styles.currentIndicator]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, isCurrent && styles.currentTitle]} numberOfLines={1}>
            {program.title}
          </Text>
          {isCurrent && <View style={styles.liveTag}><Text style={styles.liveTagText}>LIVE</Text></View>}
        </View>
        <Text style={styles.time}>
          {formatTime(program.startTime)} - {formatTime(program.endTime)}
        </Text>
        {program.description && (
          <Text style={styles.description} numberOfLines={2}>{program.description}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
  currentCard: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0,174,239,0.08)',
  },
  timeIndicator: {
    width: 3,
    backgroundColor: 'transparent',
  },
  currentIndicator: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: COLORS.textWhite,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    flex: 1,
  },
  currentTitle: { color: COLORS.primary },
  liveTag: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  liveTagText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  time: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    marginTop: 4,
  },
  description: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.sm,
    marginTop: 4,
  },
});
