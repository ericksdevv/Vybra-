import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useVybra } from '../../context/VybraContext';
import { FONTS, MOTION, RADII, SHADOWS } from '../../theme/tokens';
import { triggerLightHaptic } from '../../utils/haptics';

interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  showArrow?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PillButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  showArrow = true,
  style,
  accessibilityLabel,
  testID,
}: PillButtonProps) {
  const { theme } = useVybra();
  const scale = useSharedValue(1);
  const arrowX = useSharedValue(0);

  const animatedContainer = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedArrow = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowX.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.975, {
      duration: 110,
      easing: Easing.out(Easing.quad),
    });
    arrowX.value = withTiming(5, {
      duration: MOTION.fast,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.cubic),
    });
    arrowX.value = withTiming(0, {
      duration: MOTION.fast,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    triggerLightHaptic();
    onPress();
  };

  const isPrimary = variant === 'primary';

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      testID={testID}
      style={[
        styles.outer,
        theme.useNeonGlow
          ? isPrimary
            ? {
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.38,
                shadowRadius: 16,
                elevation: 8,
              }
            : {
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.14,
                shadowRadius: 10,
                elevation: 3,
              }
          : SHADOWS.card,
        disabled && styles.disabled,
        animatedContainer,
        style,
      ]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={theme.gradients.brandButton}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[
            styles.pillInner,
            {
              borderWidth: 1,
              borderColor: theme.isLight ? 'transparent' : theme.colors.borderAccent,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.onPrimary} size="small" />
          ) : (
            <View style={styles.contentRow}>
              <Text
                style={[styles.primaryText, { color: theme.colors.onPrimary }]}
                numberOfLines={1}
              >
                {label}
              </Text>
              {showArrow ? (
                <Animated.View style={animatedArrow}>
                  <ArrowRight size={18} color={theme.colors.onPrimary} strokeWidth={2.5} />
                </Animated.View>
              ) : null}
            </View>
          )}
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={theme.gradients.surfaceHighlight}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.pillInner,
            {
              borderWidth: 1.5,
              borderColor: theme.isLight ? theme.colors.borderStrong : theme.colors.secondary,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.secondary} size="small" />
          ) : (
            <View style={styles.contentRow}>
              <Text
                style={[styles.secondaryText, { color: theme.colors.textPrimary }]}
                numberOfLines={1}
              >
                {label}
              </Text>
              {showArrow ? (
                <Animated.View style={animatedArrow}>
                  <ArrowRight
                    size={18}
                    color={theme.isLight ? theme.colors.primary : theme.colors.secondary}
                    strokeWidth={2.5}
                  />
                </Animated.View>
              ) : null}
            </View>
          )}
        </LinearGradient>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: RADII.pill,
  },
  pillInner: {
    minHeight: 52,
    borderRadius: RADII.pill,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexShrink: 1,
  },
  primaryText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  secondaryText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  disabled: {
    opacity: 0.55,
  },
});
