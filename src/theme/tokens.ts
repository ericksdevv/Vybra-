/**
 * Design tokens oficiais do Vybra — extraídos de docs/identidade-visual.md
 * com camadas de profundidade, sombras neon e gradientes atmosféricos da prancha oficial.
 */
export const COLORS = {
  background: '#0B0B0F',
  backgroundDeep: '#07070B',
  surface: '#13121C',
  surfaceElevated: '#1A1829',
  surfaceGlass: 'rgba(22, 19, 36, 0.88)',
  surfaceInput: '#141320',
  primary: '#7C3AED',
  secondary: '#A855F7',
  neonViolet: '#8B5CF6',
  neonMagenta: '#C084FC',
  electricIndigo: '#4F46E5',
  neonBlue: '#6366F1',
  primarySoft: 'rgba(124, 58, 237, 0.20)',
  secondarySoft: 'rgba(168, 85, 247, 0.22)',
  indigoSoft: 'rgba(99, 102, 241, 0.18)',
  primaryGlow: 'rgba(124, 58, 237, 0.52)',
  border: 'rgba(255, 255, 255, 0.09)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',
  borderSpecular: 'rgba(192, 132, 252, 0.28)',
  borderPurple: 'rgba(139, 92, 246, 0.62)',
  white: '#FFFFFF',
  gray: '#9CA3AF',
  grayLight: '#D1D5DB',
  grayMuted: '#6B7280',
  positive: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
} as const;

export const GRADIENTS = {
  brand: ['#7C3AED', '#9333EA', '#A855F7'] as const,
  brandButton: ['#6D28D9', '#7C3AED', '#A855F7'] as const,
  brandReverse: ['#A855F7', '#7C3AED'] as const,
  brandNeon: ['#4F46E5', '#7C3AED', '#A855F7'] as const,
  brandSubtle: ['rgba(124, 58, 237, 0.28)', 'rgba(168, 85, 247, 0.06)'] as const,
  darkCard: ['#19162B', '#12111C', '#0E0D16'] as const,
  heroCard: ['#251B42', '#171329', '#110F1D'] as const,
  glassCard: ['rgba(30, 25, 48, 0.92)', 'rgba(17, 15, 28, 0.94)'] as const,
  activeIconTile: ['#9333EA', '#7C3AED', '#5B21B6'] as const,
  heroGlow: ['rgba(124, 58, 237, 0.38)', 'rgba(11, 11, 15, 0)'] as const,
} as const;

export const SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.48,
    shadowRadius: 18,
    elevation: 8,
  },
  neonCard: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 22,
    elevation: 10,
  },
  neonButton: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  neonTile: {
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.62,
    shadowRadius: 14,
    elevation: 9,
  },
} as const;

export const FONTS = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const RADII = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 9999,
} as const;

export const MOTION = {
  fast: 140,
  normal: 210,
  panel: 260,
  tabSlide: 240,
  celebrate: 620,
} as const;
