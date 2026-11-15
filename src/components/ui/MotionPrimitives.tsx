import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useVybra } from '../../context/VybraContext';
import { MOTION, RADII } from '../../theme/tokens';
import { triggerSelectionHaptic } from '../../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedEntrance({
  children,
  delay = 0,
  reducedMotion = false,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  reducedMotion?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = useSharedValue(reducedMotion ? 1 : 0);
  const translateY = useSharedValue(reducedMotion ? 0 : 12);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: MOTION.panel, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: MOTION.panel, easing: Easing.out(Easing.cubic) })
    );
  }, [delay, opacity, reducedMotion, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
}

/**
 * Wrapper interativo com animação suave de clique (sem efeito estilingue)
 * para cards, chips, métricas e botões em todo o aplicativo.
 */
export function InteractivePressable({
  children,
  onPress,
  disabled = false,
  scaleTo,
  scaleDown = 0.975,
  style,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityState,
  testID,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  scaleTo?: number;
  scaleDown?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityRole?: 'button' | 'tab' | 'radio' | 'switch';
  accessibilityLabel?: string;
  accessibilityState?: { selected?: boolean; checked?: boolean; disabled?: boolean };
  testID?: string;
}) {
  const scale = useSharedValue(1);
  const targetScale = scaleTo ?? scaleDown;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={() => {
        scale.value = withTiming(targetScale, {
          duration: 110,
          easing: Easing.out(Easing.quad),
        });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, {
          duration: 150,
          easing: Easing.out(Easing.cubic),
        });
      }}
      onPress={() => {
        if (disabled || !onPress) return;
        triggerSelectionHaptic();
        onPress();
      }}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      testID={testID}
      style={[animStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

export function PulseBeacon({
  size = 10,
  color,
  active = true,
  reducedMotion = false,
}: {
  size?: number;
  color?: string;
  active?: boolean;
  reducedMotion?: boolean;
}) {
  const { theme } = useVybra();
  const resolvedColor = color ?? theme.colors.secondary;
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.6);

  useEffect(() => {
    if (!active || reducedMotion) {
      ringScale.value = 1;
      ringOpacity.value = 0;
      return;
    }
    ringScale.value = withRepeat(
      withTiming(2.1, { duration: 1500, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    ringOpacity.value = withRepeat(
      withTiming(0, { duration: 1500, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
  }, [active, reducedMotion, ringOpacity, ringScale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View
      style={{
        width: size * 2.2,
        height: size * 2.2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size,
            backgroundColor: resolvedColor,
          },
          ringStyle,
        ]}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size,
          backgroundColor: resolvedColor,
        }}
      />
    </View>
  );
}

export function TypingDots({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const { theme } = useVybra();
  const d1 = useSharedValue(0);
  const d2 = useSharedValue(0);
  const d3 = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    const bounce = (delayMs: number) =>
      withDelay(
        delayMs,
        withRepeat(
          withSequence(
            withTiming(-4, { duration: 240 }),
            withTiming(0, { duration: 240 })
          ),
          -1,
          false
        )
      );
    d1.value = bounce(0);
    d2.value = bounce(130);
    d3.value = bounce(260);
  }, [d1, d2, d3, reducedMotion]);

  const s1 = useAnimatedStyle(() => ({ transform: [{ translateY: d1.value }] }));
  const s2 = useAnimatedStyle(() => ({ transform: [{ translateY: d2.value }] }));
  const s3 = useAnimatedStyle(() => ({ transform: [{ translateY: d3.value }] }));
  const dotBg = theme.isLight ? theme.colors.primary : theme.colors.secondary;

  return (
    <View style={styles.typingRow}>
      <Animated.View style={[styles.dot, { backgroundColor: dotBg }, s1]} />
      <Animated.View style={[styles.dot, { backgroundColor: dotBg }, s2]} />
      <Animated.View style={[styles.dot, { backgroundColor: dotBg }, s3]} />
    </View>
  );
}

export function AnimatedProgressBar({
  progress,
  height = 8,
  reducedMotion = false,
}: {
  progress: number;
  height?: number;
  reducedMotion?: boolean;
}) {
  const { theme } = useVybra();
  const clamped = Math.max(0, Math.min(1, progress));
  const widthPct = useSharedValue(reducedMotion ? clamped * 100 : 8);

  useEffect(() => {
    if (reducedMotion) {
      widthPct.value = clamped * 100;
      return;
    }
    widthPct.value = withTiming(clamped * 100, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, reducedMotion, widthPct]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${widthPct.value}%`,
  }));

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height,
          backgroundColor: theme.isLight ? theme.colors.surfaceMuted : 'rgba(255, 255, 255, 0.09)',
        },
      ]}
    >
      <Animated.View style={[styles.fillWrap, fillStyle, { borderRadius: height }]}>
        <LinearGradient
          colors={theme.gradients.brandButton}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fillWrap: {
    height: '100%',
    overflow: 'hidden',
  },
});
