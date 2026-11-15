import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  Bell,
  ChevronRight,
  Flame,
  HeartHandshake,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SportIcon } from '../components/brand/SportIcons';
import { VybraIconMark, VybraWordmark } from '../components/brand/VybraLogo';
import {
  ConsistencyRing,
  PaceTrendChart,
  RoutePreviewMap,
  WeeklyVolumeChart,
} from '../components/charts/Charts';
import {
  AnimatedEntrance,
  InteractivePressable,
} from '../components/ui/MotionPrimitives';
import { PillButton } from '../components/ui/PillButton';
import { useVybra } from '../context/VybraContext';
import {
  CHECKIN_DETAILS,
  PACE_TREND_POINTS,
  TONE_PROFILES,
  WEEKLY_VOLUME,
} from '../data/mockData';
import { FONTS, RADII, SHADOWS } from '../theme/tokens';
import { CheckInState } from '../types/vybra';

const MOOD_OPTIONS: CheckInState['mood'][] = ['Ótimo', 'Normal', 'Cansado', 'Pesado'];

export function OverviewScreen() {
  const insets = useSafeAreaInsets();
  const {
    theme,
    userName,
    agentTone,
    checkIn,
    activities,
    reducedMotion,
    updateCheckIn,
    navigateToTab,
    selectActivity,
    triggerSamplePush,
    sendChatMessage,
  } = useVybra();

  const [moodTrackWidth, setMoodTrackWidth] = useState(0);

  const firstName = userName.split(' ')[0] || 'Atleta';
  const toneData = TONE_PROFILES[agentTone];
  const latestActivity = activities[0];
  const currentCheckInPlan = CHECKIN_DETAILS[checkIn.mood];

  const moodIdx = Math.max(0, MOOD_OPTIONS.indexOf(checkIn.mood));
  const moodSlotW =
    moodTrackWidth > 0 ? (moodTrackWidth - 8) / MOOD_OPTIONS.length : 0;

  const moodPillX = useSharedValue(0);
  const planOpacity = useSharedValue(1);
  const planTranslateY = useSharedValue(0);

  useEffect(() => {
    if (moodSlotW <= 0) return;
    const target = moodIdx * moodSlotW;
    if (reducedMotion) {
      moodPillX.value = target;
      return;
    }
    moodPillX.value = withTiming(target, {
      duration: 210,
      easing: Easing.out(Easing.cubic),
    });
  }, [moodIdx, moodPillX, moodSlotW, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    planOpacity.value = withSequence(
      withTiming(0.45, { duration: 0 }),
      withTiming(1, {
        duration: 210,
        easing: Easing.out(Easing.cubic),
      })
    );
    planTranslateY.value = withSequence(
      withTiming(6, { duration: 0 }),
      withTiming(0, {
        duration: 210,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [checkIn.mood, checkIn.difficultDayActive, planOpacity, planTranslateY, reducedMotion]);

  const moodIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: moodPillX.value }],
  }));

  const planFeedbackStyle = useAnimatedStyle(() => ({
    opacity: planOpacity.value,
    transform: [{ translateY: planTranslateY.value }],
  }));

  const handleMoodLayout = (e: LayoutChangeEvent) => {
    setMoodTrackWidth(e.nativeEvent.layout.width);
  };

  const handleCheckInAction = () => {
    if (checkIn.mood === 'Pesado' || checkIn.difficultDayActive) {
      sendChatMessage('Hoje o dia está pesado, quero adaptar meu treino sem perder a sequência.');
      navigateToTab('chat');
      return;
    }
    navigateToTab('workout');
  };

  const cardShadow = theme.useNeonGlow ? SHADOWS.neonCard : SHADOWS.card;
  const accentTextColor = theme.isLight ? theme.colors.primary : theme.colors.secondary;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top + 12, 20) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header limpo */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <VybraWordmark compact height={24} />
          <Text style={[styles.greeting, { color: theme.colors.textPrimary }]}>
            Olá, {firstName}
          </Text>
        </View>
        <InteractivePressable
          onPress={triggerSamplePush}
          style={[
            styles.bellBtn,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
            theme.isLight ? SHADOWS.card : undefined,
          ]}
          accessibilityLabel="Simular notificação do Vybra"
          testID="simulate-push-btn"
        >
          <Bell size={19} color={theme.colors.textPrimary} />
          <View
            style={[
              styles.bellDot,
              {
                backgroundColor: theme.colors.secondary,
                borderColor: theme.colors.surface,
              },
            ]}
          />
        </InteractivePressable>
      </View>

      {/* Card principal do Agente Vybra */}
      <AnimatedEntrance delay={35} reducedMotion={reducedMotion}>
        <LinearGradient
          colors={theme.gradients.surfaceHighlight}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.agentCard,
            { borderColor: theme.isLight ? theme.colors.border : theme.colors.borderAccent },
            cardShadow,
          ]}
        >
          <View style={styles.agentTopRow}>
            <View style={styles.agentIdentity}>
              <VybraIconMark size={42} glow />
              <View style={styles.agentNameCol}>
                <Text style={[styles.agentName, { color: theme.colors.textPrimary }]}>
                  Vybra · Tom {toneData.label}
                </Text>
                <Text style={[styles.agentStatus, { color: theme.colors.textSecondary }]}>
                  Agente pessoal de corrida e rotina
                </Text>
              </View>
            </View>
            <InteractivePressable
              onPress={() => navigateToTab('settings')}
              style={styles.toneLinkBtn}
              accessibilityLabel="Trocar tom do agente"
            >
              <Text style={[styles.toneLinkText, { color: accentTextColor }]}>
                Ajustar tom
              </Text>
              <ChevronRight size={14} color={accentTextColor} />
            </InteractivePressable>
          </View>

          <Text style={[styles.agentPrompt, { color: theme.colors.textPrimary }]}>
            {checkIn.difficultDayActive
              ? toneData.difficultDayReply
              : toneData.overviewPrompt}
          </Text>
          <Text style={[styles.agentSubtext, { color: theme.colors.textSecondary }]}>
            {checkIn.difficultDayActive
              ? 'Sua sequência de 12 dias está protegida hoje — descansar quando o corpo pede também é evolução.'
              : toneData.overviewSubtext}
          </Text>

          <View style={styles.agentActions}>
            <PillButton
              label="Abrir chat"
              onPress={() => navigateToTab('chat')}
              style={styles.agentCta}
              accessibilityLabel="Responder no chat"
              testID="overview-open-chat-btn"
            />
            <InteractivePressable
              onPress={() => {
                const nextActive = !checkIn.difficultDayActive;
                updateCheckIn({
                  difficultDayActive: nextActive,
                  mood: nextActive ? 'Pesado' : 'Normal',
                });
              }}
              style={[
                styles.difficultBtn,
                {
                  backgroundColor: checkIn.difficultDayActive
                    ? theme.colors.primarySoft
                    : theme.colors.surfaceMuted,
                  borderColor: checkIn.difficultDayActive
                    ? theme.colors.borderAccent
                    : theme.colors.border,
                },
              ]}
              accessibilityState={{ selected: checkIn.difficultDayActive }}
              testID="difficult-day-toggle"
            >
              <HeartHandshake
                size={16}
                color={checkIn.difficultDayActive ? accentTextColor : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.difficultLabel,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {checkIn.difficultDayActive ? 'Acolhimento ativo' : 'Dia difícil'}
              </Text>
            </InteractivePressable>
          </View>
        </LinearGradient>
      </AnimatedEntrance>

      {/* Check-in de Hoje sem Sono desalinhado e sem bordas genéricas */}
      <AnimatedEntrance delay={80} reducedMotion={reducedMotion}>
        <LinearGradient
          colors={theme.gradients.cardDepth}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.sectionCard,
            { borderColor: theme.colors.border },
            theme.isLight ? SHADOWS.card : undefined,
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              CHECK-IN DE HOJE
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
              Toque no seu estado para o Vybra ajustar o dia
            </Text>
          </View>

          <View
            style={[
              styles.moodTrack,
              {
                backgroundColor: theme.isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.04)',
                borderColor: theme.colors.border,
              },
            ]}
            onLayout={handleMoodLayout}
          >
            {moodSlotW > 0 ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.moodActivePill,
                  { width: moodSlotW },
                  moodIndicatorStyle,
                ]}
              >
                <LinearGradient
                  colors={theme.gradients.brandButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.moodActiveGrad}
                />
              </Animated.View>
            ) : null}

            {MOOD_OPTIONS.map((mood) => {
              const active = checkIn.mood === mood;
              return (
                <InteractivePressable
                  key={mood}
                  scaleTo={0.96}
                  onPress={() => {
                    updateCheckIn({
                      mood,
                      difficultDayActive: mood === 'Pesado',
                    });
                  }}
                  style={styles.moodChip}
                  accessibilityState={{ selected: active }}
                  testID={`checkin-mood-${mood.toLowerCase()}`}
                >
                  <Text
                    style={[
                      styles.moodText,
                      {
                        color: active ? theme.colors.onPrimary : theme.colors.textSecondary,
                        fontFamily: active ? FONTS.bold : FONTS.medium,
                      },
                    ]}
                  >
                    {mood}
                  </Text>
                </InteractivePressable>
              );
            })}
          </View>

          <Animated.View
            style={[
              styles.checkInResponseBox,
              {
                backgroundColor: theme.isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.03)',
                borderColor: theme.colors.border,
              },
              planFeedbackStyle,
            ]}
          >
            <View style={styles.responseTopRow}>
              <View style={styles.responseBadgeWrap}>
                <ShieldCheck size={14} color={accentTextColor} />
                <Text style={[styles.responseBadgeText, { color: accentTextColor }]}>
                  {currentCheckInPlan.badge}
                </Text>
              </View>
              <Text style={[styles.intensityLabel, { color: theme.colors.textSecondary }]}>
                {currentCheckInPlan.intensityTag}
              </Text>
            </View>

            <Text style={[styles.responseHeadline, { color: theme.colors.textPrimary }]}>
              {currentCheckInPlan.headline}
            </Text>
            <Text style={[styles.responseDetail, { color: theme.colors.textSecondary }]}>
              {currentCheckInPlan.detail}
            </Text>

            <InteractivePressable
              onPress={handleCheckInAction}
              style={[
                styles.plannedWorkoutBar,
                {
                  backgroundColor: theme.colors.primarySoft,
                  borderColor: theme.colors.border,
                },
              ]}
              testID="checkin-action-bar"
            >
              <View style={styles.plannedWorkoutTextCol}>
                <Text style={[styles.plannedWorkoutLabel, { color: accentTextColor }]}>
                  PLANO AJUSTADO PARA HOJE
                </Text>
                <Text style={[styles.plannedWorkoutValue, { color: theme.colors.textPrimary }]}>
                  {currentCheckInPlan.plannedWorkout}
                </Text>
              </View>
              <View style={styles.plannedWorkoutCta}>
                <Text style={[styles.plannedWorkoutCtaText, { color: theme.colors.textPrimary }]}>
                  {currentCheckInPlan.ctaLabel}
                </Text>
                <ArrowRight size={15} color={accentTextColor} />
              </View>
            </InteractivePressable>
          </Animated.View>
        </LinearGradient>
      </AnimatedEntrance>

      {/* Meta da semana + KPIs (81% da meta, Sequência, Melhor pace mantidos) */}
      <AnimatedEntrance delay={125} reducedMotion={reducedMotion}>
        <LinearGradient
          colors={theme.gradients.cardDepth}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.summaryCard,
            { borderColor: theme.colors.border },
            theme.isLight ? SHADOWS.card : undefined,
          ]}
        >
          <ConsistencyRing
            progress={0.81}
            centerValue="81%"
            centerUnit="da meta"
            size={104}
          />
          <View style={styles.summaryStats}>
            <View style={styles.kpiRow}>
              <InteractivePressable
                onPress={() => navigateToTab('metrics')}
                style={[
                  styles.kpiBox,
                  {
                    backgroundColor: theme.isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.03)',
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.kpiLabelRow}>
                  <Flame size={14} color={accentTextColor} />
                  <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>
                    Sequência
                  </Text>
                </View>
                <Text style={[styles.kpiValue, { color: theme.colors.textPrimary }]}>
                  12 dias
                </Text>
              </InteractivePressable>
              <InteractivePressable
                onPress={() => navigateToTab('metrics')}
                style={[
                  styles.kpiBox,
                  {
                    backgroundColor: theme.isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.03)',
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.kpiLabelRow}>
                  <TrendingUp size={14} color={theme.colors.success} />
                  <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>
                    Melhor pace
                  </Text>
                </View>
                <Text style={[styles.kpiValue, { color: theme.colors.textPrimary }]}>
                  4:52 /km
                </Text>
              </InteractivePressable>
            </View>
            <View style={styles.goalFooter}>
              <Text style={[styles.goalText, { color: theme.colors.textSecondary }]}>
                32,4 de 40,0 km nesta semana
              </Text>
              <InteractivePressable onPress={() => navigateToTab('workout')}>
                <Text style={[styles.goalAction, { color: accentTextColor }]}>
                  Treinar agora →
                </Text>
              </InteractivePressable>
            </View>
          </View>
        </LinearGradient>
      </AnimatedEntrance>

      {/* Gráfico 1: Volume da Semana */}
      <AnimatedEntrance delay={165} reducedMotion={reducedMotion}>
        <WeeklyVolumeChart data={WEEKLY_VOLUME} reducedMotion={reducedMotion} />
      </AnimatedEntrance>

      {/* Gráfico 2: Evolução do Pace */}
      <AnimatedEntrance delay={205} reducedMotion={reducedMotion}>
        <PaceTrendChart points={PACE_TREND_POINTS} />
      </AnimatedEntrance>

      {/* Última atividade registrada */}
      {latestActivity ? (
        <AnimatedEntrance delay={245} reducedMotion={reducedMotion}>
          <InteractivePressable
            onPress={() => selectActivity(latestActivity)}
            style={styles.activityCardWrap}
            accessibilityLabel={`Abrir detalhes de ${latestActivity.title}`}
            testID="overview-latest-activity"
          >
            <LinearGradient
              colors={theme.gradients.cardDepth}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.activityCard,
                { borderColor: theme.colors.border },
                theme.isLight ? SHADOWS.card : undefined,
              ]}
            >
              <View style={styles.activityHeader}>
                <View style={styles.activityLeft}>
                  <LinearGradient
                    colors={theme.gradients.brandButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sportTile}
                  >
                    <SportIcon
                      sport={latestActivity.sport}
                      size={19}
                      color={theme.colors.onPrimary}
                      accentColor={theme.colors.onPrimary}
                    />
                  </LinearGradient>
                  <View style={styles.activityTitleCol}>
                    <Text style={[styles.activityTitle, { color: theme.colors.textPrimary }]}>
                      {latestActivity.title}
                    </Text>
                    <Text style={[styles.activityDate, { color: theme.colors.textSecondary }]}>
                      {latestActivity.dateLabel} · {latestActivity.timeLabel}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={accentTextColor} />
              </View>

              <RoutePreviewMap
                routePath={latestActivity.routePath}
                height={142}
                reducedMotion={reducedMotion}
                subtitle={latestActivity.comparisonHeadline}
              />

              <View style={styles.activityMetricsRow}>
                <View style={styles.metricCell}>
                  <Text style={[styles.metricCellLabel, { color: theme.colors.textSecondary }]}>
                    Distância
                  </Text>
                  <Text style={[styles.metricCellVal, { color: theme.colors.textPrimary }]}>
                    {latestActivity.distanceKm.toFixed(2)} km
                  </Text>
                </View>
                <View style={styles.metricCell}>
                  <Text style={[styles.metricCellLabel, { color: theme.colors.textSecondary }]}>
                    Pace médio
                  </Text>
                  <Text style={[styles.metricCellVal, { color: accentTextColor }]}>
                    {latestActivity.paceLabel}
                  </Text>
                </View>
                <View style={styles.metricCell}>
                  <Text style={[styles.metricCellLabel, { color: theme.colors.textSecondary }]}>
                    Altimetria
                  </Text>
                  <Text style={[styles.metricCellVal, { color: theme.colors.textPrimary }]}>
                    +{latestActivity.elevationGainM} m
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </InteractivePressable>
        </AnimatedEntrance>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    gap: 4,
  },
  greeting: {
    fontFamily: FONTS.extraBold,
    fontSize: 25,
    letterSpacing: -0.4,
    marginTop: 2,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  agentCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  agentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  agentIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    flex: 1,
  },
  agentNameCol: {
    flex: 1,
  },
  agentName: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  agentStatus: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: 1,
  },
  toneLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingLeft: 6,
  },
  toneLinkText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
  },
  agentPrompt: {
    fontFamily: FONTS.semiBold,
    fontSize: 15.5,
    lineHeight: 22,
  },
  agentSubtext: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  agentActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  agentCta: {
    flex: 1,
    minWidth: 136,
  },
  difficultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 7,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: RADII.pill,
    borderWidth: 1,
  },
  difficultLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
  },
  sectionCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sectionHeader: {
    gap: 2,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  sectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
  },
  moodTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 15,
    borderWidth: 1,
    position: 'relative',
  },
  moodActivePill: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    borderRadius: 11,
    overflow: 'hidden',
  },
  moodActiveGrad: {
    flex: 1,
    borderRadius: 11,
  },
  moodChip: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  moodText: {
    fontSize: 12.5,
  },
  checkInResponseBox: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 14,
    gap: 9,
  },
  responseTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 8,
    rowGap: 4,
  },
  responseBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
    minWidth: 0,
  },
  responseBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    flexShrink: 1,
  },
  intensityLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    flexShrink: 0,
  },
  responseHeadline: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    lineHeight: 20,
  },
  responseDetail: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    lineHeight: 18,
  },
  plannedWorkoutBar: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 8,
    borderRadius: RADII.sm,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: 2,
  },
  plannedWorkoutTextCol: {
    gap: 3,
  },
  plannedWorkoutLabel: {
    fontFamily: FONTS.bold,
    fontSize: 9.5,
    letterSpacing: 1,
  },
  plannedWorkoutValue: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  plannedWorkoutCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingTop: 2,
  },
  plannedWorkoutCtaText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
  },
  summaryCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryStats: {
    flex: 1,
    gap: 12,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiBox: {
    flex: 1,
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 11,
    gap: 5,
  },
  kpiLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  kpiLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
  },
  kpiValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 16,
  },
  goalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  goalText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  goalAction: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
  },
  activityCardWrap: {
    borderRadius: RADII.lg,
  },
  activityCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sportTile: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitleCol: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  activityDate: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: 2,
  },
  activityMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  metricCell: {
    flex: 1,
    gap: 2,
  },
  metricCellLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
  },
  metricCellVal: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
});
