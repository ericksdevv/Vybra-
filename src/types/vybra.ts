export type AgentTone =
  | 'motivador'
  | 'acolhedor'
  | 'direto'
  | 'analitico'
  | 'personalizado';

export type ThemeId =
  | 'vybra-neon'
  | 'branco-minimal'
  | 'azul'
  | 'verde'
  | 'amarelo'
  | 'vermelho';

export type SportType =
  | 'corrida'
  | 'ciclismo'
  | 'treino'
  | 'caminhada'
  | 'trilha'
  | 'natacao';

export interface WorkoutReport {
  id: string;
  sport: SportType;
  elapsedLabel: string;
  timestamp: string;
  text: string;
}

export type TabKey = 'overview' | 'metrics' | 'workout' | 'chat' | 'settings';

export type AuthScreen = 'login' | 'register';

export interface SplitMetric {
  km: number;
  pace: string;
  elevationDelta: number;
  heartRate: number;
}

export interface Activity {
  id: string;
  title: string;
  sport: SportType;
  dateLabel: string;
  timeLabel: string;
  distanceKm: number;
  durationLabel: string;
  paceLabel: string;
  paceSeconds: number;
  elevationGainM: number;
  avgHeartRate: number;
  cadenceSpm: number;
  calories: number;
  routePath: string;
  elevationSeries: number[];
  paceSeries: number[];
  splits: SplitMetric[];
  comparisonHeadline: string;
  comparisonDeltaLabel: string;
  isBetterThanYesterday: boolean;
  aiSummary: string;
}

export interface WeeklyVolumeDay {
  day: string;
  fullDay: string;
  km: number;
  durationMin: number;
  pace: string;
  isToday?: boolean;
}

export interface PersonalRecord {
  distance: string;
  time: string;
  pace: string;
  date: string;
  improvement: string;
}

export interface Achievement {
  id: string;
  category:
    | 'Consistência'
    | 'Evolução'
    | 'Marcos'
    | 'Exploração'
    | 'Inteligência e Cuidado'
    | 'Personalizada pela IA';
  title: string;
  description: string;
  progress: number; // 0..1
  progressLabel: string;
  unlocked: boolean;
  isAiSuggested?: boolean;
  aiAccepted?: boolean;
}

export interface MemoryFact {
  id: string;
  layer: 'Semântica' | 'Episódica' | 'Perfil' | 'Padrão';
  text: string;
  date: string;
  sensitive?: boolean;
}

export interface ChatMetricSnapshot {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  deltaLabel: string;
  positive: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  timestamp: string;
  metricCard?: ChatMetricSnapshot;
}

export interface CheckInState {
  energy: 1 | 2 | 3 | 4 | 5;
  sleepHours: string;
  mood: 'Ótimo' | 'Normal' | 'Cansado' | 'Pesado';
  difficultDayActive: boolean;
  difficultReason?: string;
}

export interface NotificationSettings {
  trainingReminder: boolean;
  dailyEncouragement: boolean;
  recoveryAlert: boolean;
  quietHours: boolean;
  leaveMeAloneToday: boolean;
}

export interface PrivacySettings {
  hideHomeZone: boolean;
  hideWorkZone: boolean;
  biometricLock: boolean;
}

export interface PushNotificationData {
  id: string;
  title: string;
  body: string;
  tag: string;
}
