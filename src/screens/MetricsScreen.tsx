import { LinearGradient } from 'expo-linear-gradient';
import { Award, Check, ChevronRight, Mountain, Timer, Zap } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SportIcon, TrophyIcon } from '../components/brand/SportIcons';
import {
  ElevationProfileChart,
  PaceTrendChart,
  RoutePreviewMap,
} from '../components/charts/Charts';
import {
  AnimatedProgressBar,
  InteractivePressable,
} from '../components/ui/MotionPrimitives';
import { useVybra } from '../context/VybraContext';
import { PACE_TREND_POINTS, PERSONAL_RECORDS } from '../data/mockData';
import { FONTS, RADII, SHADOWS } from '../theme/tokens';
import { SportType } from '../types/vybra';
import { triggerLightHaptic, triggerSelectionHaptic } from '../utils/haptics';

type MetricsSubTab = 'evolution' | 'activities' | 'achievements';

const SUB_TABS: Array<{ key: MetricsSubTab; label: string }> = [
  { key: 'evolution', label: 'Evolução' },
  { key: 'activities', label: 'Atividades' },
  { key: 'achievements', label: 'Conquistas' },
];

const SPORT_FILTERS: Array<{ key: 'all' | SportType; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'corrida', label: 'Corrida' },
  { key: 'ciclismo', label: 'Ciclismo' },
  { key: 'treino', label: 'Treino' },
  { key: 'caminhada', label: 'Caminhada' },
  { key: 'trilha', label: 'Trilha' },
  { key: 'natacao', label: 'Natação' },
];

