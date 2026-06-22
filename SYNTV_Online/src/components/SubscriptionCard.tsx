import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../theme';

interface SubscriptionCardProps {
  plan: string;
  status: 'active' | 'expired' | 'free';
  expiresAt?: string;
  onUpgrade?: () => void;
}

export default function SubscriptionCard({ plan, status, expiresAt, onUpgrade }: SubscriptionCardProps) {
  const isFree = status === 'free';
  const isExpired = status === 'expired';

  return (
    <LinearGradient
      colors={isExpired ? ['#EF4444', '#DC2626'] : ['#00AEEF', '#7C3AED']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.label}>
            {isFree ? 'Current Plan' : isExpired ? 'Plan Expired' : 'Premium Plan'}
          </Text>
          <Text style={styles.planName}>
            {isFree ? 'Free' : plan}
          </Text>
          {expiresAt && (
            <Text style={styles.expiry}>
              Expires: {expiresAt}
            </Text>
          )}
        </View>
        <View style={styles.right}>
          {isFree || isExpired ? (
            <TouchableOpacity style={styles.upgradeBtn} onPress={onUpgrade} activeOpacity={0.8}>
              <Text style={styles.upgradeText}>{isExpired ? 'Renew' : 'Upgrade'}</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.activeBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.activeText}>Active</Text>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.large,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: { flex: 1 },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: FONT_SIZES.sm },
  planName: { color: '#fff', fontSize: FONT_SIZES.xxl, fontWeight: '700', marginTop: 2 },
  expiry: { color: 'rgba(255,255,255,0.6)', fontSize: FONT_SIZES.xs, marginTop: 4 },
  right: { marginLeft: SPACING.lg },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  upgradeText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeText: { color: '#fff', fontWeight: '600', fontSize: FONT_SIZES.md },
});
