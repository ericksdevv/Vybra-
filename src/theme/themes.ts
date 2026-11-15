import { ThemeId } from '../types/vybra';

export interface VybraTheme {
  id: ThemeId;
  name: string;
  subtitle: string;
  isLight: boolean;
  useNeonGlow: boolean;
  statusBarStyle: 'light' | 'dark';
  wordmarkVariant: 'light' | 'dark';
  previewSwatches: [string, string, string];
  colors: {
    bg: string;
    bgElevated: string;
    surface: string;
    surfaceHover: string;
    surfaceMuted: string;
    surfaceGlass: string;
    primary: string;
    secondary: string;
    accentBlue: string;
    accentGlow: string;
    onPrimary: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderStrong: string;
    borderAccent: string;
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    danger: string;
    dangerSoft: string;
    primarySoft: string;
    infoSoft: string;
    mapBg: string;
    mapGrid: string;
    mapStreet: string;
    footerBg: string;
    footerBorder: string;
    overlayBackdrop: string;
    switchTrackIdle: string;
    switchThumb: string;
  };
  gradients: {
    brandButton: [string, string];
    surfaceHighlight: [string, string];
    cardDepth: [string, string];
    ringTrack: [string, string];
    ribbon: [string, string, string];
  };
}

export const VYBRA_THEMES: Record<ThemeId, VybraTheme> = {
  'vybra-neon': {
    id: 'vybra-neon',
    name: 'Roxo Oficial',
    subtitle: 'Identidade original em preto profundo',
    isLight: false,
    useNeonGlow: true,
    statusBarStyle: 'light',
    wordmarkVariant: 'light',
    previewSwatches: ['#0B0B0F', '#7C3AED', '#A855F7'],
    colors: {
      bg: '#0B0B0F',
      bgElevated: '#111119',
      surface: '#14141D',
      surfaceHover: '#1A1A26',
      surfaceMuted: '#1E1E2B',
      surfaceGlass: 'rgba(20, 20, 30, 0.86)',
      primary: '#7C3AED',
      secondary: '#A855F7',
      accentBlue: '#2563EB',
      accentGlow: '#C084FC',
      onPrimary: '#FFFFFF',
      textPrimary: '#FFFFFF',
      textSecondary: '#9CA3AF',
      textMuted: '#6B7280',
      border: 'rgba(255, 255, 255, 0.08)',
      borderStrong: 'rgba(255, 255, 255, 0.16)',
      borderAccent: 'rgba(168, 85, 247, 0.48)',
      success: '#10B981',
      successSoft: 'rgba(16, 185, 129, 0.14)',
      warning: '#F59E0B',
      warningSoft: 'rgba(245, 158, 11, 0.14)',
      danger: '#EF4444',
      dangerSoft: 'rgba(239, 68, 68, 0.16)',
      primarySoft: 'rgba(124, 58, 237, 0.18)',
      infoSoft: 'rgba(37, 99, 235, 0.16)',
      mapBg: '#0E0E17',
      mapGrid: 'rgba(255, 255, 255, 0.04)',
      mapStreet: 'rgba(148, 163, 184, 0.14)',
      footerBg: 'rgba(13, 13, 21, 0.94)',
      footerBorder: 'rgba(255, 255, 255, 0.08)',
      overlayBackdrop: 'rgba(4, 4, 8, 0.82)',
      switchTrackIdle: 'rgba(255, 255, 255, 0.12)',
      switchThumb: '#FFFFFF',
    },
    gradients: {
      brandButton: ['#7C3AED', '#A855F7'],
      surfaceHighlight: ['#1A1A28', '#12121B'],
      cardDepth: ['rgba(26, 24, 42, 0.95)', 'rgba(16, 16, 24, 0.95)'],
      ringTrack: ['#7C3AED', '#C084FC'],
      ribbon: ['rgba(124, 58, 237, 0.55)', 'rgba(37, 99, 235, 0.40)', 'transparent'],
    },
  },
  'branco-minimal': {
    id: 'branco-minimal',
    name: 'Branco Minimalista',
    subtitle: 'Claro, limpo e sem cores neon',
    isLight: true,
    useNeonGlow: false,
    statusBarStyle: 'dark',
    wordmarkVariant: 'dark',
    previewSwatches: ['#F8FAFC', '#FFFFFF', '#0F172A'],
    colors: {
      bg: '#F4F5F7',
      bgElevated: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceHover: '#F1F5F9',
      surfaceMuted: '#E5E7EB',
      surfaceGlass: 'rgba(255, 255, 255, 0.96)',
      primary: '#111827',
      secondary: '#374151',
      accentBlue: '#2563EB',
      accentGlow: '#4B5563',
      onPrimary: '#FFFFFF',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      textMuted: '#64748B',
      border: '#E2E8F0',
      borderStrong: '#CBD5E1',
      borderAccent: '#111827',
      success: '#15803D',
      successSoft: '#DCFCE7',
      warning: '#B45309',
      warningSoft: '#FEF3C7',
      danger: '#B91C1C',
      dangerSoft: '#FEE2E2',
      primarySoft: '#E2E8F0',
      infoSoft: '#DBEAFE',
      mapBg: '#EEF2F6',
      mapGrid: 'rgba(15, 23, 42, 0.06)',
      mapStreet: 'rgba(15, 23, 42, 0.14)',
      footerBg: '#FFFFFF',
      footerBorder: '#E2E8F0',
      overlayBackdrop: 'rgba(15, 23, 42, 0.45)',
      switchTrackIdle: '#CBD5E1',
      switchThumb: '#FFFFFF',
    },
    gradients: {
      brandButton: ['#111827', '#1F2937'],
      surfaceHighlight: ['#FFFFFF', '#F8FAFC'],
      cardDepth: ['#FFFFFF', '#FAFBFD'],
      ringTrack: ['#111827', '#475569'],
      ribbon: ['rgba(15, 23, 42, 0.04)', 'rgba(15, 23, 42, 0.02)', 'transparent'],
    },
  },
  azul: {
    id: 'azul',
    name: 'Azul Performance',
    subtitle: 'Precisão noturna em azul e ciano',
    isLight: false,
    useNeonGlow: true,
    statusBarStyle: 'light',
    wordmarkVariant: 'light',
    previewSwatches: ['#060B14', '#2563EB', '#38BDF8'],
    colors: {
      bg: '#060B14',
      bgElevated: '#0C1424',
      surface: '#0F182B',
      surfaceHover: '#15223B',
      surfaceMuted: '#1B2945',
      surfaceGlass: 'rgba(15, 24, 43, 0.88)',
      primary: '#2563EB',
      secondary: '#38BDF8',
      accentBlue: '#0EA5E9',
      accentGlow: '#60A5FA',
      onPrimary: '#FFFFFF',
      textPrimary: '#FFFFFF',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      border: 'rgba(148, 163, 184, 0.14)',
      borderStrong: 'rgba(148, 163, 184, 0.24)',
      borderAccent: 'rgba(56, 189, 248, 0.48)',
      success: '#10B981',
      successSoft: 'rgba(16, 185, 129, 0.14)',
      warning: '#F59E0B',
      warningSoft: 'rgba(245, 158, 11, 0.14)',
      danger: '#EF4444',
      dangerSoft: 'rgba(239, 68, 68, 0.16)',
      primarySoft: 'rgba(37, 99, 235, 0.22)',
      infoSoft: 'rgba(56, 189, 248, 0.16)',
      mapBg: '#091120',
      mapGrid: 'rgba(148, 163, 184, 0.06)',
      mapStreet: 'rgba(148, 163, 184, 0.16)',
      footerBg: 'rgba(9, 15, 28, 0.94)',
      footerBorder: 'rgba(148, 163, 184, 0.14)',
      overlayBackdrop: 'rgba(3, 6, 12, 0.82)',
      switchTrackIdle: 'rgba(148, 163, 184, 0.2)',
      switchThumb: '#FFFFFF',
    },
    gradients: {
      brandButton: ['#2563EB', '#0EA5E9'],
      surfaceHighlight: ['#132038', '#0D1628'],
      cardDepth: ['rgba(18, 30, 54, 0.95)', 'rgba(12, 20, 36, 0.95)'],
      ringTrack: ['#2563EB', '#38BDF8'],
      ribbon: ['rgba(37, 99, 235, 0.5)', 'rgba(56, 189, 248, 0.35)', 'transparent'],
    },
  },
  verde: {
    id: 'verde',
    name: 'Verde Trail',
    subtitle: 'Fôlego de trilha em esmeralda escuro',
    isLight: false,
    useNeonGlow: true,
    statusBarStyle: 'light',
    wordmarkVariant: 'light',
    previewSwatches: ['#06110C', '#059669', '#34D399'],
    colors: {
      bg: '#06110C',
      bgElevated: '#0B1D14',
      surface: '#0E2419',
      surfaceHover: '#133022',
      surfaceMuted: '#193C2B',
      surfaceGlass: 'rgba(14, 36, 25, 0.88)',
      primary: '#059669',
      secondary: '#34D399',
      accentBlue: '#10B981',
      accentGlow: '#6EE7B7',
      onPrimary: '#FFFFFF',
      textPrimary: '#FFFFFF',
      textSecondary: '#9CA3AF',
      textMuted: '#6B7280',
      border: 'rgba(167, 243, 208, 0.12)',
      borderStrong: 'rgba(167, 243, 208, 0.22)',
      borderAccent: 'rgba(52, 211, 153, 0.48)',
      success: '#34D399',
      successSoft: 'rgba(52, 211, 153, 0.16)',
      warning: '#F59E0B',
      warningSoft: 'rgba(245, 158, 11, 0.15)',
      danger: '#EF4444',
      dangerSoft: 'rgba(239, 68, 68, 0.16)',
      primarySoft: 'rgba(5, 150, 105, 0.22)',
      infoSoft: 'rgba(16, 185, 129, 0.16)',
      mapBg: '#081710',
      mapGrid: 'rgba(167, 243, 208, 0.05)',
      mapStreet: 'rgba(167, 243, 208, 0.14)',
      footerBg: 'rgba(8, 22, 15, 0.94)',
      footerBorder: 'rgba(167, 243, 208, 0.12)',
      overlayBackdrop: 'rgba(3, 10, 6, 0.82)',
      switchTrackIdle: 'rgba(255, 255, 255, 0.16)',
      switchThumb: '#FFFFFF',
    },
    gradients: {
      brandButton: ['#059669', '#10B981'],
      surfaceHighlight: ['#122E20', '#0C2016'],
      cardDepth: ['rgba(16, 40, 28, 0.95)', 'rgba(11, 28, 19, 0.95)'],
      ringTrack: ['#059669', '#34D399'],
      ribbon: ['rgba(5, 150, 105, 0.48)', 'rgba(52, 211, 153, 0.3)', 'transparent'],
    },
  },
  amarelo: {
    id: 'amarelo',
    name: 'Amarelo Solar',
    subtitle: 'Alta visibilidade em âmbar e ouro',
    isLight: false,
    useNeonGlow: true,
    statusBarStyle: 'light',
    wordmarkVariant: 'light',
    previewSwatches: ['#100D06', '#EAB308', '#FDE047'],
    colors: {
      bg: '#100D06',
      bgElevated: '#1A150A',
      surface: '#211B0D',
      surfaceHover: '#2B2312',
      surfaceMuted: '#352B17',
      surfaceGlass: 'rgba(33, 27, 13, 0.9)',
      primary: '#EAB308',
      secondary: '#FACC15',
      accentBlue: '#F59E0B',
      accentGlow: '#FDE047',
      onPrimary: '#111827',
      textPrimary: '#FFFFFF',
      textSecondary: '#D6D3D1',
      textMuted: '#A8A29E',
      border: 'rgba(250, 204, 21, 0.14)',
      borderStrong: 'rgba(250, 204, 21, 0.28)',
      borderAccent: 'rgba(250, 204, 21, 0.55)',
      success: '#22C55E',
      successSoft: 'rgba(34, 197, 94, 0.16)',
      warning: '#F59E0B',
      warningSoft: 'rgba(245, 158, 11, 0.18)',
      danger: '#EF4444',
      dangerSoft: 'rgba(239, 68, 68, 0.16)',
      primarySoft: 'rgba(234, 179, 8, 0.2)',
      infoSoft: 'rgba(245, 158, 11, 0.18)',
      mapBg: '#141008',
      mapGrid: 'rgba(250, 204, 21, 0.05)',
      mapStreet: 'rgba(250, 204, 21, 0.14)',
      footerBg: 'rgba(18, 15, 7, 0.94)',
      footerBorder: 'rgba(250, 204, 21, 0.14)',
      overlayBackdrop: 'rgba(10, 8, 3, 0.84)',
      switchTrackIdle: 'rgba(255, 255, 255, 0.16)',
      switchThumb: '#FFFFFF',
    },
    gradients: {
      brandButton: ['#EAB308', '#FACC15'],
      surfaceHighlight: ['#292211', '#1D180B'],
      cardDepth: ['rgba(36, 29, 14, 0.95)', 'rgba(24, 19, 9, 0.95)'],
      ringTrack: ['#CA8A04', '#FACC15'],
      ribbon: ['rgba(234, 179, 8, 0.45)', 'rgba(245, 158, 11, 0.28)', 'transparent'],
    },
  },
  vermelho: {
    id: 'vermelho',
    name: 'Vermelho Pulso',
    subtitle: 'Energia intensa em carmesim escuro',
    isLight: false,
    useNeonGlow: true,
    statusBarStyle: 'light',
    wordmarkVariant: 'light',
    previewSwatches: ['#12070A', '#DC2626', '#FB7185'],
    colors: {
      bg: '#12070A',
      bgElevated: '#1D0C11',
      surface: '#240F15',
      surfaceHover: '#2E141C',
      surfaceMuted: '#3A1923',
      surfaceGlass: 'rgba(36, 15, 21, 0.9)',
      primary: '#DC2626',
      secondary: '#FB7185',
      accentBlue: '#F43F5E',
      accentGlow: '#FDA4AF',
      onPrimary: '#FFFFFF',
      textPrimary: '#FFFFFF',
      textSecondary: '#CBD5E1',
      textMuted: '#94A3B8',
      border: 'rgba(251, 113, 133, 0.14)',
      borderStrong: 'rgba(251, 113, 133, 0.26)',
      borderAccent: 'rgba(251, 113, 133, 0.52)',
      success: '#10B981',
      successSoft: 'rgba(16, 185, 129, 0.16)',
      warning: '#F59E0B',
      warningSoft: 'rgba(245, 158, 11, 0.16)',
      danger: '#EF4444',
      dangerSoft: 'rgba(239, 68, 68, 0.18)',
      primarySoft: 'rgba(220, 38, 38, 0.22)',
      infoSoft: 'rgba(244, 63, 94, 0.16)',
      mapBg: '#16090D',
      mapGrid: 'rgba(251, 113, 133, 0.05)',
      mapStreet: 'rgba(251, 113, 133, 0.14)',
      footerBg: 'rgba(20, 8, 12, 0.94)',
      footerBorder: 'rgba(251, 113, 133, 0.14)',
      overlayBackdrop: 'rgba(10, 4, 6, 0.84)',
      switchTrackIdle: 'rgba(255, 255, 255, 0.16)',
      switchThumb: '#FFFFFF',
    },
    gradients: {
      brandButton: ['#DC2626', '#F43F5E'],
      surfaceHighlight: ['#2B1219', '#1F0C12'],
      cardDepth: ['rgba(38, 16, 22, 0.95)', 'rgba(26, 11, 15, 0.95)'],
      ringTrack: ['#DC2626', '#FB7185'],
      ribbon: ['rgba(220, 38, 38, 0.48)', 'rgba(244, 63, 94, 0.30)', 'transparent'],
    },
  },
};

export const THEME_ORDER: ThemeId[] = [
  'vybra-neon',
  'branco-minimal',
  'azul',
  'verde',
  'amarelo',
  'vermelho',
];
