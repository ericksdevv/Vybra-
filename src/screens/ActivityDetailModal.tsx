import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Heart, Mountain, Timer, Zap } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SportIcon } from '../components/brand/SportIcons';
import { ElevationProfileChart, RoutePreviewMap } from '../components/charts/Charts';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import { InteractivePressable } from '../components/ui/MotionPrimitives';
import { PillButton } from '../components/ui/PillButton';
import { useVybra } from '../context/VybraContext';
import { FONTS, MOTION, RADII, SHADOWS } from '../theme/tokens';
import { triggerLightHaptic } from '../utils/haptics';

export function ActivityDetailModal() {
  const insets = useSafeAreaInsets();
  const {
    theme,
    selectedActivity,
    reducedMotion,
    selectActivity,
    sendChatMessage,
    navigateToTab,
  } = useVybra();

  const slideY = useSharedValue(reducedMotion ? 0 : 36);
  const opacity = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (!selectedActivity) return;
    if (reducedMotion) {
      slideY.value = 0;
      opacity.value = 1;
      return;
    }
    slideY.value = withSequence(
      withTiming(24, { duration: 0 }),
      withTiming(0, {
        duration: MOTION.panel,
        easing: Easing.out(Easing.cubic),
      })
    );
    opacity.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: MOTION.normal })
    );
  }, [opacity, reducedMotion, selectedActivity, slideY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: slideY.value }],
  }));

  if (!selectedActivity) return null;

  const handleAskVybra = () => {
    const prompt = `Analise meu treino "${selectedActivity.title}" (${selectedActivity.paceLabel})`;
    selectActivity(null);
    sendChatMessage(prompt);
    navigateToTab('chat');
  };

  const accentTextColor = theme.isLight ? theme.colors.primary : theme.colors.secondary;
  const cardShadow = theme.isLight ? SHADOWS.card : undefined;

  return (
    <Modal
      visible={Boolean(selectedActivity)}
      animationType="none"
      transparent
      onRequestClose={() => selectActivity(null)}
    >
      <Animated.View
        style={[
          styles.backdrop,
          { backgroundColor: theme.colors.bg },
          animStyle,
        ]}
      >
        <AmbientBackground reducedMotion={reducedMotion} />

        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top + 12, 22),
              borderBottomColor: theme.colors.border,
              backgroundColor: theme.colors.footerBg,
            },
          ]}
        >
          <InteractivePressable
            onPress={() => {
              triggerLightHaptic();
              selectActivity(null);
            }}
            style={[
              styles.backBtn,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Fechar detalhe da atividade"
            testID="activity-detail-close"
            scaleDown={0.94}
          >
            <ArrowLeft size={18} color={theme.colors.textPrimary} />
          </InteractivePressable>
          <View style={styles.headerMid}>
            <Text
              style={[styles.headerTitle, { color: theme.colors.textPrimary }]}
              numberOfLines={1}
            >
              {selectedActivity.title}
            </Text>
            <Text style={[styles.headerDate, { color: theme.colors.textSecondary }]}>
              {selectedActivity.dateLabel} · {selectedActivity.timeLabel}
            </Text>
          </View>
          <View
            style={[
              styles.sportBadge,
              {
                backgroundColor: theme.colors.primarySoft,
                borderColor: theme.colors.borderAccent,
              },
            ]}
          >
            <SportIcon
              sport={selectedActivity.sport}
              size={18}
              color={theme.colors.textPrimary}
              accentColor={accentTextColor}
            />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + 24, 32) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {selectedActivity.distanceKm > 0 ? (
            <RoutePreviewMap
              routePath={selectedActivity.routePath}
              height={190}
              reducedMotion={reducedMotion}
            />
          ) : null}

          <View style={styles.statsGrid}>
            <LinearGradient
              colors={theme.gradients.cardDepth}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.statCard, { borderColor: theme.colors.border }, cardShadow]}
            >
              <Timer size={15} color={accentTextColor} />
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Duração
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                {selectedActivity.durationLabel}
              </Text>
            </LinearGradient>
            <LinearGradient
              colors={theme.gradients.cardDepth}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.statCard, { borderColor: theme.colors.border }, cardShadow]}
            >
              <Zap size={15} color={accentTextColor} />
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Ritmo
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                {selectedActivity.paceLabel}
              </Text>
            </LinearGradient>
            <LinearGradient
              colors={theme.gradients.cardDepth}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.statCard, { borderColor: theme.colors.border }, cardShadow]}
            >
              <Mountain size={15} color={accentTextColor} />
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Altimetria
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                +{selectedActivity.elevationGainM} m
              </Text>
            </LinearGradient>
            <LinearGradient
              colors={theme.gradients.cardDepth}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.statCard, { borderColor: theme.colors.border }, cardShadow]}
            >
              <Heart size={15} color={accentTextColor} />
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                FC média
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                {selectedActivity.avgHeartRate} bpm
              </Text>
            </LinearGradient>
          </View>

          <ElevationProfileChart
            values={selectedActivity.elevationSeries}
            gainLabel={`+${selectedActivity.elevationGainM} m`}
          />

          <LinearGradient
            colors={theme.gradients.surfaceHighlight}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.analysisCard,
              {
                borderColor: theme.isLight ? theme.colors.border : theme.colors.borderAccent,
              },
              theme.useNeonGlow ? SHADOWS.neonCard : SHADOWS.card,
            ]}
          >
            <View style={styles.analysisTop}>
              <Text style={[styles.analysisTitle, { color: accentTextColor }]}>
                Leitura do Vybra
              </Text>
              <Text
                style={[
                  styles.analysisDelta,
                  {
                    color: selectedActivity.isBetterThanYesterday
                      ? theme.colors.success
                      : theme.colors.warning,
                  },
                ]}
              >
                {selectedActivity.comparisonDeltaLabel}
              </Text>
            </View>
            <Text style={[styles.analysisHeadline, { color: theme.colors.textPrimary }]}>
              {selectedActivity.comparisonHeadline}
            </Text>
            <Text style={[styles.analysisBody, { color: theme.colors.textSecondary }]}>
              {selectedActivity.aiSummary}
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={theme.gradients.cardDepth}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.splitsCard, { borderColor: theme.colors.border }, cardShadow]}
          >
            <Text style={[styles.splitsTitle, { color: theme.colors.textPrimary }]}>
              Parciais por quilômetro
            </Text>
            {selectedActivity.splits.map((s) => (
              <View
                key={s.km}
                style={[styles.splitRow, { borderTopColor: theme.colors.border }]}
              >
                <Text style={[styles.splitKm, { color: theme.colors.textSecondary }]}>
                  Km {s.km}
                </Text>
                <Text style={[styles.splitPace, { color: theme.colors.textPrimary }]}>
                  {s.pace}
                </Text>
                <Text style={[styles.splitElev, { color: accentTextColor }]}>
                  {s.elevationDelta >= 0 ? `+${s.elevationDelta}m` : `${s.elevationDelta}m`}
                </Text>
                <Text style={[styles.splitHr, { color: theme.colors.textSecondary }]}>
                  {s.heartRate} bpm
                </Text>
              </View>
            ))}
          </LinearGradient>

          <PillButton
            label="Discutir este treino no chat"
            onPress={handleAskVybra}
          />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMid: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  headerDate: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  sportBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    marginTop: 2,
  },
  statValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 17,
  },
  analysisCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  analysisTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  analysisTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  analysisDelta: {
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  analysisHeadline: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
  },
  analysisBody: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  splitsCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  splitsTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  splitKm: {
    width: 56,
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
  splitPace: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 13.5,
  },
  splitElev: {
    width: 58,
    fontFamily: FONTS.medium,
    fontSize: 12.5,
  },
  splitHr: {
    width: 68,
    textAlign: 'right',
    fontFamily: FONTS.medium,
    fontSize: 12.5,
  },
});
