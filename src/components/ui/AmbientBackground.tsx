import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { useVybra } from '../../context/VybraContext';

export function AmbientBackground({
  variant = 'default',
  reducedMotion = false,
}: {
  variant?: 'login' | 'default';
  reducedMotion?: boolean;
}) {
  const { theme } = useVybra();
  const pulse = useSharedValue(1);
  const ribbonShift = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion || !theme.useNeonGlow) {
      pulse.value = 1;
      ribbonShift.value = 0;
      return;
    }

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 4800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.96, { duration: 4800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    ribbonShift.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 5400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 5400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [pulse, reducedMotion, ribbonShift, theme.useNeonGlow]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const ribbonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ribbonShift.value }],
  }));

  // Branco Minimalista: fundo claro limpo sem brilho neon
  if (!theme.useNeonGlow) {
    return (
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.bg }]} />
    );
  }

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.bg }]}>
      <Animated.View style={[StyleSheet.absoluteFill, orbStyle]}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 390 844"
          preserveAspectRatio="xMidYMid slice"
        >
          <Defs>
            <RadialGradient id={`topGlow-${theme.id}`} cx="22%" cy="10%" r="58%">
              <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity={variant === 'login' ? '0.32' : '0.20'} />
              <Stop offset="48%" stopColor={theme.colors.secondary} stopOpacity="0.08" />
              <Stop offset="100%" stopColor={theme.colors.bg} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id={`bottomGlow-${theme.id}`} cx="86%" cy="88%" r="54%">
              <Stop offset="0%" stopColor={theme.colors.accentBlue} stopOpacity={variant === 'login' ? '0.28' : '0.18'} />
              <Stop offset="45%" stopColor={theme.colors.primary} stopOpacity="0.10" />
              <Stop offset="100%" stopColor={theme.colors.bg} stopOpacity="0" />
            </RadialGradient>
            <SvgLinearGradient id={`diagBeam-${theme.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0" />
              <Stop offset="48%" stopColor={theme.colors.secondary} stopOpacity={variant === 'login' ? '0.11' : '0.06'} />
              <Stop offset="100%" stopColor={theme.colors.accentBlue} stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>

          <Rect width="390" height="844" fill={theme.colors.bg} />
          <Circle cx="82" cy="88" r="260" fill={`url(#topGlow-${theme.id})`} />
          <Circle cx="335" cy="740" r="245" fill={`url(#bottomGlow-${theme.id})`} />
          <Path
            d="M -40 620 L 210 240 L 295 270 L 35 660 Z"
            fill={`url(#diagBeam-${theme.id})`}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, ribbonStyle]}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 390 844"
          preserveAspectRatio="xMidYMid slice"
        >
          <Defs>
            <SvgLinearGradient id={`ribbonOne-${theme.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0" />
              <Stop offset="55%" stopColor={theme.colors.secondary} stopOpacity={variant === 'login' ? '0.46' : '0.28'} />
              <Stop offset="100%" stopColor={theme.colors.accentBlue} stopOpacity={variant === 'login' ? '0.32' : '0.18'} />
            </SvgLinearGradient>
            <SvgLinearGradient id={`ribbonTwo-${theme.id}`} x1="0%" y1="100%" x2="100%" y2="10%">
              <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0" />
              <Stop offset="60%" stopColor={theme.colors.accentBlue} stopOpacity={variant === 'login' ? '0.38' : '0.22'} />
              <Stop offset="100%" stopColor={theme.colors.accentGlow} stopOpacity={variant === 'login' ? '0.26' : '0.14'} />
            </SvgLinearGradient>
          </Defs>

          <Path
            d="M 160 854 C 240 770, 320 715, 410 660 L 410 725 C 330 765, 260 808, 210 854 Z"
            fill={`url(#ribbonOne-${theme.id})`}
          />
          <Path
            d="M 238 854 C 300 792, 355 752, 410 724 L 410 788 C 362 806, 320 828, 286 854 Z"
            fill={`url(#ribbonTwo-${theme.id})`}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
