import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  MessageSquare,
  Pause,
  Play,
  Send,
  Timer,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { RoutePreviewMap } from '../components/charts/Charts';
import { InteractivePressable } from '../components/ui/MotionPrimitives';
import { PillButton } from '../components/ui/PillButton';
import { useVybra } from '../context/VybraContext';
import { SPORTS_META } from '../data/mockData';
import { FONTS, RADII, SHADOWS } from '../theme/tokens';
import { SportType } from '../types/vybra';

type WorkoutStatus = 'idle' | 'running' | 'paused' | 'finished';
type WorkoutStep = 'select' | 'session';

function formatTimer(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const {
    theme,
    favoriteSport,
    reducedMotion,
    workoutReports,
    addCompletedWorkout,
    sendWorkoutReport,
    clearWorkoutReports,
    navigateToTab,
    showStatusBanner,
  } = useVybra();

  const [step, setStep] = useState<WorkoutStep>('select');
  const [selectedSport, setSelectedSport] = useState<SportType>(favoriteSport);
  const [status, setStatus] = useState<WorkoutStatus>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [reportDraft, setReportDraft] = useState('');

  const sportMeta =
    SPORTS_META.find((item) => item.id === selectedSport) ?? SPORTS_META[0];
  const currentSportReports = workoutReports.filter(
    (item) => item.sport === selectedSport
  );

  const stepOpacity = useSharedValue(1);
  const stepTranslate = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    stepOpacity.value = withSequence(
      withTiming(0.75, { duration: 0 }),
      withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) })
    );
    stepTranslate.value = withSequence(
      withTiming(10, { duration: 0 }),
      withTiming(0, { duration: 180, easing: Easing.out(Easing.cubic) })
    );
  }, [reducedMotion, selectedSport, step, stepOpacity, stepTranslate]);

  useEffect(() => {
    if (status !== 'running') return;
    const interval = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
      if (!sportMeta.isGymWorkout) {
        const kmPerSec =
          selectedSport === 'ciclismo'
            ? 0.0082
            : selectedSport === 'natacao'
              ? 0.00055
              : selectedSport === 'caminhada'
                ? 0.0018
                : 0.0034;
        setDistanceKm((prev) => prev + kmPerSec);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedSport, sportMeta.isGymWorkout, status]);

  const stepAnimStyle = useAnimatedStyle(() => ({
    opacity: stepOpacity.value,
    transform: [{ translateY: stepTranslate.value }],
  }));

  const currentPaceLabel = (() => {
    if (sportMeta.isGymWorkout) {
      return `${Math.max(1, Math.round(elapsedSec / 60))} min`;
    }
    if (selectedSport === 'ciclismo') {
      return status === 'idle' ? '0,0 km/h' : '28,8 km/h';
    }
    if (selectedSport === 'natacao') {
      return status === 'idle' ? '-- /100m' : '1:45 /100m';
    }
    if (status === 'idle') return '-- /km';
    return selectedSport === 'caminhada' ? '9:12 /km' : '4:56 /km';
  })();

  const formattedVolume = (() => {
    if (selectedSport === 'natacao') {
      return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(2).replace('.', ',')} km`;
  })();

  const handleChooseSport = (sportId: SportType) => {
    setSelectedSport(sportId);
    setStatus('idle');
    setElapsedSec(0);
    setDistanceKm(0);
    setReportDraft('');
    clearWorkoutReports();
    setStep('session');
  };

  const handleBackToSelect = () => {
    if (status === 'running') {
      setStatus('paused');
      showStatusBanner('Cronômetro pausado. Escolha ou retome sua modalidade.');
    }
    setStep('select');
  };

  const handleStart = () => {
    if (status === 'idle' || status === 'finished') {
      setElapsedSec(0);
      setDistanceKm(sportMeta.isGymWorkout ? 0 : 0.02);
    }
    setStatus('running');
  };

  const handleFinish = () => {
    const finalDist = sportMeta.isGymWorkout
      ? 0
      : Math.max(distanceKm, selectedSport === 'natacao' ? 0.45 : 1.15);
    const finalSec = Math.max(elapsedSec, 95);
    const reportsText = currentSportReports.map((r) => r.text).join(' | ');

    setDistanceKm(finalDist);
    setElapsedSec(finalSec);
    setStatus('finished');

    addCompletedWorkout({
      sport: selectedSport,
      distanceKm: finalDist,
      durationSec: finalSec,
      paceLabel: currentPaceLabel === '-- /km' ? '4:56 /km' : currentPaceLabel,
      elevationGainM:
        selectedSport === 'trilha' ? 142 : sportMeta.isGymWorkout ? 0 : 34,
      reportSummary: reportsText || undefined,
    });
  };

  const handleSendReport = (textOverride?: string) => {
    const text = (textOverride ?? reportDraft).trim();
    if (!text) return;
    sendWorkoutReport(selectedSport, formatTimer(elapsedSec), text);
    if (!textOverride) setReportDraft('');
  };

  const accentTextColor = theme.isLight ? theme.colors.primary : theme.colors.secondary;
  const cardShadow = theme.isLight ? SHADOWS.card : undefined;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top + 14, 22) },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {step === 'select' ? (
        <Animated.View style={[styles.stepWrap, stepAnimStyle]}>
          <View style={styles.selectHeader}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Treinar
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Escolha a modalidade para iniciar sua sessão
            </Text>
          </View>

          <View style={styles.sportGrid}>
            {SPORTS_META.map((item) => (
              <View key={item.id} style={styles.sportGridCell}>
                <InteractivePressable
                  onPress={() => handleChooseSport(item.id)}
                  style={[
                    styles.sportCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                    cardShadow,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar ${item.label}`}
                  testID={`sport-select-${item.id}`}
                >
                  <View style={styles.sportCardTop}>
                    <LinearGradient
                      colors={theme.gradients.brandButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.sportIconTile}
                    >
                      <SportIcon
                        sport={item.id}
                        size={20}
                        color={theme.colors.onPrimary}
                        accentColor={theme.colors.onPrimary}
                      />
                    </LinearGradient>
                    <ChevronRight size={17} color={theme.colors.textMuted} />
                  </View>

                  <View style={styles.sportCardTextCol}>
                    <Text
                      style={[styles.sportCardTitle, { color: theme.colors.textPrimary }]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[styles.sportCardDesc, { color: theme.colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {item.shortDesc}
                    </Text>
                  </View>
                </InteractivePressable>
              </View>
            ))}
          </View>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.stepWrap, stepAnimStyle]}>
          {/* Header limpo da modalidade selecionada (sem TREINAR AGORA, sem GPS pronto) */}
          <View style={styles.sessionHeader}>
            <InteractivePressable
              onPress={handleBackToSelect}
              style={[
                styles.backBtn,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Voltar para escolha de modalidades"
              testID="workout-back-modalities"
            >
              <ChevronLeft size={18} color={theme.colors.textPrimary} />
              <Text style={[styles.backBtnText, { color: theme.colors.textPrimary }]}>
                Modalidades
              </Text>
            </InteractivePressable>

            <View style={styles.sessionSportBadge}>
              <SportIcon
                sport={sportMeta.id}
                size={18}
                color={accentTextColor}
                accentColor={accentTextColor}
              />
              <Text style={[styles.sessionSportTitle, { color: theme.colors.textPrimary }]}>
                {sportMeta.label}
              </Text>
            </View>
          </View>

          {/* Mapa apenas em modalidades externas com trajeto */}
          {sportMeta.hasMap ? (
            <RoutePreviewMap
              routePath={sportMeta.routePath}
              height={164}
              reducedMotion={reducedMotion}
              subtitle={sportMeta.locationLabel}
            />
          ) : null}

          {/* Card de Cronômetro + Telemetria limpa */}
          <LinearGradient
            colors={theme.gradients.cardDepth}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.timerCard,
              { borderColor: theme.colors.border },
              cardShadow,
            ]}
          >
            <View style={styles.timerTopRow}>
              <View style={styles.timerLabelRow}>
                <Timer size={15} color={accentTextColor} />
                <Text style={[styles.timerLabel, { color: theme.colors.textSecondary }]}>
                  {status === 'running'
                    ? 'EM ANDAMENTO'
                    : status === 'paused'
                      ? 'PAUSADO'
                      : status === 'finished'
                        ? 'SESSÃO CONCLUÍDA'
                        : 'CRONÔMETRO'}
                </Text>
              </View>
              {currentSportReports.length > 0 ? (
                <Text style={[styles.reportCounterText, { color: accentTextColor }]}>
                  {currentSportReports.length}{' '}
                  {currentSportReports.length === 1 ? 'reporte enviado' : 'reportes enviados'}
                </Text>
              ) : null}
            </View>

            <Text style={[styles.timerDigits, { color: theme.colors.textPrimary }]}>
              {formatTimer(elapsedSec)}
            </Text>

            {/* Telemetria específica por tipo de modalidade */}
            {sportMeta.isGymWorkout ? (
              <Text style={[styles.gymSubnote, { color: theme.colors.textSecondary }]}>
                Cronômetro livre para musculação e séries. Use o relatório abaixo para registrar exercícios, cargas e descansos.
              </Text>
            ) : (
              <View style={styles.metricsGrid}>
                <View
                  style={[
                    styles.metricBox,
                    {
                      backgroundColor: theme.isLight ? '#F8FAFC' : 'rgba(255,255,255,0.03)',
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                    {sportMeta.metric1Label}
                  </Text>
                  <Text style={[styles.metricVal, { color: theme.colors.textPrimary }]}>
                    {formattedVolume}
                  </Text>
                </View>

                <View
                  style={[
                    styles.metricBox,
                    {
                      backgroundColor: theme.isLight ? '#F8FAFC' : 'rgba(255,255,255,0.03)',
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                    {sportMeta.metric2Label}
                  </Text>
                  <Text style={[styles.metricVal, { color: accentTextColor }]}>
                    {currentPaceLabel}
                  </Text>
                </View>

                <View
                  style={[
                    styles.metricBox,
                    {
                      backgroundColor: theme.isLight ? '#F8FAFC' : 'rgba(255,255,255,0.03)',
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                    {sportMeta.metric4Label}
                  </Text>
                  <Text style={[styles.metricVal, { color: theme.colors.textPrimary }]}>
                    {sportMeta.metric4Value}
                  </Text>
                </View>
              </View>
            )}

            {/* Controles principais */}
            {status === 'idle' ? (
              <PillButton
                label={`Iniciar ${sportMeta.label.toLowerCase()}`}
                onPress={handleStart}
                testID="workout-start-btn"
              />
            ) : status === 'finished' ? (
              <View style={styles.finishedActionsCol}>
                <View
                  style={[
                    styles.finishedBanner,
                    {
                      backgroundColor: theme.colors.successSoft,
                      borderColor: theme.colors.success,
                    },
                  ]}
                >
                  <CheckCircle2 size={18} color={theme.colors.success} />
                  <View style={styles.finishedTextCol}>
                    <Text style={[styles.finishedTitle, { color: theme.colors.textPrimary }]}>
                      Sessão salva no seu histórico
                    </Text>
                    <Text style={[styles.finishedSub, { color: theme.colors.textSecondary }]}>
                      {sportMeta.isGymWorkout
                        ? `${formatTimer(elapsedSec)} · ${currentSportReports.length} registros enviados ao chat`
                        : `${formattedVolume} em ${formatTimer(elapsedSec)}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.controlsRow}>
                  <PillButton
                    label="Ver no chat"
                    onPress={() => navigateToTab('chat')}
                    style={styles.flexOne}
                    testID="workout-goto-chat-btn"
                  />
                  <InteractivePressable
                    onPress={() => navigateToTab('metrics')}
                    style={[
                      styles.secondaryActionBtn,
                      {
                        backgroundColor: theme.colors.surfaceMuted,
                        borderColor: theme.colors.borderStrong,
                      },
                    ]}
                    testID="workout-goto-metrics-btn"
                  >
                    <Text style={[styles.secondaryActionText, { color: theme.colors.textPrimary }]}>
                      Métricas
                    </Text>
                  </InteractivePressable>
                </View>

                <InteractivePressable
                  onPress={() => {
                    setStatus('idle');
                    setElapsedSec(0);
                    setDistanceKm(0);
                    clearWorkoutReports();
                  }}
                  style={styles.newSessionLink}
                >
                  <Text style={[styles.newSessionLinkText, { color: accentTextColor }]}>
                    Iniciar outra sessão
                  </Text>
                </InteractivePressable>
              </View>
            ) : (
              <View style={styles.controlsRow}>
                <InteractivePressable
                  onPress={() =>
                    setStatus((prev) => (prev === 'running' ? 'paused' : 'running'))
                  }
                  style={[
                    styles.controlBtn,
                    {
                      backgroundColor: theme.colors.surfaceMuted,
                      borderColor: theme.colors.borderStrong,
                    },
                  ]}
                  testID="workout-pause-btn"
                >
                  {status === 'running' ? (
                    <Pause size={18} color={theme.colors.textPrimary} />
                  ) : (
                    <Play size={18} color={theme.colors.textPrimary} />
                  )}
                  <Text style={[styles.controlBtnText, { color: theme.colors.textPrimary }]}>
                    {status === 'running' ? 'Pausar' : 'Retomar'}
                  </Text>
                </InteractivePressable>

                <InteractivePressable
                  onPress={handleFinish}
                  style={[
                    styles.finishBtn,
                    {
                      backgroundColor: theme.colors.dangerSoft,
                      borderColor: theme.colors.danger,
                    },
                  ]}
                  testID="workout-finish-btn"
                >
                  <Flag size={17} color={theme.colors.danger} />
                  <Text style={[styles.finishBtnText, { color: theme.colors.danger }]}>
                    Finalizar
                  </Text>
                </InteractivePressable>
              </View>
            )}
          </LinearGradient>

          {/* Reporte ao vivo / Relatório do treino enviado direto ao Chat do Agente */}
          <LinearGradient
            colors={theme.gradients.cardDepth}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.reportCard,
              { borderColor: theme.colors.border },
              cardShadow,
            ]}
          >
            <View style={styles.reportHeaderRow}>
              <Text style={[styles.reportTitle, { color: theme.colors.textPrimary }]}>
                {sportMeta.reportTitle}
              </Text>
              <InteractivePressable
                onPress={() => navigateToTab('chat')}
                style={styles.openChatSmall}
              >
                <MessageSquare size={13} color={accentTextColor} />
                <Text style={[styles.openChatSmallText, { color: accentTextColor }]}>
                  Abrir chat
                </Text>
              </InteractivePressable>
            </View>

            <Text style={[styles.reportHint, { color: theme.colors.textSecondary }]}>
              {sportMeta.isGymWorkout
                ? 'Escreva seu treino e envie para o Vybra acompanhar séries, carga e recuperação.'
                : 'Registre pausas, incômodos ou sensações — vai direto para o chat do Vybra.'}
            </Text>

            <View
              style={[
                styles.reportInputBox,
                {
                  backgroundColor: theme.isLight ? '#F8FAFC' : 'rgba(255,255,255,0.03)',
                  borderColor: theme.colors.borderStrong,
                },
              ]}
            >
              <TextInput
                value={reportDraft}
                onChangeText={setReportDraft}
                placeholder={sportMeta.reportPlaceholder}
                placeholderTextColor={theme.colors.textMuted}
                multiline
                style={[
                  styles.reportInput,
                  sportMeta.isGymWorkout ? styles.reportInputTall : undefined,
                  { color: theme.colors.textPrimary },
                ]}
                testID="workout-report-input"
              />
              <InteractivePressable
                onPress={() => handleSendReport()}
                disabled={!reportDraft.trim()}
                style={[
                  styles.reportSendBtn,
                  {
                    backgroundColor: reportDraft.trim()
                      ? theme.colors.primary
                      : theme.colors.surfaceMuted,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Enviar reporte ao chat do Vybra"
                testID="workout-report-send"
              >
                <Send
                  size={15}
                  color={reportDraft.trim() ? theme.colors.onPrimary : theme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.reportSendText,
                    {
                      color: reportDraft.trim()
                        ? theme.colors.onPrimary
                        : theme.colors.textMuted,
                    },
                  ]}
                >
                  Enviar ao chat
                </Text>
              </InteractivePressable>
            </View>

            {/* Atalhos rápidos sem aparência genérica */}
            <View style={styles.quickTagsRow}>
              {sportMeta.quickReportTags.map((tag) => (
                <InteractivePressable
                  key={tag}
                  onPress={() => handleSendReport(tag)}
                  style={[
                    styles.quickTagBtn,
                    {
                      backgroundColor: theme.isLight ? '#F1F5F9' : 'rgba(255,255,255,0.04)',
                      borderColor: theme.colors.border,
                    },
                  ]}
                  testID={`quick-report-${tag.slice(0, 10)}`}
                >
                  <Text style={[styles.quickTagText, { color: theme.colors.textSecondary }]}>
                    + {tag}
                  </Text>
                </InteractivePressable>
              ))}
            </View>

            {/* Log dos reportes enviados nessa sessão */}
            {currentSportReports.length > 0 ? (
              <View style={[styles.reportLogList, { borderTopColor: theme.colors.border }]}>
                {currentSportReports.map((entry) => (
                  <View key={entry.id} style={styles.reportLogItem}>
                    <Text style={[styles.reportLogTime, { color: accentTextColor }]}>
                      {entry.elapsedLabel}
                    </Text>
                    <Text style={[styles.reportLogText, { color: theme.colors.textPrimary }]}>
                      {entry.text}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </LinearGradient>
        </Animated.View>
      )}
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
  },
  stepWrap: {
    gap: 16,
  },
  selectHeader: {
    gap: 4,
  },
  title: {
    fontFamily: FONTS.extraBold,
    fontSize: 27,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
  },
  sportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  sportGridCell: {
    width: '48.2%',
  },
  sportCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 15,
    minHeight: 132,
    justifyContent: 'space-between',
    gap: 14,
  },
  sportCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sportIconTile: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportCardTextCol: {
    gap: 3,
  },
  sportCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  sportCardDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  backBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
  sessionSportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sessionSportTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 19,
  },
  timerCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  timerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.1,
  },
  reportCounterText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  timerDigits: {
    fontFamily: FONTS.extraBold,
    fontSize: 44,
    letterSpacing: -1,
    textAlign: 'center',
    marginVertical: 2,
  },
  gymSubnote: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingVertical: 11,
    paddingHorizontal: 10,
    gap: 3,
  },
  metricLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
  },
  metricVal: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flexOne: {
    flex: 1,
  },
  controlBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: RADII.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  controlBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  finishBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: RADII.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  finishBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  finishedActionsCol: {
    gap: 12,
  },
  finishedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 12,
  },
  finishedTextCol: {
    flex: 1,
    gap: 2,
  },
  finishedTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
  },
  finishedSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  secondaryActionBtn: {
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  newSessionLink: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  newSessionLinkText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
  reportCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  reportHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  openChatSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingLeft: 6,
  },
  openChatSmallText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
  },
  reportHint: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    lineHeight: 18,
  },
  reportInputBox: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  reportInput: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    minHeight: 54,
    textAlignVertical: 'top',
  },
  reportInputTall: {
    minHeight: 86,
  },
  reportSendBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  reportSendText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
  },
  quickTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTagBtn: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  quickTagText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  reportLogList: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 8,
  },
  reportLogItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  reportLogTime: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    minWidth: 40,
  },
  reportLogText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
