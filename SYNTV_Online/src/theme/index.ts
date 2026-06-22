export const COLORS = {
  background: '#050816',
  cardBackground: '#101827',
  surfaceLight: '#1E293B',
  primary: '#00AEEF',
  primaryDark: '#0095CC',
  secondary: '#7C3AED',
  secondaryLight: '#9D5CFF',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  textWhite: '#F8FAFC',
  textMuted: '#94A3B8',
  textDim: '#64748B',
  border: '#1E293B',
  glassBorder: 'rgba(255,255,255,0.08)',
  glassBg: 'rgba(16,24,39,0.85)',
  overlay: 'rgba(5,8,22,0.7)',
  gradientPrimary: ['#00AEEF', '#7C3AED'] as const,
  gradientCard: ['#101827', '#1A2744'] as const,
  gradientNeon: ['#00AEEF', '#22C55E'] as const,
  gradientSunset: ['#7C3AED', '#EF4444'] as const,
};

export const FONTS = {
  regular: { fontFamily: 'System', fontWeight: '400' as const },
  medium: { fontFamily: 'System', fontWeight: '500' as const },
  semibold: { fontFamily: 'System', fontWeight: '600' as const },
  bold: { fontFamily: 'System', fontWeight: '700' as const },
  black: { fontFamily: 'System', fontWeight: '900' as const },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#00AEEF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  display: 36,
};