export function MetricsScreen() {
  const insets = useSafeAreaInsets();
  const {
    theme,
    activities,
    achievements,
    reducedMotion,
    selectActivity,
    toggleAiChallenge,
    showStatusBanner,
  } = useVybra();

  const [subTab, setSubTab] = useState<MetricsSubTab>('evolution');
  const [sportFilter, setSportFilter] = useState<'all' | SportType>('all');
  const [segWidth, setSegWidth] = useState(0);

  const subTabIdx = SUB_TABS.findIndex((t) => t.key === subTab);
  const slotW = segWidth > 0 ? (segWidth - 8) / SUB_TABS.length : 0;
  const pillX = useSharedValue(0);
  const tabContentOpacity = useSharedValue(1);
  const tabContentY = useSharedValue(0);

  useEffect(() => {
    if (slotW <= 0) return;
    const target = subTabIdx * slotW;
    if (reducedMotion) {
      pillX.value = target;
      return;
    }
    pillX.value = withTiming(target, {
      duration: 210,
      easing: Easing.out(Easing.cubic),
    });
  }, [pillX, reducedMotion, slotW, subTabIdx]);

  useEffect(() => {
    if (reducedMotion) {
      tabContentOpacity.value = 1;
      tabContentY.value = 0;
      return;
    }
    tabContentOpacity.value = withSequence(
      withTiming(0.6, { duration: 0 }),
      withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      })
    );
    tabContentY.value = withSequence(
      withTiming(6, { duration: 0 }),
      withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [reducedMotion, subTab, sportFilter, tabContentOpacity, tabContentY]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  const tabBodyAnimStyle = useAnimatedStyle(() => ({
    opacity: tabContentOpacity.value,
    transform: [{ translateY: tabContentY.value }],
  }));

  const handleSegLayout = (e: LayoutChangeEvent) => {
    setSegWidth(e.nativeEvent.layout.width);
  };

  const filteredActivities =
    sportFilter === 'all'
      ? activities
      : activities.filter((a) => a.sport === sportFilter);

  const accentTextColor = theme.isLight ? theme.colors.primary : theme.colors.secondary;
  const cardShadow = theme.isLight ? SHADOWS.card : undefined;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top + 14, 24) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Você contra você
        </Text>
      </View>

      {/* Segmented control firme (sem efeito estilingue) */}
      <View
        style={[
          styles.segmentTrack,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
          cardShadow,
        ]}
        onLayout={handleSegLayout}
      >
        {slotW > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.segmentActiveWrap, { width: slotW }, indicatorStyle]}
          >
            <LinearGradient
              colors={theme.gradients.brandButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.segmentActiveGrad}
            />
          </Animated.View>
        ) : null}

        {SUB_TABS.map((tab) => {
          const active = subTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                triggerSelectionHaptic();
                setSubTab(tab.key);
              }}
              style={styles.segmentBtn}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              testID={`metrics-subtab-${tab.key}`}
            >
              <Text
                style={[
                  styles.segmentText,
                  {
                    color: active ? theme.colors.onPrimary : theme.colors.textSecondary,
                    fontFamily: active ? FONTS.bold : FONTS.medium,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Animated.View style={tabBodyAnimStyle}>
        {subTab === 'evolution' ? (
          <View style={styles.stack}>
            {/* Grade 2x2 alinhada de KPIs */}
            <View style={styles.kpiGrid}>
              <InteractivePressable
                onPress={() =>
                  showStatusBanner('Pace médio caiu 14s/km nos últimos 30 dias.')
                }
                style={styles.kpiCardWrap}
                scaleDown={0.97}
              >
                <LinearGradient
                  colors={theme.gradients.cardDepth}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.kpiCard, { borderColor: theme.colors.border }, cardShadow]}
                >
                  <View style={styles.kpiIconRow}>
                    <Timer size={15} color={accentTextColor} />
                    <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>
                      Pace médio
                    </Text>
                  </View>
                  <Text style={[styles.kpiVal, { color: theme.colors.textPrimary }]}>
                    4:56 /km
                  </Text>
                  <Text style={[styles.kpiDeltaPos, { color: theme.colors.success }]}>
                    -14s vs mês anterior
                  </Text>
                </LinearGradient>
              </InteractivePressable>

              <InteractivePressable
                onPress={() =>
                  showStatusBanner('639 m de ganho acumulado em 4 sessões.')
                }
                style={styles.kpiCardWrap}
                scaleDown={0.97}
              >
                <LinearGradient
                  colors={theme.gradients.cardDepth}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.kpiCard, { borderColor: theme.colors.border }, cardShadow]}
                >
                  <View style={styles.kpiIconRow}>
                    <Mountain size={15} color={accentTextColor} />
                    <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>
                      Altimetria
                    </Text>
                  </View>
                  <Text style={[styles.kpiVal, { color: theme.colors.textPrimary }]}>
                    639 m
                  </Text>
                  <Text style={[styles.kpiDeltaNeutral, { color: theme.colors.textSecondary }]}>
                    Últimos 7 dias
                  </Text>
                </LinearGradient>
              </InteractivePressable>

              <InteractivePressable
                onPress={() =>
                  showStatusBanner('VO2 estimado em 51,4 ml/kg/min (faixa excelente).')
                }
                style={styles.kpiCardWrap}
                scaleDown={0.97}
              >
                <LinearGradient
                  colors={theme.gradients.cardDepth}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.kpiCard, { borderColor: theme.colors.border }, cardShadow]}
                >
                  <View style={styles.kpiIconRow}>
                    <Zap size={15} color={accentTextColor} />
                    <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>
                      VO2 estimado
                    </Text>
                  </View>
                  <Text style={[styles.kpiVal, { color: theme.colors.textPrimary }]}>
                    51,4
                  </Text>
                  <Text style={[styles.kpiDeltaPos, { color: theme.colors.success }]}>
                    +1,8 em 30 dias
                  </Text>
                </LinearGradient>
              </InteractivePressable>

              <InteractivePressable
                onPress={() =>
                  showStatusBanner('118,4 km acumulados em 14 atividades no mês.')
                }
                style={styles.kpiCardWrap}
                scaleDown={0.97}
              >
                <LinearGradient
                  colors={theme.gradients.cardDepth}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.kpiCard, { borderColor: theme.colors.border }, cardShadow]}
                >
                  <View style={styles.kpiIconRow}>
                    <Award size={15} color={accentTextColor} />
                    <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>
                      Volume mês
                    </Text>
                  </View>
                  <Text style={[styles.kpiVal, { color: theme.colors.textPrimary }]}>
                    118,4 km
                  </Text>
                  <Text style={[styles.kpiDeltaNeutral, { color: theme.colors.textSecondary }]}>
                    14 atividades
                  </Text>
                </LinearGradient>
              </InteractivePressable>
            </View>

            <PaceTrendChart points={PACE_TREND_POINTS} />

            <ElevationProfileChart
              values={[12, 24, 48, 38, 65, 92, 84, 118, 104, 132]}
              gainLabel="+639 m acumulados"
            />

            {/* Comparação causal */}
            <LinearGradient
              colors={theme.gradients.cardDepth}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, { borderColor: theme.colors.border }, cardShadow]}
            >
              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                Comparativo de ritmo
              </Text>
              <View style={styles.compareRow}>
                <View style={styles.compareCol}>
                  <Text style={[styles.compareLabel, { color: theme.colors.textSecondary }]}>
                    Sexta
                  </Text>
                  <Text style={[styles.compareVal, { color: theme.colors.textPrimary }]}>
                    4:58 /km
                  </Text>
                </View>
                <View
                  style={[
                    styles.compareCol,
                    styles.compareColHighlight,
                    {
                      backgroundColor: theme.colors.primarySoft,
                      borderColor: theme.colors.borderAccent,
                    },
                  ]}
                >
                  <Text style={[styles.compareLabel, { color: theme.colors.textSecondary }]}>
                    Sábado
                  </Text>
                  <Text style={[styles.compareVal, { color: accentTextColor }]}>
                    4:52 /km
                  </Text>
                </View>
                <View style={styles.compareCol}>
                  <Text style={[styles.compareLabel, { color: theme.colors.textSecondary }]}>
                    Média 4 sem.
                  </Text>
                  <Text style={[styles.compareVal, { color: theme.colors.textPrimary }]}>
                    5:06 /km
                  </Text>
                </View>
              </View>
              <Text style={[styles.cardNote, { color: theme.colors.textSecondary }]}>
                Sono acima de 7h30 e temperatura amena explicam a queda de 14s/km sem aumento de esforço.
              </Text>
            </LinearGradient>

            {/* Recordes Pessoais */}
            <LinearGradient
              colors={theme.gradients.cardDepth}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, { borderColor: theme.colors.border }, cardShadow]}
            >
              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                Recordes pessoais
              </Text>
              <View style={styles.prList}>
                {PERSONAL_RECORDS.map((pr) => (
                  <InteractivePressable
                    key={pr.distance}
                    onPress={() =>
                      showStatusBanner(
                        `Recorde de ${pr.distance}: ${pr.time} (${pr.improvement})`
                      )
                    }
                    style={[styles.prRow, { borderTopColor: theme.colors.border }]}
                    scaleDown={0.98}
                  >
                    <LinearGradient
                      colors={theme.gradients.brandButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.prDistBox}
                    >
                      <Text style={[styles.prDist, { color: theme.colors.onPrimary }]}>
                        {pr.distance}
                      </Text>
                    </LinearGradient>
                    <View style={styles.prMid}>
                      <Text style={[styles.prTime, { color: theme.colors.textPrimary }]}>
                        {pr.time}
                      </Text>
                      <Text style={[styles.prMeta, { color: theme.colors.textSecondary }]}>
                        {pr.pace} · {pr.date}
                      </Text>
                    </View>
                    <Text style={[styles.prDelta, { color: theme.colors.success }]}>
                      {pr.improvement}
                    </Text>
                  </InteractivePressable>
                ))}
              </View>
            </LinearGradient>
          </View>
        ) : null}

        {subTab === 'activities' ? (
          <View style={styles.stack}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {SPORT_FILTERS.map((f) => {
                const active = sportFilter === f.key;
                return (
                  <InteractivePressable
                    key={f.key}
                    onPress={() => {
                      triggerSelectionHaptic();
                      setSportFilter(f.key);
                    }}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    scaleDown={0.95}
                  >
                    {active ? (
                      <LinearGradient
                        colors={theme.gradients.brandButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    ) : null}
                    <Text
                      style={[
                        styles.filterText,
                        {
                          color: active ? theme.colors.onPrimary : theme.colors.textSecondary,
                          fontFamily: active ? FONTS.bold : FONTS.medium,
                        },
                      ]}
                    >
                      {f.label}
                    </Text>
                  </InteractivePressable>
                );
              })}
            </ScrollView>

            {filteredActivities.length === 0 ? (
              <View
                style={[
                  styles.emptyState,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                  Sem registros nessa modalidade
                </Text>
                <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
                  Inicie um treino na aba Treinar para vê-lo listado aqui.
                </Text>
              </View>
            ) : (
              filteredActivities.map((act) => (
                <InteractivePressable
                  key={act.id}
                  onPress={() => {
                    triggerLightHaptic();
                    selectActivity(act);
                  }}
                  accessibilityRole="button"
                  testID={`activity-item-${act.id}`}
                  scaleDown={0.985}
                >
                  <LinearGradient
                    colors={theme.gradients.cardDepth}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.activityCard, { borderColor: theme.colors.border }, cardShadow]}
                  >
                    <View style={styles.actHeader}>
                      <View style={styles.actLeft}>
                        <View
                          style={[
                            styles.actIconTile,
                            {
                              backgroundColor: theme.colors.primarySoft,
                              borderColor: theme.colors.border,
                            },
                          ]}
                        >
                          <SportIcon
                            sport={act.sport}
                            size={18}
                            color={theme.colors.textPrimary}
                            accentColor={accentTextColor}
                          />
                        </View>
                        <View style={styles.actTitleBlock}>
                          <Text
                            style={[styles.actTitle, { color: theme.colors.textPrimary }]}
                            numberOfLines={1}
                          >
                            {act.title}
                          </Text>
                          <Text style={[styles.actDate, { color: theme.colors.textSecondary }]}>
                            {act.dateLabel} · {act.timeLabel}
                          </Text>
                        </View>
                      </View>
                      <ChevronRight size={18} color={accentTextColor} />
                    </View>

                    {act.distanceKm > 0 ? (
                      <RoutePreviewMap
                        routePath={act.routePath}
                        height={110}
                        reducedMotion={reducedMotion}
                      />
                    ) : null}

                    <View style={styles.actMetrics}>
                      <View style={styles.actStat}>
                        <Text style={[styles.actStatLabel, { color: theme.colors.textSecondary }]}>
                          {act.distanceKm > 0 ? 'Distância' : 'Duração'}
                        </Text>
                        <Text style={[styles.actStatVal, { color: theme.colors.textPrimary }]}>
                          {act.distanceKm > 0
                            ? `${act.distanceKm.toFixed(2)} km`
                            : act.durationLabel}
                        </Text>
                      </View>
                      <View style={styles.actStat}>
                        <Text style={[styles.actStatLabel, { color: theme.colors.textSecondary }]}>
                          Ritmo
                        </Text>
                        <Text style={[styles.actStatVal, { color: accentTextColor }]}>
                          {act.paceLabel}
                        </Text>
                      </View>
                      <View style={styles.actStat}>
                        <Text style={[styles.actStatLabel, { color: theme.colors.textSecondary }]}>
                          Elevação
                        </Text>
                        <Text style={[styles.actStatVal, { color: theme.colors.textPrimary }]}>
                          +{act.elevationGainM} m
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </InteractivePressable>
              ))
            )}
          </View>
        ) : null}

        {subTab === 'achievements' ? (
          <View style={styles.stack}>
            {achievements.map((ach) => (
              <LinearGradient
                key={ach.id}
                colors={
                  ach.unlocked ? theme.gradients.surfaceHighlight : theme.gradients.cardDepth
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.achCard,
                  {
                    borderColor: ach.unlocked
                      ? theme.colors.borderAccent
                      : theme.colors.border,
                  },
                  cardShadow,
                ]}
              >
                <View style={styles.achTop}>
                  <View style={styles.achTitleWrap}>
                    <Text style={[styles.achCategory, { color: accentTextColor }]}>
                      {ach.category}
                    </Text>
                    <Text style={[styles.achTitle, { color: theme.colors.textPrimary }]}>
                      {ach.title}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.achIconBox,
                      {
                        backgroundColor: ach.unlocked
                          ? theme.colors.primary
                          : theme.colors.surfaceMuted,
                      },
                    ]}
                  >
                    {ach.unlocked ? (
                      <Check size={17} color={theme.colors.onPrimary} strokeWidth={2.8} />
                    ) : (
                      <TrophyIcon size={18} color={accentTextColor} />
                    )}
                  </View>
                </View>

                <Text style={[styles.achDesc, { color: theme.colors.textSecondary }]}>
                  {ach.description}
                </Text>

                <View style={styles.achProgressBlock}>
                  <AnimatedProgressBar
                    progress={ach.progress}
                    height={7}
                    reducedMotion={reducedMotion}
                  />
                  <Text style={[styles.achProgressLabel, { color: theme.colors.textSecondary }]}>
                    {ach.progressLabel}
                  </Text>
                </View>

                {ach.isAiSuggested ? (
                  <View style={styles.aiSuggestRow}>
                    <InteractivePressable
                      onPress={() => {
                        triggerLightHaptic();
                        toggleAiChallenge(true);
                      }}
                      style={[
                        styles.aiChoiceBtn,
                        {
                          backgroundColor:
                            ach.aiAccepted === true
                              ? theme.colors.primary
                              : theme.colors.surfaceMuted,
                          borderColor:
                            ach.aiAccepted === true
                              ? theme.colors.primary
                              : theme.colors.border,
                        },
                      ]}
                      scaleDown={0.96}
                    >
                      <Text
                        style={[
                          styles.aiChoiceText,
                          {
                            color:
                              ach.aiAccepted === true
                                ? theme.colors.onPrimary
                                : theme.colors.textPrimary,
                          },
                        ]}
                      >
                        {ach.aiAccepted ? 'Desafio aceito' : 'Aceitar desafio'}
                      </Text>
                    </InteractivePressable>
                    <InteractivePressable
                      onPress={() => {
                        triggerSelectionHaptic();
                        toggleAiChallenge(false);
                      }}
                      style={styles.aiDismissBtn}
                      scaleDown={0.96}
                    >
                      <Text style={[styles.aiDismissText, { color: theme.colors.textSecondary }]}>
                        Agora não
                      </Text>
                    </InteractivePressable>
                  </View>
                ) : null}
              </LinearGradient>
            ))}
          </View>
        ) : null}
      </Animated.View>
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
    gap: 2,
  },
  title: {
    fontFamily: FONTS.extraBold,
    fontSize: 26,
    letterSpacing: -0.4,
  },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: RADII.pill,
    borderWidth: 1,
    padding: 4,
    position: 'relative',
  },
  segmentActiveWrap: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    borderRadius: RADII.pill,
    overflow: 'hidden',
  },
  segmentActiveGrad: {
    flex: 1,
    borderRadius: RADII.pill,
  },
  segmentBtn: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADII.pill,
  },
  segmentText: {
    fontSize: 13,
  },
  stack: {
    gap: 14,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  kpiCardWrap: {
    width: '48.2%',
  },
  kpiCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  kpiIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kpiLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  kpiVal: {
    fontFamily: FONTS.extraBold,
    fontSize: 20,
    letterSpacing: -0.3,
  },
  kpiDeltaPos: {
    fontFamily: FONTS.semiBold,
    fontSize: 11.5,
  },
  kpiDeltaNeutral: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
  },
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  compareRow: {
    flexDirection: 'row',
    gap: 8,
  },
  compareCol: {
    flex: 1,
    borderRadius: RADII.md,
    padding: 10,
    gap: 3,
    alignItems: 'center',
  },
  compareColHighlight: {
    borderWidth: 1,
  },
  compareLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
  },
  compareVal: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  cardNote: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    lineHeight: 18,
  },
  prList: {
    gap: 8,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  prDistBox: {
    minWidth: 52,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  prDist: {
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  prMid: {
    flex: 1,
    gap: 1,
  },
  prTime: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  prMeta: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
  },
  prDelta: {
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  filterRow: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    borderWidth: 1,
    overflow: 'hidden',
  },
  filterText: {
    fontSize: 12.5,
  },
  emptyState: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  emptyDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    textAlign: 'center',
  },
  activityCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 15,
    gap: 12,
  },
  actHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  actLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    flex: 1,
  },
  actIconTile: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actTitleBlock: {
    flex: 1,
    gap: 1,
  },
  actTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
  },
  actDate: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  actMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actStat: {
    flex: 1,
    gap: 2,
  },
  actStatLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
  },
  actStatVal: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
  },
  achCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 11,
  },
  achTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  achTitleWrap: {
    flex: 1,
    gap: 2,
  },
  achCategory: {
    fontFamily: FONTS.bold,
    fontSize: 10.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  achTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
  },
  achIconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  achProgressBlock: {
    gap: 6,
  },
  achProgressLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
  },
  aiSuggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  aiChoiceBtn: {
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  aiChoiceText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
  },
  aiDismissBtn: {
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  aiDismissText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
  },
});
