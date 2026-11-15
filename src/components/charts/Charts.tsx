import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { useVybra } from '../../context/VybraContext';
import { VybraTheme } from '../../theme/themes';
import { FONTS, RADII, SHADOWS } from '../../theme/tokens';
import { WeeklyVolumeDay } from '../../types/vybra';
import { triggerSelectionHaptic } from '../../utils/haptics';

/* -------------------------------------------------------------------------- */
/* 1. ANEL DE CONSISTÊNCIA / META SEMANAL                                      */
/* -------------------------------------------------------------------------- */

export function ConsistencyRing({
  progress,
  centerValue,
  centerUnit,
  size = 104,
}: {
  progress: number;
  centerValue: string;
  centerUnit: string;
  size?: number;
}) {
  const { theme } = useVybra();
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const strokeDashoffset = circumference * (1 - clamped);
  const gradId = `ringGrad-${theme.id}`;
  const auraId = `ringAura-${theme.id}`;

  return (
    <View style={[styles.ringContainer, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.gradients.ringTrack[0]} />
            <Stop offset="100%" stopColor={theme.gradients.ringTrack[1]} />
          </SvgGradient>
          {theme.useNeonGlow ? (
            <RadialGradient id={auraId} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.24" />
              <Stop offset="100%" stopColor={theme.colors.bg} stopOpacity="0" />
            </RadialGradient>
          ) : null}
        </Defs>
        {theme.useNeonGlow ? (
          <Circle cx={size / 2} cy={size / 2} r={radius - 4} fill={`url(#${auraId})`} />
        ) : null}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.isLight ? theme.colors.border : 'rgba(255,255,255,0.09)'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={[styles.ringValue, { color: theme.colors.textPrimary }]}>
          {centerValue}
        </Text>
        <Text style={[styles.ringUnit, { color: theme.colors.textSecondary }]}>
          {centerUnit}
        </Text>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. GRÁFICO DE BARRAS SEMANAL ANIMADO (INTERATIVO)                          */
/* -------------------------------------------------------------------------- */

function AnimatedBarColumn({
  item,
  maxKm,
  isSelected,
  index,
  reducedMotion,
  theme,
  onSelect,
}: {
  item: WeeklyVolumeDay;
  maxKm: number;
  isSelected: boolean;
  index: number;
  reducedMotion: boolean;
  theme: VybraTheme;
  onSelect: () => void;
}) {
  const maxBarH = 92;
  const targetH = item.km > 0 ? Math.max(16, (item.km / maxKm) * maxBarH) : 7;
  const barHeight = useSharedValue(reducedMotion ? targetH : 7);

  useEffect(() => {
    if (reducedMotion) {
      barHeight.value = targetH;
      return;
    }
    barHeight.value = withDelay(
      index * 40,
      withTiming(targetH, { duration: 360, easing: Easing.out(Easing.cubic) })
    );
  }, [barHeight, index, reducedMotion, targetH]);

  const barStyle = useAnimatedStyle(() => ({
    height: barHeight.value,
  }));

  const active = isSelected || item.isToday;
  const idleTop = theme.isLight ? '#94A3B8' : theme.colors.primarySoft;
  const idleBottom = theme.isLight ? '#CBD5E1' : 'rgba(255,255,255,0.06)';

  return (
    <Pressable
      onPress={onSelect}
      style={styles.barCol}
      accessibilityRole="button"
      accessibilityLabel={`${item.fullDay}: ${item.km} quilômetros`}
    >
      <Text
        style={[
          styles.barTopValue,
          { color: isSelected ? theme.colors.textPrimary : theme.colors.textMuted },
        ]}
      >
        {item.km > 0 ? item.km.toFixed(1) : ''}
      </Text>
      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFillWrap,
            isSelected && theme.useNeonGlow
              ? {
                  shadowColor: theme.colors.secondary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.45,
                  shadowRadius: 8,
                }
              : undefined,
            barStyle,
          ]}
        >
          {item.km === 0 && !item.isToday ? (
            <View
              style={[
                styles.barZero,
                { backgroundColor: theme.isLight ? '#E2E8F0' : 'rgba(255,255,255,0.12)' },
              ]}
            />
          ) : item.isToday && item.km === 0 ? (
            <View
              style={[
                styles.barPlanned,
                {
                  borderColor: theme.colors.borderAccent,
                  backgroundColor: theme.colors.primarySoft,
                },
              ]}
            />
          ) : isSelected ? (
            <LinearGradient
              colors={theme.gradients.brandButton}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <LinearGradient
              colors={[idleTop, idleBottom]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}
        </Animated.View>
      </View>
      <Text
        style={[
          styles.barDayLabel,
          {
            color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
            fontFamily: active ? FONTS.bold : FONTS.medium,
          },
        ]}
      >
        {item.day}
      </Text>
    </Pressable>
  );
}

export function WeeklyVolumeChart({
  data,
  reducedMotion = false,
}: {
  data: WeeklyVolumeDay[];
  reducedMotion?: boolean;
}) {
  const { theme } = useVybra();
  const [selectedIdx, setSelectedIdx] = useState(5);
  const maxKm = Math.max(...data.map((d) => d.km), 8);
  const selected = data[selectedIdx] ?? data[0];

  return (
    <LinearGradient
      colors={theme.gradients.cardDepth}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.chartCard,
        { borderColor: theme.colors.border },
        theme.isLight ? SHADOWS.card : undefined,
      ]}
    >
      <View style={styles.chartHeaderRow}>
        <View style={styles.headerMetaCol}>
          <Text style={[styles.chartTitle, { color: theme.colors.textSecondary }]}>
            VOLUME DA SEMANA
          </Text>
          <Text style={[styles.chartMeta, { color: theme.colors.textSecondary }]}>
            {selected.fullDay} ·{' '}
            <Text style={[styles.chartMetaHighlight, { color: theme.colors.textPrimary }]}>
              {selected.km > 0 ? `${selected.km.toFixed(1)} km` : 'Descanso planejado'}
            </Text>
            {selected.durationMin > 0 ? ` · ${selected.pace}/km` : ''}
          </Text>
        </View>
        <Text style={[styles.chartTotalUnboxed, { color: theme.colors.textPrimary }]}>
          32,4 km
        </Text>
      </View>

      <View style={styles.barsRow}>
        {data.map((item, idx) => (
          <AnimatedBarColumn
            key={item.day}
            item={item}
            maxKm={maxKm}
            isSelected={idx === selectedIdx}
            index={idx}
            reducedMotion={reducedMotion}
            theme={theme}
            onSelect={() => {
              triggerSelectionHaptic();
              setSelectedIdx(idx);
            }}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. GRÁFICO DE LINHA / ÁREA — PACE E ALTIMETRIA                              */
/* -------------------------------------------------------------------------- */

export function PaceTrendChart({
  points,
}: {
  points: Array<{ label: string; paceSec: number; paceStr: string; elev: number }>;
}) {
  const { theme } = useVybra();
  const [selectedIdx, setSelectedIdx] = useState(points.length - 1);
  const width = 300;
  const height = 112;
  const padX = 18;
  const padY = 18;

  const paces = points.map((p) => p.paceSec);
  const minP = Math.min(...paces) - 4;
  const maxP = Math.max(...paces) + 4;

  const coords = points.map((p, idx) => {
    const x = padX + (idx / Math.max(1, points.length - 1)) * (width - padX * 2);
    const norm = (maxP - p.paceSec) / Math.max(1, maxP - minP);
    const y = height - padY - norm * (height - padY * 2);
    return { x, y, ...p };
  });

  const linePath = coords.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = coords[idx - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height} L ${
    coords[0].x
  } ${height} Z`;

  const selected = coords[selectedIdx] ?? coords[coords.length - 1];
  const areaGradId = `paceArea-${theme.id}`;
  const strokeGradId = `paceStroke-${theme.id}`;

  return (
    <LinearGradient
      colors={theme.gradients.cardDepth}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.chartCard,
        { borderColor: theme.colors.border },
        theme.isLight ? SHADOWS.card : undefined,
      ]}
    >
      <View style={styles.paceHeaderStack}>
        <Text style={[styles.chartTitle, { color: theme.colors.textSecondary }]}>
          EVOLUÇÃO DO PACE
        </Text>
        <Text style={[styles.chartMeta, { color: theme.colors.textSecondary }]}>
          {selected.label} ·{' '}
          <Text style={[styles.chartMetaHighlight, { color: theme.colors.textPrimary }]}>
            {selected.paceStr} /km
          </Text>
          {` · +${selected.elev}m elev.`}
        </Text>
        <Text style={[styles.deltaPositiveText, { color: theme.colors.success }]}>
          -32s no mês
        </Text>
      </View>

      <View style={styles.svgWrap}>
        <Svg width="100%" height={116} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <SvgGradient id={areaGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop
                offset="0%"
                stopColor={theme.colors.secondary}
                stopOpacity={theme.isLight ? '0.16' : '0.38'}
              />
              <Stop
                offset="68%"
                stopColor={theme.colors.primary}
                stopOpacity={theme.isLight ? '0.05' : '0.12'}
              />
              <Stop offset="100%" stopColor={theme.colors.bg} stopOpacity="0.0" />
            </SvgGradient>
            <SvgGradient id={strokeGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={theme.colors.primary} />
              <Stop offset="100%" stopColor={theme.colors.secondary} />
            </SvgGradient>
          </Defs>

          <Line
            x1={padX}
            y1={height / 2}
            x2={width - padX}
            y2={height / 2}
            stroke={theme.colors.border}
            strokeDasharray="4 4"
          />

          <Path d={areaPath} fill={`url(#${areaGradId})`} />
          {theme.useNeonGlow ? (
            <Path
              d={linePath}
              fill="none"
              stroke={theme.colors.primarySoft}
              strokeWidth="7"
              strokeLinecap="round"
            />
          ) : null}
          <Path
            d={linePath}
            fill="none"
            stroke={`url(#${strokeGradId})`}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {coords.map((pt, idx) => {
            const active = idx === selectedIdx;
            return (
              <React.Fragment key={pt.label}>
                {active && theme.useNeonGlow ? (
                  <Circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    fill={theme.colors.primarySoft}
                  />
                ) : null}
                <Circle
                  cx={pt.x}
                  cy={pt.y}
                  r={active ? 5 : 3.2}
                  fill={active ? theme.colors.surface : theme.colors.secondary}
                  stroke={theme.colors.primary}
                  strokeWidth={active ? 2.4 : 0}
                />
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      <View style={styles.pointButtonsRow}>
        {points.map((pt, idx) => {
          const active = idx === selectedIdx;
          return (
            <Pressable
              key={pt.label}
              onPress={() => {
                triggerSelectionHaptic();
                setSelectedIdx(idx);
              }}
              style={[
                styles.pointHit,
                active
                  ? {
                      backgroundColor: theme.colors.primarySoft,
                      borderWidth: 1,
                      borderColor: theme.colors.borderAccent,
                    }
                  : undefined,
              ]}
            >
              <Text
                style={[
                  styles.pointLabel,
                  {
                    color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
                    fontFamily: active ? FONTS.bold : FONTS.medium,
                  },
                ]}
              >
                {pt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </LinearGradient>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. PERFIL DE ALTIMETRIA                                                    */
/* -------------------------------------------------------------------------- */

export function ElevationProfileChart({
  values,
  gainLabel,
}: {
  values: number[];
  gainLabel: string;
}) {
  const { theme } = useVybra();
  const width = 300;
  const height = 84;
  const padX = 8;
  const padY = 10;
  const minV = Math.min(...values);
  const maxV = Math.max(...values, minV + 10);

  const coords = values.map((val, idx) => {
    const x = padX + (idx / Math.max(1, values.length - 1)) * (width - padX * 2);
    const norm = (val - minV) / (maxV - minV);
    const y = height - padY - norm * (height - padY * 2);
    return { x, y };
  });

  const linePath = coords.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = coords[idx - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height} L ${
    coords[0].x
  } ${height} Z`;
  const elevId = `elevFill-${theme.id}`;

  return (
    <LinearGradient
      colors={theme.gradients.cardDepth}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.chartCard,
        { borderColor: theme.colors.border },
        theme.isLight ? SHADOWS.card : undefined,
      ]}
    >
      <View style={styles.chartHeaderRow}>
        <Text style={[styles.chartTitle, { color: theme.colors.textSecondary }]}>
          PERFIL DE ALTIMETRIA
        </Text>
        <Text style={[styles.chartMetaHighlight, { color: theme.colors.textPrimary }]}>
          {gainLabel}
        </Text>
      </View>
      <Svg width="100%" height={86} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <SvgGradient id={elevId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop
              offset="0%"
              stopColor={theme.colors.primary}
              stopOpacity={theme.isLight ? '0.18' : '0.42'}
            />
            <Stop offset="100%" stopColor={theme.colors.bg} stopOpacity="0.02" />
          </SvgGradient>
        </Defs>
        <Path d={areaPath} fill={`url(#${elevId})`} />
        <Path
          d={linePath}
          fill="none"
          stroke={theme.colors.secondary}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </Svg>
    </LinearGradient>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. MAPA ESTILIZADO DE ROTA                                                 */
/* -------------------------------------------------------------------------- */

export function RoutePreviewMap({
  routePath,
  height = 156,
  subtitle,
}: {
  routePath: string;
  height?: number;
  live?: boolean;
  subtitle?: string;
  reducedMotion?: boolean;
}) {
  const { theme } = useVybra();
  const routeGradId = `routeGrad-${theme.id}`;
  const mapSpotId = `mapSpot-${theme.id}`;

  return (
    <View
      style={[
        styles.mapWrap,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.mapBg,
        },
        theme.isLight ? SHADOWS.card : undefined,
      ]}
    >
      <View style={{ height }}>
        <Svg width="100%" height={height} viewBox="0 0 300 170">
          <Defs>
            <SvgGradient id={routeGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={theme.colors.primary} />
              <Stop offset="100%" stopColor={theme.colors.secondary} />
            </SvgGradient>
            {theme.useNeonGlow ? (
              <RadialGradient id={mapSpotId} cx="55%" cy="50%" r="60%">
                <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.18" />
                <Stop offset="100%" stopColor={theme.colors.mapBg} stopOpacity="0" />
              </RadialGradient>
            ) : null}
          </Defs>

          <Rect x="0" y="0" width="300" height="170" fill={theme.colors.mapBg} />
          {theme.useNeonGlow ? (
            <Rect x="0" y="0" width="300" height="170" fill={`url(#${mapSpotId})`} />
          ) : null}

          {[34, 68, 102, 136].map((y) => (
            <Line
              key={`h-${y}`}
              x1="0"
              y1={y}
              x2="300"
              y2={y}
              stroke={theme.colors.mapGrid}
              strokeWidth="1"
            />
          ))}
          {[50, 100, 150, 200, 250].map((x) => (
            <Line
              key={`v-${x}`}
              x1={x}
              y1="0"
              x2={x}
              y2="170"
              stroke={theme.colors.mapGrid}
              strokeWidth="1"
            />
          ))}

          <Path
            d="M 8 36 L 292 58 M 16 146 L 288 108 M 118 8 L 148 164 M 212 10 L 188 162"
            stroke={theme.colors.mapStreet}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {theme.useNeonGlow ? (
            <Path
              d={routePath}
              fill="none"
              stroke={theme.colors.primarySoft}
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          <Path
            d={routePath}
            fill="none"
            stroke={`url(#${routeGradId})`}
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <Circle
            cx="28"
            cy="128"
            r="5"
            fill={theme.colors.surface}
            stroke={theme.colors.primary}
            strokeWidth="2"
          />
          <Circle
            cx="256"
            cy="118"
            r="6"
            fill={theme.colors.secondary}
            stroke={theme.colors.surface}
            strokeWidth="2.2"
          />
        </Svg>
      </View>

      {subtitle ? (
        <View
          style={[
            styles.mapCaptionBar,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[styles.mapCaptionText, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 21,
  },
  ringUnit: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    marginTop: 1,
  },
  chartCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  paceHeaderStack: {
    gap: 3,
    marginBottom: 10,
  },
  headerMetaCol: {
    flex: 1,
  },
  chartTitle: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  chartMeta: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    marginTop: 3,
  },
  chartMetaHighlight: {
    fontFamily: FONTS.bold,
  },
  chartTotalUnboxed: {
    fontFamily: FONTS.extraBold,
    fontSize: 16,
    letterSpacing: -0.3,
  },
  deltaPositiveText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    marginTop: 1,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 132,
    paddingTop: 10,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  barTopValue: {
    fontFamily: FONTS.semiBold,
    fontSize: 10.5,
    minHeight: 14,
  },
  barTrack: {
    height: 92,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  barFillWrap: {
    width: 19,
    borderRadius: 7,
    overflow: 'hidden',
  },
  barZero: {
    flex: 1,
    borderRadius: 4,
  },
  barPlanned: {
    flex: 1,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 6,
  },
  barDayLabel: {
    fontSize: 11,
  },
  svgWrap: {
    marginTop: 2,
  },
  pointButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 4,
  },
  pointHit: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
    borderRadius: RADII.sm,
  },
  pointLabel: {
    fontSize: 10.5,
  },
  mapWrap: {
    borderRadius: RADII.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  mapCaptionBar: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderTopWidth: 1,
  },
  mapCaptionText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
});
